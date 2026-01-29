import React, { useEffect, useRef, useState } from 'react';
import { 
    select, 
    forceSimulation, 
    forceLink, 
    forceManyBody, 
    forceCenter, 
    forceCollide, 
    drag, 
    easeLinear, 
    easeExpOut, 
    arc, 
    SimulationNodeDatum 
} from 'd3';
import { KnowledgeNode } from '../types';

interface KnowledgeGraphProps {
  data: KnowledgeNode[];
  onNodeSelect?: (node: KnowledgeNode | null) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Track discovery/update time of nodes
  // Key -> { discoveryTs: time of "freshness" start, lastSeen: time of last render, hash: content hash, createdAt: first ever seeing }
  const freshnessMap = useRef<Map<string, { discoveryTs: number, lastSeen: number, hash: string, createdAt: number }>>(new Map());
  
  // Store previous simulation positions to prevent layout reset
  const prevNodesRef = useRef<Map<string, SimulationNodeDatum>>(new Map());
  
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    
    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;
    const now = Date.now();
    const FRESHNESS_WINDOW = 10000; // 10 seconds
    const DECAY_WINDOW = 30000;     // 30 seconds for decay

    // --- 1. Refined Freshness Logic ---
    if (data) {
        data.forEach(d => {
            const key = `${d.type}::${d.value}`;
            const contentHash = JSON.stringify({
                actor: d.threat_actor,
                ttps: d.ttps,
                pocs: d.pocs,
                type: d.type
            });

            const existing = freshnessMap.current.get(key);
            
            if (!existing) {
                // Brand New
                freshnessMap.current.set(key, { discoveryTs: now, lastSeen: now, hash: contentHash, createdAt: now });
            } else {
                const timeSinceLastSeen = now - existing.lastSeen;
                
                if (existing.hash !== contentHash) {
                     // Content Update -> Fresh
                     freshnessMap.current.set(key, { ...existing, discoveryTs: now, lastSeen: now, hash: contentHash });
                } else if (timeSinceLastSeen > FRESHNESS_WINDOW) {
                     // Resurrection (Was gone > 10s, now back) -> Fresh / New
                     freshnessMap.current.set(key, { discoveryTs: now, lastSeen: now, hash: contentHash, createdAt: now });
                } else {
                     // Persist -> Just update lastSeen
                     freshnessMap.current.set(key, { ...existing, lastSeen: now });
                }
            }
        });
    }

    // --- 2. Prepare Display Data ---
    let minTimeToExpiration = Infinity;

    const centerNode = { 
        id: 'TARGET', 
        type: 'ROOT', 
        value: 'TARGET_ZONE', 
        r: 15, 
        color: '#ffffff', 
        opacity: 1,
        isFresh: false,
        isNew: false,
        isDecayed: false,
        freshnessRatio: 0,
        x: prevNodesRef.current.get('TARGET')?.x || width / 2,
        y: prevNodesRef.current.get('TARGET')?.y || height / 2,
    };
    
    const nodes = [
        centerNode,
        ...(data || []).map((d) => {
            const key = `${d.type}::${d.value}`;
            const entry = freshnessMap.current.get(key);
            
            const discoveryTs = entry ? entry.discoveryTs : 0;
            const age = now - discoveryTs;
            const isFresh = age < FRESHNESS_WINDOW;
            const isDecayed = age > DECAY_WINDOW;
            const isNew = entry ? (Math.abs(entry.createdAt - entry.discoveryTs) < 100) : true;

            const freshnessRatio = isFresh ? Math.max(0, 1 - (age / FRESHNESS_WINDOW)) : 0;
            
            // Scheduling ticks for animations
            if (isFresh) {
                const timeLeft = FRESHNESS_WINDOW - age;
                if (timeLeft > 0 && timeLeft < minTimeToExpiration) {
                    minTimeToExpiration = timeLeft;
                }
            }
            if (!isDecayed) {
                const timeToDecay = DECAY_WINDOW - age;
                if (timeToDecay > 0 && timeToDecay < minTimeToExpiration) {
                    minTimeToExpiration = timeToDecay;
                }
            }

            const prevNode = prevNodesRef.current.get(key);
            
            let baseColor = '#3b82f6'; 
            if (d.type === 'VULN') baseColor = '#ff003c';
            else if (d.type === 'CREDENTIAL') baseColor = '#f59e0b';
            if (d.threat_actor) baseColor = '#bd00ff';
            
            let opacity = 1;

            if (isDecayed) {
                baseColor = '#4b5563'; // Gray
                opacity = 0.5; // Faded
            }

            return {
                id: key,
                ...d,
                r: d.type === 'VULN' ? 8 : 5,
                color: baseColor,
                opacity,
                isFresh,
                isNew,
                isDecayed,
                freshnessRatio,
                x: prevNode?.x,
                y: prevNode?.y,
                vx: prevNode?.vx,
                vy: prevNode?.vy
            };
        })
    ];

