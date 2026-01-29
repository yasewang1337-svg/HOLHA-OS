

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { KnowledgeNode } from '../types';

interface KnowledgeGraphProps {
  data: KnowledgeNode[];
  onNodeSelect?: (node: KnowledgeNode | null) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Track discovery time of nodes to highlight fresh intel (Value -> Timestamp)
  const freshnessMap = useRef<Map<string, number>>(new Map());
  
  // Store previous simulation positions to prevent layout reset on updates
  const prevNodesRef = useRef<Map<string, d3.SimulationNodeDatum>>(new Map());
  
  // Force update trigger for freshness expiration animation
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    
    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;
    const now = Date.now();
    const FRESHNESS_WINDOW = 10000; // 10 seconds to fade out

    // 1. Update Freshness Tracking
    if (data) {
        data.forEach(d => {
            const key = `${d.type}::${d.value}`;
            // Only set timestamp if we haven't seen this node before
            if (!freshnessMap.current.has(key)) {
                freshnessMap.current.set(key, now);
            }
        });
    }

    let minTimeToExpiration = Infinity;

    // 2. Prepare Data with Freshness Ratio
    const centerNode = { 
        id: 'TARGET', 
        type: 'ROOT', 
        value: 'TARGET_ZONE', 
        r: 15, 
        color: '#ffffff', 
        isFresh: false,
        freshnessRatio: 0,
        x: prevNodesRef.current.get('TARGET')?.x || width / 2,
        y: prevNodesRef.current.get('TARGET')?.y || height / 2,
    };
    
    const nodes = [
        centerNode,
        ...(data || []).map((d) => {
            const key = `${d.type}::${d.value}`;
            const discoveredAt = freshnessMap.current.get(key) || 0;
            const age = now - discoveredAt;
            const isFresh = age < FRESHNESS_WINDOW;
            // Ratio goes from 1.0 (just found) to 0.0 (10s old)
            const freshnessRatio = isFresh ? Math.max(0, 1 - (age / FRESHNESS_WINDOW)) : 0;
            
            if (isFresh) {
                const timeLeft = FRESHNESS_WINDOW - age;
                if (timeLeft > 0 && timeLeft < minTimeToExpiration) {
                    minTimeToExpiration = timeLeft;
                }
            }

            const prevNode = prevNodesRef.current.get(key);
            
            // Special coloring for Threat Actors
            let baseColor = '#3b82f6'; // Blue default
            if (d.type === 'VULN') baseColor = '#ff003c';
            else if (d.type === 'CREDENTIAL') baseColor = '#f59e0b';
            
            // If the node has a threat actor profile, it glows purple/red
            if (d.threat_actor) baseColor = '#bd00ff';

            return {
                id: key,
                ...d,
                r: d.type === 'VULN' ? 8 : 5,
                color: baseColor,
                isFresh,
                freshnessRatio,
                // Preserve physics state if available
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

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .on("click", () => onNodeSelect && onNodeSelect(null)); // Deselect on background click

    if (!data || data.length === 0) {
        svg.append("text")
           .attr("x", width/2)
           .attr("y", height/2)
           .attr("text-anchor", "middle")
           .attr("fill", "#4b5563")
           .attr("font-family", "monospace")
           .attr("font-size", "10px")
           .text("NO INTEL DETECTED");
        return;
    }

    // Force Directed Layout
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(20))
      .alphaDecay(0.05);

    const link = svg.append("g")
      .attr("stroke", "#2a2a35")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d: any) => {
          event.stopPropagation();
          // Extract original node data
          const originalNode: KnowledgeNode = {
              type: d.type,
              value: d.value,
              current_utility: d.current_utility,
              threat_actor: d.threat_actor,
              ttps: d.ttps
          };
          if (d.type !== 'ROOT' && onNodeSelect) {
              onNodeSelect(originalNode);
          }
      });

    // --- FRESHNESS RIPPLE EFFECT (D3 Transition Loop) ---
    // Only applied to fresh nodes
    nodeGroup.filter((d: any) => d.isFresh && d.type !== 'ROOT')
      .each(function(d: any) {
          const g = d3.select(this);
          
          const repeatRipple = () => {
              // Create a circle that expands and fades
              g.append("circle")
               .attr("r", d.r)
               .attr("stroke", d.color)
               .attr("stroke-width", 2)
               .attr("fill", "none")
               .attr("opacity", d.freshnessRatio) // Fade base opacity with age
               .transition()
               .duration(2000)
               .ease(d3.easeExpOut)
               .attr("r", d.r + 30) // Expand radius
               .attr("opacity", 0)  // Fade out
               .remove()
               .on("end", () => {
                   // Continue pulsing if still considered fresh
                   // We use the boolean isFresh here, but in reality 
                   // we might want to check if component is still mounted
                   if (d.isFresh) {
                       repeatRipple();
                   }
               });
          };
          
          repeatRipple();
      });

    // --- PULSING RING (Static Indicator) ---
    // A persistent ring that fades out over 10s
    nodeGroup.filter((d: any) => d.isFresh && d.type !== 'ROOT')
      .append("circle")
      .attr("r", (d: any) => d.r + 6)
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 1)
      .attr("opacity", (d: any) => d.freshnessRatio * 0.6)
      .attr("class", "animate-pulse-fast");
      
    // --- THREAT ACTOR HALO (Static Indicator) ---
    // Nodes with attribution get a specific halo
    nodeGroup.filter((d: any) => !!d.threat_actor)
      .append("circle")
      .attr("r", (d: any) => d.r + 4)
      .attr("fill", "none")
      .attr("stroke", "#bd00ff")
      .attr("stroke-dasharray", "2,2")
      .attr("stroke-width", 1)
      .attr("class", "animate-spin-slow");

    // --- NEW LABEL ---
    nodeGroup.filter((d: any) => d.isFresh && d.type !== 'ROOT')
      .append("text")
      .text("NEW")
      .attr("x", 12)
      .attr("y", -12)
      .attr("fill", "#00ff9d")
      .attr("font-size", "7px")
      .attr("font-weight", "bold")
      .attr("font-family", "monospace")
      .attr("opacity", (d: any) => d.freshnessRatio)
      .style("pointer-events", "none");

    // --- NODE BODY ---
    nodeGroup.append("circle")
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "#0a0a0f")
      .attr("stroke-width", 1);
      
    // Tooltip
    nodeGroup.append("title").text((d: any) => `${d.type}: ${d.value} ${d.threat_actor ? `[${d.threat_actor}]` : ''}`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup
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

    // Schedule updates for smoothness of fading
    let timeoutId: NodeJS.Timeout;
    if (minTimeToExpiration !== Infinity) {
        // Update at least every second to refresh freshnessRatio
        timeoutId = setTimeout(() => {
            setTick(t => t + 1);
        }, 1000); 
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
