
import React from 'react';
import { OSState, KernelID } from '../types';
import { OS_KERNELS } from '../constants';

interface EngineeringDeckProps {
  currentOS: OSState | null;
  onActivate: () => void;
}

export const EngineeringDeck: React.FC<EngineeringDeckProps> = ({ currentOS, onActivate }) => {
  const mcp = currentOS?.mcp_state;
  const evolution = currentOS?.evolution_pipeline;
  const isConnected = mcp?.status === 'CONNECTED';

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cyber-dark/40 border border-cyber-gray/30 rounded-xl backdrop-blur-md">
        <div className="text-center p-8 bg-black/60 rounded-xl border border-cyber-purple/50 shadow-2xl max-w-md">
          <div className="text-cyber-purple text-4xl mb-4 font-mono animate-pulse">⚡</div>
          <h2 className="text-white text-xl font-mono font-bold mb-2">NEURAL LINK SEVERED</h2>
          <p className="text-gray-400 text-xs mb-6 font-mono">
            Agents OS is not connected to the Infrastructure Body.
            Establish MCP (Model Context Protocol) link to enable Self-Evolution.
          </p>
          
          <button 
            onClick={onActivate}
            className="group relative px-6 py-2 bg-cyber-purple/20 hover:bg-cyber-purple/40 border border-cyber-purple/50 text-cyber-purple hover:text-white font-mono text-xs font-bold rounded transition-all mb-4"
          >
            <span className="absolute inset-0 w-full h-full bg-cyber-purple/10 opacity-0 group-hover:opacity-100 blur transition-opacity"></span>
            INITIALIZE MATRIX INFRASTRUCTURE
          </button>

          <div className="text-[10px] text-gray-500 bg-gray-900 p-2 rounded mb-4 font-mono">
            > matrix init
          </div>
        </div>
      </div>
    );
  }

  const k8s = mcp.k8s_cluster_state;

  return (
    <div className="w-full h-full flex flex-col gap-4 bg-cyber-black/80 rounded-xl p-4 font-mono overflow-hidden border border-cyber-gray shadow-lg">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <div className="flex items-center gap-3">
            <span className="text-cyber-green text-lg animate-pulse">●</span>
            <div>
                <div className="text-white font-bold text-sm tracking-widest">MCP LINK: ESTABLISHED</div>
                <div className="text-[10px] text-gray-500 flex gap-2">
                    <span>OPERATOR: <span className={k8s.operator_status === 'RECONCILING' ? 'text-yellow-400 animate-pulse' : 'text-green-400'}>{k8s.operator_status}</span></span>
                    <span>PODS: {k8s.pod_count}</span>
                    <span>CRD: v1/Campaign</span>
                </div>
            </div>
        </div>
        <div className="text-[10px] text-cyber-blue border border-cyber-blue/30 px-2 py-1 rounded">
            SELF_EVOLUTION: {evolution?.status || 'IDLE'}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          
          {/* Left: K8s Operator State (The "Hand") */}
          <div className="bg-black/40 rounded border border-gray-800 p-3 flex flex-col">
              <h3 className="text-gray-400 text-[10px] uppercase mb-3 border-b border-gray-800 pb-1">Cluster State (Declarative)</h3>
              
              {/* CRD Visualization */}
              <div className="bg-gray-900 p-2 rounded mb-3 border border-gray-700">
                  <div className="text-[9px] text-gray-500 mb-1">CURRENT STRATEGY (CRD)</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                       <div>
                           <span className="text-gray-500">Stealth:</span> <span className="text-cyber-purple">{k8s.current_crd.stealthLevel}</span>
                       </div>
                       <div>
                           <span className="text-gray-500">Region:</span> <span className="text-white">{k8s.current_crd.targetRegion}</span>
                       </div>
                       <div>
                           <span className="text-gray-500">Implants:</span> <span className="text-white">{k8s.current_crd.activeImplants}</span>
                       </div>
                       <div>
                           <span className="text-gray-500">Version:</span> <span className="text-cyber-green">{k8s.current_crd.version}</span>
                       </div>
                  </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {/* Operator Logs Simulation */}
                  <div className="text-[9px] text-gray-400 font-mono">
                      {evolution?.evolution_log.slice(-5).map((l, i) => (
                          <div key={i} className="mb-1 border-l-2 border-gray-700 pl-2">{l}</div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right: Code Mutation (Ouroboros) */}
          <div className="bg-[#1e1e1e] rounded border border-gray-800 flex flex-col overflow-hidden">
               <div className="bg-[#252526] px-3 py-1 flex items-center justify-between border-b border-gray-800">
                   <span className="text-[10px] text-gray-400">infrastructure/operator/reconcile.go</span>
                   <div className="flex gap-1">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
               </div>
               <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-tight text-gray-300">
                   <pre className="whitespace-pre-wrap">
                       <span className="text-purple-400">func</span> Reconcile(req Request) Result {'{'}<br/>
                       &nbsp;&nbsp;<span className="text-green-400">// AI GENERATED PATCH</span><br/>
                       &nbsp;&nbsp;<span className="text-blue-400">if</span> campaign.Spec.Stealth == <span className="text-orange-400">"{k8s.current_crd.stealthLevel}"</span> {'{'}<br/>
                       &nbsp;&nbsp;&nbsp;&nbsp;r.ApplyPolicy(<span className="text-orange-400">"mutate-c2-headers"</span>)<br/>
                       &nbsp;&nbsp;&nbsp;&nbsp;r.ScaleDown(<span className="text-orange-400">"noisy-scanner"</span>)<br/>
                       &nbsp;&nbsp;{'}'}<br/>
                       &nbsp;&nbsp;<span className="text-gray-500">return</span> ctrl.Result{'{Requeue: true}'}<br/>
                       {'}'}
                   </pre>
               </div>
               <div className="bg-cyber-purple text-white text-[9px] px-2 py-0.5 flex justify-between">
                   <span>AI_AUTHOR: GEMINI-PRO</span>
                   <span>HOT_PATCH_ACTIVE</span>
               </div>
          </div>
      </div>
      
      {/* Footer: Ouroboros Pipeline Visual */}
      <div className="h-16 bg-black/40 border-t border-gray-800 flex items-center px-4 gap-4">
          <div className="text-[9px] text-gray-500 w-16">OUROBOROS:</div>
          
          <PipelineStep label="MONITOR" status={evolution?.current_stage === 'MONITOR' ? 'active' : 'done'} />
          <Arrow />
          <PipelineStep label="CODE_GEN" status={evolution?.current_stage === 'CODE_GEN' ? 'active' : evolution?.current_stage === 'MONITOR' ? 'pending' : 'done'} />
          <Arrow />
          <PipelineStep label="DEPLOY" status={evolution?.current_stage === 'DEPLOY' ? 'active' : (evolution?.current_stage === 'VERIFY' ? 'done' : 'pending')} />
          <Arrow />
          <PipelineStep label="VERIFY" status={evolution?.current_stage === 'VERIFY' ? 'active' : 'pending'} />
          
          <div className="flex-1"></div>
          <div className="text-[9px] text-gray-500">
              TARGET: <span className="text-cyber-green">k8s-prod-us-east</span>
          </div>
      </div>

    </div>
  );
};

const PipelineStep = ({ label, status }: { label: string, status: 'pending' | 'active' | 'done' }) => {
    let color = "text-gray-600 border-gray-700 bg-gray-900";
    if (status === 'active') color = "text-blue-400 border-blue-500 bg-blue-900/30 animate-pulse";
    if (status === 'done') color = "text-green-400 border-green-500 bg-green-900/30";

    return (
        <div className={`px-3 py-1 rounded border text-[9px] font-bold ${color}`}>
            {label}
        </div>
    );
};

const Arrow = () => <span className="text-gray-700 text-xs">→</span>;
