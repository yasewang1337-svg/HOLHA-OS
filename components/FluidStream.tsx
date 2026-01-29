
import React from 'react';
import { OSState } from '../types';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BioTelemetryProps {
  currentOS: OSState | null;
}

export const FluidStream: React.FC<BioTelemetryProps> = ({ currentOS }) => {
  if (!currentOS) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-cyber-gray font-mono text-xs border border-cyber-gray/30 rounded-xl bg-cyber-black/50">
        <div className="animate-pulse mb-2 text-cyber-blue">WAITING FOR INTEL STREAM</div>
      </div>
    );
  }

  const eegData = Array.from({ length: 20 }, (_, i) => ({
    name: i,
    val: Math.random() * currentOS.cognitive_load + 20
  }));

  const fluid = currentOS.current_fluid_context?.fluid_state || { 
      syndicate_probability: 0, 
      gray_market_score: 0, 
      evasion_complexity: 0,
      adversarial_noise: 0,
      response_entropy: 0,
      current_intent: 'IDLE',
      confidence_lower_bound: 0,
      confidence_upper_bound: 0
  };

  const loop = currentOS.current_fluid_context?.active_loop;
  const authority = currentOS.current_fluid_context?.authority;
  const streams = currentOS.cognitive_streams || [];

  return (
    <div className="w-full h-full p-4 flex flex-col font-mono bg-cyber-black/80 rounded-xl border border-cyber-blue/20 shadow-[0_0_15px_rgba(0,240,255,0.1)] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b border-cyber-gray pb-2">
        <h3 className="text-cyber-blue text-sm uppercase tracking-widest font-bold">Advanced Science Telemetry</h3>
        <span className={`text-[10px] px-2 rounded ${currentOS.brain_state === 'KINETIC_STRIKE' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
            {currentOS.brain_state}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
          <MetricBox label="ADAPTABILITY" value={currentOS.neuroplasticity_index} color="text-purple-400" />
          <MetricBox label="COMPUTE LOAD" value={currentOS.cognitive_load} color="text-blue-400" />
          <MetricBox label="SUCCESS RATE" value={currentOS.dopamine_level} color="text-green-400" />
      </div>

      {/* MULTI-STREAM THINKING (COGNITIVE EVOLUTION) */}
      <div className="mb-4 bg-gray-900/50 p-2 rounded border border-gray-700">
           <div className="text-[10px] text-gray-400 mb-2 uppercase flex justify-between">
               <span>MULTI-STREAM COGNITION (OUROBOROS)</span>
               <span className="text-[9px] text-cyber-purple animate-pulse">{streams.length > 0 ? 'ACTIVE' : 'IDLE'}</span>
           </div>
           
           <div className="space-y-2">
               {streams.length === 0 && (
                   <div className="text-[9px] text-gray-600 italic">No active thought streams. System running on reflex only.</div>
               )}
               {streams.map((stream, idx) => (
                   <div key={idx} className="flex gap-2 items-start bg-black/40 p-1.5 rounded border border-gray-800">
                       {/* Stream Indicator Line */}
                       <div className={`w-0.5 self-stretch ${
                           stream.id === 'FAST_REFLEX' ? 'bg-blue-500' : 
                           stream.id === 'DEEP_STRATEGY' ? 'bg-purple-500' : 
                           'bg-yellow-500'
                       } rounded-full opacity-80 shadow-[0_0_5px_currentColor]`}></div>
                       
                       <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-baseline mb-0.5">
                               <span className={`text-[9px] font-bold ${
                                   stream.id === 'FAST_REFLEX' ? 'text-blue-400' : 
                                   stream.id === 'DEEP_STRATEGY' ? 'text-purple-400' : 
                                   'text-yellow-400'
                               }`}>
                                   {stream.id === 'FAST_REFLEX' ? '[FAST] REFLEX' : 
                                    stream.id === 'DEEP_STRATEGY' ? '[DEEP] STRATEGY' : 
                                    '[EVO] ADAPTATION'}
                               </span>
                               {stream.delta_learning && (
                                   <span className="text-[8px] text-green-400 bg-green-900/20 px-1 rounded border border-green-900/50">
                                       + MUTATION
                                   </span>
                               )}
                           </div>
                           <div className="text-[9px] text-gray-300 leading-tight">
                               {stream.thought_fragment}
                           </div>
                           {stream.delta_learning && (
                               <div className="mt-1 text-[8px] text-yellow-500/80 font-mono pl-2 border-l border-yellow-900/50">
                                   >> LEARNED: {stream.delta_learning}
                               </div>
                           )}
                       </div>
                   </div>
               ))}
           </div>
      </div>

      {/* Governance & Authority */}
      {authority && (
        <div className="mb-4 bg-gray-900/50 p-2 rounded border border-gray-700">
             <div className="text-[10px] text-gray-500 mb-2 uppercase flex justify-between">
                 <span>LEGAL FRAMEWORK</span>
                 <span className={`text-[9px] ${authority.assessed_risk === 'CRITICAL' ? 'text-red-500 font-bold' : 'text-green-500'}`}>RISK: {authority.assessed_risk || 'LOW'}</span>
             </div>
             <div className="flex justify-between text-[9px] text-gray-400">
                 <span>AUTH_BY: {authority.authorized_by_kernel?.split('_')[0] || 'UNKNOWN'}</span>
                 <span>REF: {authority.policy_ref_id || 'N/A'}</span>
             </div>
        </div>
      )}

      {/* Cognitive Loop Topology */}
      <div className="mb-4 bg-cyber-dark/30 p-2 rounded border border-cyber-gray/20 relative overflow-hidden">
          <div className="text-[10px] text-gray-500 mb-2 uppercase flex justify-between relative z-10">
             <span>Cognitive Loop Topology</span>
             <span className="text-xs text-cyber-purple">{loop?.phase || 'IDLE'}</span>
         </div>
         
         <div className="flex items-center justify-between px-2 py-2 relative z-10">
            {['SENSATION', 'PERCEPTION', 'DECISION', 'ACTION'].map((phase, i) => {
                const active = loop?.phase === phase;
                return (
                    <div key={phase} className="flex flex-col items-center">
                         <div className={`w-3 h-3 rounded-full border-2 ${active ? 'bg-cyber-blue border-white shadow-[0_0_10px_#00f0ff]' : 'bg-transparent border-gray-700'}`}></div>
                         <div className={`text-[7px] mt-1 ${active ? 'text-white font-bold' : 'text-gray-600'}`}>{phase.substring(0,4)}</div>
                    </div>
                );
            })}
         </div>
         <div className="absolute top-8 left-4 right-4 h-[1px] bg-gray-800 z-0"></div>
         
         {loop && (
             <div className="mt-2 text-[8px] text-gray-400 flex justify-between">
                 <span>ITERATION: #{loop.iteration_count}</span>
                 <span>INTEGRITY: {loop.integrity}%</span>
             </div>
         )}
      </div>
      
      {/* Gray Market Analysis Section */}
      <div className="mb-4 bg-cyber-dark/30 p-2 rounded border border-cyber-gray/20">
         <div className="text-[10px] text-gray-500 mb-2 uppercase flex justify-between">
             <span>Gray Zone Analysis</span>
             <span className="text-xs text-cyber-red animate-pulse">LIVE</span>
         </div>
         <div className="grid grid-cols-2 gap-4">
             <div>
                 <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                     <span>SYNDICATE_MATCH</span>
                     <span>{(fluid.syndicate_probability * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-1 bg-gray-800 rounded full overflow-hidden">
                     <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${fluid.syndicate_probability * 100}%` }}></div>
                 </div>
                 {fluid.confidence_lower_bound !== undefined && (
                     <div className="text-[8px] text-gray-600 text-right mt-0.5">
                         CI: {(fluid.confidence_lower_bound * 100).toFixed(0)}-{(fluid.confidence_upper_bound! * 100).toFixed(0)}%
                     </div>
                 )}
             </div>
             <div>
                 <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                     <span>ADVERSARIAL_NOISE</span>
                     <span>{(fluid.adversarial_noise * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-1 bg-gray-800 rounded full overflow-hidden">
                     <div className={`h-full ${fluid.adversarial_noise > 0.8 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} style={{ width: `${fluid.adversarial_noise * 100}%` }}></div>
                 </div>
             </div>
         </div>
      </div>

      {/* EEG Chart */}
      <div className="flex-1 min-h-[100px] bg-cyber-dark/50 rounded overflow-hidden relative border border-cyber-gray/30">
          <div className="absolute top-2 left-2 text-[9px] text-gray-500">NEURAL FLUX (EEG)</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={eegData}>
                <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 150]} />
                <Area type="monotone" dataKey="val" stroke="#00f0ff" fillOpacity={1} fill="url(#colorVal)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-[9px] text-gray-400 truncate flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-gray-500">FOCUS:</span> 
          <span className="text-white font-mono">{currentOS.current_fluid_context?.focus || 'IDLE'}</span>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-cyber-gray/20 p-2 rounded border border-cyber-gray/30 flex flex-col items-center">
        <span className="text-[8px] text-gray-500 mb-1">{label}</span>
        <span className={`text-lg font-bold ${color}`}>{value.toFixed(0)}</span>
        <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
            <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);
