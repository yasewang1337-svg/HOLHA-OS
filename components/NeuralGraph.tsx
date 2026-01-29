
import React, { useEffect, useRef } from 'react';
import { 
    select, 
    forceSimulation, 
    forceManyBody, 
    forceCollide, 
    forceCenter, 
    forceX, 
    forceY, 
    forceLink, 
    drag, 
    easeExpOut, 
    easeLinear,
    SimulationNodeDatum
} from 'd3';
import { OS_KERNELS, INITIAL_NEURAL_LINKS, MODULE_MAPPING } from '../constants';
import { KernelID, OSState } from '../types';

interface KernelGraphProps {
  onSelectNode: (id: KernelID) => void;
  activeNode: KernelID | null;
  currentOS: OSState | null;
  onSimulatePlasticity?: () => void;
  battleMode?: boolean;
}

interface BattleAgent extends SimulationNodeDatum {
    id: string;
    team: 'RED' | 'BLUE' | 'GREEN';
    power: number;
    r: number;
}

export const NeuralGraph: React.FC<KernelGraphProps> = ({ onSelectNode, activeNode, currentOS, onSimulatePlasticity, battleMode = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const battleAgentsRef = useRef<BattleAgent[]>([]);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    // Detect Burst Mode (High Syndicate Probability)
    const fluidState = currentOS?.current_fluid_context?.fluid_state;
    const isBurstMode = (fluidState?.syndicate_probability || 0) > 0.8;

    // Clear previous
    select(svgRef.current).selectAll("*").remove();

    const svg = select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Glow Filter
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    // Burst Mode Background Effect
    if (isBurstMode && !battleMode) {
        wrapperRef.current.style.boxShadow = "inset 0 0 50px rgba(255, 0, 60, 0.2)";
        wrapperRef.current.style.borderColor = "rgba(255, 0, 60, 0.5)";
    } else {
        wrapperRef.current.style.boxShadow = "none";
        wrapperRef.current.style.borderColor = ""; 
    }

    if (battleMode) {
        // --- BATTLE ROYALE MODE ---
        
        // Initialize agents if empty
        if (battleAgentsRef.current.length === 0) {
            const teams: ('RED' | 'BLUE' | 'GREEN')[] = ['RED', 'BLUE', 'GREEN'];
            battleAgentsRef.current = Array.from({ length: 40 }, (_, i) => ({
                id: `agent-${i}`,
                team: teams[i % 3],
                power: Math.random() * 100,
                r: 6 + Math.random() * 6,
                x: width/2 + (Math.random() - 0.5) * 50,
                y: height/2 + (Math.random() - 0.5) * 50
            }));
        }

        const agents = battleAgentsRef.current;
        const colorMap = { RED: '#ff003c', BLUE: '#00f0ff', GREEN: '#00ff9d' };
        
        // Explosions Layer (Must be created before agents to be behind, or after to be on top)
        const explosionGroup = svg.append("g").attr("class", "explosions");

        // FIX: Define helper BEFORE usage in simulation.on('tick')
        const spawnExplosion = (x: number, y: number, color: string) => {
            const particles = Array.from({ length: 8 });
            explosionGroup.selectAll(".p") // Use a class selector that won't match existing
                .data(particles)
                .enter()
                .append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 2)
                .attr("fill", color)
                .transition()
                .duration(600)
                .ease(easeExpOut)
                .attr("cx", () => x + (Math.random() - 0.5) * 50)
                .attr("cy", () => y + (Math.random() - 0.5) * 50)
                .attr("opacity", 0)
                .remove();
        };

        const simulation = forceSimulation<BattleAgent>(agents)
            .force("charge", forceManyBody().strength(-20))
            .force("collide", forceCollide().radius((d: any) => d.r + 2))
            .force("center", forceCenter(width / 2, height / 2).strength(0.05))
            .force("x", forceX(width/2).strength(0.01))
            .force("y", forceY(height/2).strength(0.01))
            .alphaDecay(0); // Never stop moving

        const agentGroup = svg.append("g")
            .selectAll("circle")
            .data(agents, (d) => d.id)
            .join("circle")
            .attr("r", (d) => d.r)
            .attr("fill", (d) => colorMap[d.team])
            .attr("filter", "url(#glow)")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        // Combat Logic Tick
        simulation.on("tick", () => {
            agentGroup
                .attr("cx", (d) => d.x!)
                .attr("cy", (d) => d.y!);

            // Simple Combat Resolution
            const deadIds = new Set<string>();

            for (let i = 0; i < agents.length; i++) {
                if (deadIds.has(agents[i].id)) continue;

                for (let j = i + 1; j < agents.length; j++) {
                    if (deadIds.has(agents[j].id)) continue;

                    const a = agents[i];
                    const b = agents[j];
                    
                    if (a.team === b.team) continue; // Friendly

                    const dx = (a.x || 0) - (b.x || 0);
                    const dy = (a.y || 0) - (b.y || 0);
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < (a.r + b.r)) {
                        // Combat!
                        if (a.power > b.power) {
                            deadIds.add(b.id);
                            spawnExplosion(b.x || 0, b.y || 0, colorMap[b.team]);
                            a.power -= b.power * 0.5; // Damage winner
                            a.r += 2; // Winner grows
                        } else {
                            deadIds.add(a.id);
                            spawnExplosion(a.x || 0, a.y || 0, colorMap[a.team]);
                            b.power -= a.power * 0.5;
                            b.r += 2;
                        }
                    }
                }
            }

            if (deadIds.size > 0) {
                const survivors = agents.filter(a => !deadIds.has(a.id));
                battleAgentsRef.current = survivors;
                
                // Visual Death
                deadIds.forEach(id => {
                    agentGroup.filter((d: any) => d.id === id)
                        .transition().duration(200)
                        .attr("r", 0)
                        .remove();
                });
                
                // Restart sim with new nodes
                simulation.nodes(survivors);
                simulation.alpha(1).restart();
            }
        });

        return () => {
            simulation.stop();
        };

    } else {
        // --- NORMAL NEURAL MODE ---
        // Reset battle agents for next time
        battleAgentsRef.current = [];

        // Use dynamic weights from OSState if available, otherwise default
        const linksData = currentOS?.neural_weights.map(w => ({...w})) || INITIAL_NEURAL_LINKS.map(l => ({...l, weight: 2}));
        const nodesData = OS_KERNELS.map(n => ({
            ...n, 
            // Dynamic activity radius
            activity: currentOS ? currentOS.kernels[n.id].activity : 20 
        }));

        // Identify active paths based on traffic logs (True Multi-directional Science)
        const trafficSet = new Set<string>();
        if (currentOS?.mesh_network?.traffic_log) {
            currentOS.mesh_network.traffic_log.slice(-10).forEach(msg => {
                if (msg.to !== 'BROADCAST') {
                    trafficSet.add(`${msg.from}-${msg.to}`);
                }
            });
        }

        // Identify active path based on orchestrated modules (Planned Path)
        const activeRouteSet = new Set<string>();
        const modules = currentOS?.router_decision?.orchestrated_modules || [];
        if (modules.length > 1) {
            for (let i = 0; i < modules.length - 1; i++) {
                const sourceKernel = MODULE_MAPPING[modules[i].name] || MODULE_MAPPING[modules[i].id];
                const targetKernel = MODULE_MAPPING[modules[i+1].name] || MODULE_MAPPING[modules[i+1].id];
                if (sourceKernel && targetKernel) {
                    activeRouteSet.add(`${sourceKernel}-${targetKernel}`);
                }
            }
        }

        // Force Directed Layout
        const simulation = forceSimulation(nodesData as any)
        .force("link", forceLink<any, any>(linksData).id((d) => d.id).distance(140))
        .force("charge", forceManyBody().strength(-1200))
        .force("center", forceCenter(width / 2, height / 2))
        .force("collide", forceCollide().radius(60));

        // Links (Axons)
        const link = svg.append("g")
        .selectAll("line")
        .data(linksData)
        .join("line")
        .attr("stroke", (d: any) => {
            const fwd = `${d.source.id || d.source}-${d.target.id || d.target}`;
            const rev = `${d.target.id || d.target}-${d.source.id || d.source}`;
            if (isBurstMode) return '#ff003c'; // Red links in burst mode
            return (activeRouteSet.has(fwd) || activeRouteSet.has(rev)) ? '#00f0ff' : '#4b5563';
        })
        .attr("stroke-opacity", (d: any) => {
            const fwd = `${d.source.id || d.source}-${d.target.id || d.target}`;
            const rev = `${d.target.id || d.target}-${d.source.id || d.source}`;
            return (activeRouteSet.has(fwd) || activeRouteSet.has(rev) || isBurstMode) ? 1 : 0.4;
        })
        .attr("stroke-width", (d: any) => {
            const fwd = `${d.source.id || d.source}-${d.target.id || d.target}`;
            const rev = `${d.target.id || d.target}-${d.source.id || d.source}`;
            return (activeRouteSet.has(fwd) || activeRouteSet.has(rev) || isBurstMode) ? 3 : (d.weight || 1);
        }) 
        .attr("class", "transition-all duration-1000");

        // Nodes Group
        const node = svg.append("g")
        .selectAll("g")
        .data(nodesData)
        .join("g")
        .call(drag<SVGGElement, any>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        // Node "Soma" (Body) - Pulsing
        // Burst Mode: Rapid Red Pulse
        if (isBurstMode) {
            node.each(function(d: any) {
                const g = select(this);
                const baseR = 25 + (d.activity / 10);
                
                // Continuous Rapid Pulse Loop - using a named function expression to be safe
                const pulse = () => {
                    g.append("circle")
                     .attr("r", baseR)
                     .attr("fill", "none")
                     .attr("stroke", "#ff003c")
                     .attr("stroke-width", 2)
                     .attr("opacity", 1)
                     .transition()
                     .duration(600)
                     .ease(easeExpOut)
                     .attr("r", baseR + 25)
                     .attr("opacity", 0)
                     .remove()
                     .on("end", pulse); 
                };
                pulse();
            });
        }

        node.append("circle")
        .attr("r", (d: any) => 25 + (d.activity / 10)) // Size based on activity
        .attr("fill", (d) => isBurstMode ? '#3f0000' : d.color) // Dark red center in burst
        .attr("fill-opacity", isBurstMode ? 0.5 : 0.2)
        .attr("filter", "url(#glow)")
        .attr("class", "transition-all duration-500");

        node.append("circle")
        .attr("r", 20)
        .attr("fill", "#0a0a0f")
        .attr("stroke", (d) => {
            if (activeNode === d.id) return '#ffffff';
            if (isBurstMode) return '#ff003c';
            return d.color;
        })
        .attr("stroke-width", (d) => d.id === activeNode ? 3 : 2)
        .attr("cursor", "pointer")
        .on("click", (event, d) => onSelectNode(d.id));

        // Labels
        node.append("text")
        .text((d) => d.name.split(' ')[0]) 
        .attr("x", 0)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#e0e0e0")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .style("pointer-events", "none");

        node.append("text")
        .text((d) => d.name.split(' ')[1] || '') 
        .attr("x", 0)
        .attr("y", 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .style("pointer-events", "none");

        // --- MULTI-DIRECTIONAL PARTICLE SYSTEM ---
        const particles = svg.append("g").attr("class", "particles");
        
        // Helper function for particle animation
        const animateParticle = (selection: any, pathData: any, dir: 'fwd' | 'rev') => {
            const start = dir === 'fwd' ? pathData.source : pathData.target;
            const end = dir === 'fwd' ? pathData.target : pathData.source;
            
            // Speed up in burst mode
            const duration = isBurstMode 
                ? (600 + Math.random() * 300) 
                : (1000 + Math.random() * 500);

            selection
                .attr("cx", start.x)
                .attr("cy", start.y)
                .attr("opacity", 1)
                .transition()
                .duration(duration)
                .ease(easeLinear)
                .attr("cx", end.x)
                .attr("cy", end.y)
                .on("end", function(this: any) {
                    animateParticle(select(this), pathData, dir);
                });
        };

        const spawnParticle = (pathData: any, dir: 'fwd' | 'rev', color: string) => {
            const particle = particles.append("circle")
                .attr("r", isBurstMode ? 4 : 3)
                .attr("fill", color)
                .attr("filter", "url(#glow)");
            
            animateParticle(particle, pathData, dir);
        };

        linksData.forEach((l: any) => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            
            const fwdKey = `${sourceId}-${targetId}`;
            const revKey = `${targetId}-${sourceId}`;

            // Determine activation
            const fwdActive = trafficSet.has(fwdKey) || activeRouteSet.has(fwdKey) || isBurstMode;
            const revActive = trafficSet.has(revKey) || activeRouteSet.has(revKey) || isBurstMode;

            // Forward Particle
            if (fwdActive) {
                // Standard Particle
                spawnParticle(l, 'fwd', isBurstMode ? '#ff003c' : '#ffffff');
                
                // Burst Mode Extras (Data Bursts)
                if (isBurstMode) {
                    setTimeout(() => spawnParticle(l, 'fwd', '#ff003c'), 150);
                    setTimeout(() => spawnParticle(l, 'fwd', '#ffffff'), 300);
                    setTimeout(() => spawnParticle(l, 'fwd', '#ff003c'), 450);
                }
            }
            
            // Reverse Particle
            if (revActive) {
                spawnParticle(l, 'rev', '#ff003c'); 
                if (isBurstMode) {
                    setTimeout(() => spawnParticle(l, 'rev', '#ff003c'), 200);
                    setTimeout(() => spawnParticle(l, 'rev', '#ffffff'), 350);
                }
            }
        });

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
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

        return () => {
            simulation.stop();
        };
    }
  }, [onSelectNode, activeNode, currentOS, battleMode]);

  return (
    <div ref={wrapperRef} className="w-full h-full relative overflow-hidden bg-cyber-dark/40 rounded-xl border border-cyber-gray shadow-lg backdrop-blur-sm transition-all duration-500">
      {battleMode && (
          <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none z-10">
              <span className="text-cyber-red font-bold font-mono animate-pulse">BATTLE ROYALE</span>
              <span className="text-[9px] text-gray-500">SURVIVAL OF THE FITTEST</span>
          </div>
      )}
      
      {/* Visual Indicator for Burst Mode (High Intel Probability) */}
      {!battleMode && (currentOS?.current_fluid_context?.fluid_state?.syndicate_probability || 0) > 0.8 && (
          <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none z-10">
              <span className="text-cyber-red font-bold font-mono animate-ping opacity-75">CRITICAL INTEL BURST</span>
          </div>
      )}

      {onSimulatePlasticity && !battleMode && (
         <div className="absolute top-4 right-4 z-20">
             <button 
                onClick={onSimulatePlasticity}
                className="bg-cyber-gray/50 hover:bg-cyber-blue/20 text-cyber-dim hover:text-cyber-blue border border-cyber-gray hover:border-cyber-blue px-2 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1"
             >
                <span className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse"></span>
                SIMULATE PLASTICITY
             </button>
         </div>
      )}

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
