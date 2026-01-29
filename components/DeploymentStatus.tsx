
import React, { useState } from 'react';
import { OSState, KnowledgeNode } from '../types';
import { KnowledgeGraph } from './KnowledgeGraph';
import { runNmapNeuron } from '../services/geminiService';

interface MeshProps {
  currentOS?: OSState | null;
  onUpdateOS?: (os: OSState) => void;
}

export const DeploymentStatus: React.FC<MeshProps> = ({ currentOS, onUpdateOS }) => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [newTTP, setNewTTP] = useState('');

  const handleScan = async () => {
    if (onUpdateOS) {
      // Trigger Nmap Neuron
      // We use a fixed target '192.168.1.1' as requested, but in a real app this would be a prompt.
      // Mode is set to STANDARD by default for manual scans.
      const newState = await runNmapNeuron('192.168.1.1', 'STANDARD');
      onUpdateOS(newState);
    }
  };
  
  const handleUpdateNode = (updates: Partial<KnowledgeNode>) => {
      if (!selectedNode || !currentOS || !onUpdateOS) return;
      
      const updatedNode = { ...selectedNode, ...updates };
      
      // Deep clone currentOS to avoid direct mutation
      const newOS = JSON.parse(JSON.stringify(currentOS)) as OSState;
      if (newOS.knowledge_mesh) {
          const idx = newOS.knowledge_mesh.findIndex(n => n.type === selectedNode.type && n.value === selectedNode.value);
          if (idx !== -1) {
              newOS.knowledge_mesh[idx] = updatedNode;
              onUpdateOS(newOS);
              setSelectedNode(updatedNode); // Update local selection to reflect changes
          }
      }
  };

  const handleAddTTP = () => {
      if (!newTTP.trim() || !selectedNode) return;
      const currentTTPs = selectedNode.ttps || [];
      if (!currentTTPs.includes(newTTP.trim())) {
          handleUpdateNode({ ttps: [...currentTTPs, newTTP.trim()] });
      }
      setNewTTP('');
  };

  return (
    <div className="w-full h-full flex flex-col">
        
        {/* Header with Action Button */}
        <div className="h-8 border-b border-cyber-gray flex items-center justify-between px-3 bg-cyber-gray/20">
            <span className="text-[10px] font-bold text-cyber-dim uppercase tracking-wider">Target Intelligence</span>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={handleScan}
                    className="flex items-center gap-1 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 hover:border-cyber-blue/50 text-[9px] px-2 py-0.5 rounded transition-all font-mono font-bold"
                 >
                    <span className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-pulse"></span>
                    SCAN_NET
                 </button>
                 <span className="text-[9px] bg-cyber-gray px-1.5 py-0.5 rounded text-gray-400">{(currentOS?.knowledge_mesh || []).length} ASSETS</span>
            </div>
        </div>

        {/* Knowledge Graph Area */}
        <div className="flex-1 bg-cyber-black relative border-b border-cyber-gray">
             <KnowledgeGraph 
                data={currentOS?.knowledge_mesh || []} 
                onNodeSelect={setSelectedNode}
             />
             
             {/* Overlay Stat */}
             <div className="absolute top-2 right-2 text-[9px] text-gray-500 font-mono text-right pointer-events-none">
                 <div>TOPOLOGY_MODE: FORCE_DIRECTED</div>
                 <div>NODES: {(currentOS?.knowledge_mesh || []).length}</div>
             </div>
        </div>

        {/* Asset List OR Threat Profile Panel */}
        <div className="h-1/3 bg-cyber-dark overflow-y-auto custom-scrollbar p-0">
            {selectedNode ? (
                // --- THREAT ACTOR PROFILE PANEL ---
                <div className="p-3 font-mono text-xs flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-start border-b border-gray-700 pb-2">
                         <div>
                             <div className="text-[9px] text-cyber-blue mb-0.5">SELECTED_ASSET</div>
                             <div className="text-white font-bold truncate max-w-[150px]" title={selectedNode.value}>{selectedNode.value}</div>
                             <span className={`px-1 rounded text-[8px] mt-1 inline-block ${
                                    selectedNode.type === 'VULN' ? 'bg-red-900/40 text-red-400' :
                                    selectedNode.type === 'IP' ? 'bg-blue-900/40 text-blue-400' :
                                    'bg-gray-700 text-gray-300'
                                }`}>
                                    {selectedNode.type}
                            </span>
                         </div>
                         <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white px-2">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                        {/* Attribution Section */}
                        <div className="mb-3">
                            <label className="block text-[9px] text-gray-500 mb-1">THREAT ACTOR ATTRIBUTION</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-cyber-purple focus:border-cyber-purple outline-none placeholder-gray-700"
                                placeholder="UNATTRIBUTED"
                                value={selectedNode.threat_actor || ''}
                                onChange={(e) => handleUpdateNode({ threat_actor: e.target.value })}
                            />
                        </div>

                        {/* TTPs Section */}
                        <div className="mb-3">
                            <label className="block text-[9px] text-gray-500 mb-1">MITRE ATT&CK TTPs</label>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {(selectedNode.ttps || []).map((ttp, idx) => (
                                    <span key={idx} className="bg-cyber-gray border border-gray-600 px-1.5 py-0.5 rounded text-[9px] text-gray-300 flex items-center gap-1">
                                        {ttp}
                                        <button 
                                            onClick={() => {
                                                const newTTPs = selectedNode.ttps!.filter(t => t !== ttp);
                                                handleUpdateNode({ ttps: newTTPs });
                                            }}
                                            className="hover:text-red-400"
                                        >×</button>
                                    </span>
                                ))}
                                {(selectedNode.ttps || []).length === 0 && <span className="text-gray-600 text-[9px] italic">No TTPs recorded.</span>}
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-black/40 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:border-cyber-blue outline-none placeholder-gray-700"
                                    placeholder="Add TTP (e.g. T1059)"
                                    value={newTTP}
                                    onChange={(e) => setNewTTP(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTTP()}
                                />
                                <button 
                                    onClick={handleAddTTP}
                                    className="bg-cyber-gray hover:bg-gray-700 border border-gray-600 text-gray-300 px-2 rounded"
                                >+</button>
                            </div>
                        </div>

                         {/* PoCs Section */}
                        <div>
                            <label className="block text-[9px] text-gray-500 mb-1">GENERATED EXPLOIT PoCS</label>
                            <div className="flex flex-col gap-1 mb-2">
                                {(selectedNode.pocs || []).map((poc, idx) => (
                                    <span key={idx} className="bg-red-900/20 border border-red-900/50 px-2 py-1 rounded text-[9px] text-red-300 font-mono flex justify-between items-center">
                                        <span className="truncate">{poc}</span>
                                    </span>
                                ))}
                                {(selectedNode.pocs || []).length === 0 && <span className="text-gray-600 text-[9px] italic">No PoCs generated.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- DEFAULT ASSET LIST TABLE ---
                <table className="w-full text-[9px] font-mono text-left border-collapse">
                    <thead className="bg-cyber-gray/50 text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-1 pl-2 font-normal">TYPE</th>
                            <th className="p-1 font-normal">VALUE</th>
                            <th className="p-1 font-normal text-right">ACTOR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {(!currentOS?.knowledge_mesh || currentOS.knowledge_mesh.length === 0) ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-600">NO INTELLIGENCE GATHERED</td></tr>
                        ) : (
                            (currentOS.knowledge_mesh || []).slice().reverse().map((node: any, i: number) => (
                                <tr 
                                    key={i} 
                                    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedNode(node)}
                                >
                                    <td className="p-1 pl-2">
                                        <span className={`px-1 rounded text-[8px] ${
                                            node.type === 'VULN' ? 'bg-red-900/40 text-red-400' :
                                            node.type === 'IP' ? 'bg-blue-900/40 text-blue-400' :
                                            node.type === 'CREDENTIAL' ? 'bg-orange-900/40 text-orange-400' :
                                            'bg-gray-700 text-gray-300'
                                        }`}>
                                            {node.type}
                                        </span>
                                    </td>
                                    <td className="p-1 text-gray-300 truncate max-w-[100px]" title={node.value}>{node.value}</td>
                                    <td className="p-1 text-right text-gray-500">
                                        {node.threat_actor ? (
                                            <span className="text-cyber-purple">{node.threat_actor}</span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>

    </div>
  );
};