    const links = (data || []).map((d) => ({
        source: 'TARGET',
        target: `${d.type}::${d.value}`,
    }));

    // --- 3. D3 Render with Joins (Stable Animations) ---
    const svg = select(svgRef.current);
    
    // Define Glow Filter
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "fresh-glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    // Ensure Group Layers
    let linkGroup = svg.select<SVGGElement>(".links");
    if (linkGroup.empty()) linkGroup = svg.append("g").attr("class", "links");

    let nodeGroup = svg.select<SVGGElement>(".nodes");
    if (nodeGroup.empty()) nodeGroup = svg.append("g").attr("class", "nodes");
    
    // Background click to deselect
    svg.on("click", () => onNodeSelect && onNodeSelect(null));

    // Simulation
    const simulation = forceSimulation(nodes as any)
      .force("link", forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", forceManyBody().strength(-100))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide().radius(25))
      .alpha(0.3) // Keep it lively but not crazy
      .alphaDecay(0.05);

    // LINKS JOIN
    const linkSelection = linkGroup.selectAll<SVGLineElement, any>("line")
        .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

    linkSelection.exit().remove();

    const linkEnter = linkSelection.enter().append("line")
        .attr("stroke", "#2a2a35")
        .attr("stroke-width", 1);
        
    const linkMerge = linkEnter.merge(linkSelection);

    // NODES JOIN
    const nodeSelection = nodeGroup.selectAll<SVGGElement, any>("g")
        .data(nodes, (d: any) => d.id);

    // EXIT
    nodeSelection.exit()
        .transition().duration(500).attr("opacity", 0)
        .remove();

    // ENTER
    const nodeEnter = nodeSelection.enter().append("g")
        .attr("cursor", "pointer")
        .attr("opacity", 0)
        .call(drag<SVGGElement, any>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", (event, d: any) => {
            event.stopPropagation();
            const originalNode: KnowledgeNode = {
                type: d.type,
                value: d.value,
                current_utility: d.current_utility,
                threat_actor: d.threat_actor,
                ttps: d.ttps,
                pocs: d.pocs
            };
            if (d.type !== 'ROOT' && onNodeSelect) {
                onNodeSelect(originalNode);
            }
        });
    
    nodeEnter.transition().duration(500).attr("opacity", 1);

    // Node Body
    nodeEnter.append("circle")
        .attr("class", "body")
        .attr("r", (d: any) => d.r)
        .attr("fill", (d: any) => d.color)
        .attr("stroke", "#0a0a0f")
        .attr("stroke-width", 1);

    // Pulse Ring (Static but faded)
    nodeEnter.append("circle")
        .attr("class", "pulse-ring")
        .attr("r", (d: any) => d.r + 6)
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0);

    // Temporal Countdown Arc
    nodeEnter.append("path")
        .attr("class", "timer-arc")
        .attr("fill", "none")
        .attr("opacity", 0);

    // Label
    nodeEnter.append("text")
        .attr("class", "label")
        .attr("x", 14)
        .attr("y", -14)
        .attr("font-size", "7px")
        .attr("font-weight", "bold")
        .attr("font-family", "monospace")
        .style("pointer-events", "none");

    // Tooltip
    nodeEnter.append("title");

    // MERGE (Update existing nodes)
    const nodeMerge = nodeEnter.merge(nodeSelection);

    // Update Props
    nodeMerge.select(".body")
        .transition().duration(500)
        .attr("fill", (d: any) => d.color)
        .attr("fill-opacity", (d: any) => d.opacity)
        .attr("stroke", (d: any) => d.isDecayed ? "#1f2937" : "#0a0a0f")
        .attr("r", (d: any) => d.r);

    nodeMerge.select("title")
        .text((d: any) => {
            let tooltip = `${d.type}: ${d.value}`;
            if (d.threat_actor) tooltip += `\nACTOR: ${d.threat_actor}`;
            if (d.ttps && d.ttps.length > 0) tooltip += `\nTTPs: ${d.ttps.join(', ')}`;
            if (d.isDecayed) tooltip += `\n[STALE]`;
            return tooltip;
        });

    // Update Pulse Ring & Labels & Temporal Arc based on Freshness
    nodeMerge.each(function(d: any) {
        const g = select(this);
        const ring = g.select(".pulse-ring");
        const label = g.select(".label");
        const timer = g.select<SVGPathElement>(".timer-arc");
        const body = g.select(".body");
        
        if (d.isFresh && d.type !== 'ROOT') {
            const freshColor = d.isNew ? '#00ff9d' : '#00f0ff';
            const opacity = d.freshnessRatio * 0.9;
            
            // Apply Glow
            body.attr("filter", "url(#fresh-glow)");

            // Pulse Ring Visibility
            ring.attr("stroke", freshColor)
                .attr("class", "pulse-ring animate-pulse-fast")
                .transition().duration(100).ease(easeLinear)
                .attr("opacity", opacity);

            // Label
            label.text(d.isNew ? "NEW" : "UPD")
                 .attr("fill", freshColor)
                 .transition().duration(100).ease(easeLinear)
                 .attr("opacity", d.freshnessRatio);

            // Temporal Countdown Arc
            const timerArc = arc()
                .innerRadius(d.r + 7) 
                .outerRadius(d.r + 9)
                .startAngle(0)
                .endAngle(2 * Math.PI * d.freshnessRatio); // Deplete clockwise

            timer
                .attr("fill", freshColor)
                .attr("d", timerArc(d as any))
                .transition().duration(100).ease(easeLinear)
                .attr("opacity", opacity);

            // Active Ripple Logic (Only if high freshness)
            if (d.freshnessRatio > 0.8 && g.selectAll(".ripple").empty()) {
                g.append("circle")
                 .attr("class", "ripple")
                 .attr("r", d.r)
                 .attr("stroke", freshColor)
                 .attr("stroke-width", 2)
                 .attr("fill", "none")
                 .attr("opacity", 1)
                 .transition()
                 .duration(1500)
                 .ease(easeExpOut)
                 .attr("r", d.r + 30)
                 .attr("opacity", 0)
                 .remove();
            }

        } else {
            body.attr("filter", null);
            ring.transition().duration(500).attr("opacity", 0).attr("class", "pulse-ring");
            label.transition().duration(500).attr("opacity", 0);
            timer.transition().duration(500).attr("opacity", 0);
        }
        
        // Threat Actor Halo
        if (d.threat_actor) {
             // If decayed, remove halo or dim it? Let's keep it but dim logic might be handled by parent group opacity if we applied it there, but we applied to .body fill-opacity.
             // Let's explicitly check decay for halo stroke
             const haloStroke = d.isDecayed ? "#4b5563" : "#bd00ff";
             
             if (g.select(".halo").empty()) {
                 g.append("circle")
                  .attr("class", "halo")
                  .attr("r", d.r + 4)
                  .attr("fill", "none")
                  .attr("stroke", haloStroke)
                  .attr("stroke-width", 1)
                  .attr("class", "animate-spin-slow");
             } else {
                 g.select(".halo")
                  .attr("stroke", haloStroke)
                  .attr("opacity", d.isDecayed ? 0.3 : 1);
             }
        } else {
            g.select(".halo").remove();
        }
    });

    simulation.on("tick", () => {
        linkMerge
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

        nodeMerge
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        nodes.forEach((n: any) => {
            prevNodesRef.current.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy });
        });
    });

    function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Schedule next tick if needed
    let timeoutId: NodeJS.Timeout;
    if (minTimeToExpiration !== Infinity) {
        timeoutId = setTimeout(() => {
            setTick(t => t + 1);
        }, 100); // 100ms refresh for smooth arc animation
    }

    return () => {
        simulation.stop();
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [data, tick, onNodeSelect]);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};