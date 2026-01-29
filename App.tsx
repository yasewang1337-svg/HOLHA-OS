
import React, { useState } from 'react';
import { NeuralGraph } from './components/NeuralGraph';
import { FluidStream } from './components/FluidStream';
import { Terminal } from './components/Terminal';
import { DeploymentStatus } from './components/DeploymentStatus';
import { EngineeringDeck } from './components/EngineeringDeck';
import { OS_KERNELS } from './constants';
import { KernelID, OSState } from './types';
import { activateProjectSimulation, simulateNeuroplasticity } from './services/geminiService';

const App: React.FC = () => {
  const [activeNode, setActiveNode] = useState<KernelID | null>(null);
  const [currentOS, setCurrentOS] = useState<OSState | null>(null);
  const [viewMode, setViewMode] = useState<'OPS' | 'INFRA'>('OPS');
  const [battleMode, setBattleMode] = useState(false);

  const selectedKernel = OS_KERNELS.find(c => c.id === activeNode);

  const handleActivateProject = async () => {
      const loadingState = await activateProjectSimulation();
      setCurrentOS(loadingState);
  };

  const handleSimulatePlasticity = async () => {
      const newState = await simulateNeuroplasticity();
      setCurrentOS(newState);
  };

  return (
    <div className="h-screen w-screen bg-cyber-black flex flex-col overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-cyber-gray bg-cyber-dark flex items-center justify-between px-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
           <div className="w-4 h-4 bg-cyber-red rounded-sm flex items-center justify-center">
             <span className="text-[10px] font-bold text-white">R</span>
           </div>
           <h1 className="text-sm font-sans font-bold tracking-tight text-cyber-text">
             HOLHA <span className="text-cyber-dim font-normal">/// STRATEGIC RED TEAM ANALYZER</span>
           </h1>
        </div>

        <div className="flex items-center bg-cyber-gray/50 p-0.5 rounded border border-cyber-gray">
            <button 
                onClick={() => { setViewMode('OPS'); setBattleMode(false); }}
                className={`px-3 py-1 text-[10px] font-sans font-medium rounded transition-all ${viewMode === 'OPS' && !battleMode ? 'bg-cyber-blue text-white shadow-sm' : 'text-cyber-dim hover:text-white'}`}
            >
                OPERATIONAL VIEW
            </button>
            <button 
                onClick={() => setViewMode('INFRA')}
                className={`px-3 py-1 text-[10px] font-sans font-medium rounded transition-all ${viewMode === 'INFRA' ? 'bg-cyber-purple text-white shadow-sm' : 'text-cyber-dim hover:text-white'}`}
            >
                INFRASTRUCTURE
            </button>
            <button 
                onClick={() => { setViewMode('OPS'); setBattleMode(!battleMode); }}
                className={`ml-2 px-3 py-1 text-[10px] font-sans font-medium rounded transition-all flex items-center gap-1 ${battleMode ? 'bg-cyber-red text-white shadow-sm animate-pulse' : 'text-cyber-red border border-cyber-red/30 hover:bg-cyber-red/10'}`}
            >
                {battleMode ? '☠ BATTLE ROYALE ACTIVE' : '⚔ SIMULATE CONFLICT'}
            </button>
        </div>

        <div className="flex gap-4 font-mono text-[10px] text-cyber-dim">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>SYSTEM_STATUS: {currentOS ? 'ONLINE' : 'STANDBY'}</span>
          </div>
          <div className="flex items-center gap-2">
             <span>INTEGRITY:</span>
             <span className="text-cyber-text">{currentOS?.mesh_network?.mesh_integrity || 100}%</span>
          </div>
        </div>
      </header>

      {/* Main Strategic Grid */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-px bg-cyber-gray p-px">
        
        {/* LEFT PANEL: Strategic Assessment (Game Theory & Metrics) */}
        <div className="col-span-3 row-span-8 bg-cyber-dark relative overflow-hidden flex flex-col">
            <div className="h-8 border-b border-cyber-gray flex items-center px-3 bg-cyber-gray/20">
                <span className="text-[10px] font-bold text-cyber-dim uppercase tracking-wider">Strategic Assessment</span>
            </div>
            <div className="flex-1 overflow-hidden p-2">
                <FluidStream currentOS={currentOS} />
            </div>
        </div>

        {/* CENTER PANEL: Operational Logic Topology (Network Graph) */}
        <div className="col-span-6 row-span-8 bg-cyber-black relative flex flex-col">
           {viewMode === 'OPS' ? (
               <>
                <div className="absolute top-2 left-3 z-10 pointer-events-none">
                     <h3 className="text-xs font-bold text-cyber-dim uppercase">
                         {battleMode ? 'AGENT SURVIVAL ARENA' : 'Operational Logic Map'}
                     </h3>
                     <div className="text-[10px] text-gray-600">
                         {battleMode ? 'Live Combat Simulation' : 'Decision Nodes & Data Flow'}
                     </div>
                </div>
                <NeuralGraph 
                    onSelectNode={setActiveNode} 
                    activeNode={activeNode} 
                    currentOS={currentOS} 
                    onSimulatePlasticity={handleSimulatePlasticity}
                    battleMode={battleMode}
                />
                
                {!battleMode && selectedKernel && (
                    <div className="absolute bottom-4 left-4 right-4 bg-cyber-gray/90 border border-cyber-gray p-3 rounded backdrop-blur text-xs font-mono shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-cyber-blue font-bold">{selectedKernel.name}</span>
                                <span className="mx-2 text-gray-500">|</span>
                                <span className="text-gray-400">{selectedKernel.bioRole}</span>
                            </div>
                            <span className="text-gray-500 text-[10px]">ID: {selectedKernel.id}</span>
                        </div>
                        <div className="mt-1 text-gray-300">{selectedKernel.description}</div>
                        <div className="mt-2 flex gap-4 text-[10px] text-gray-400">
                             <span>STATUS: {currentOS?.kernels[selectedKernel.id]?.status || 'OFFLINE'}</span>
                             <span>TASK: {currentOS?.kernels[selectedKernel.id]?.current_task || 'IDLE'}</span>
                        </div>
                    </div>
                )}
               </>
           ) : (
               <EngineeringDeck currentOS={currentOS} onActivate={handleActivateProject} />
           )}
        </div>

        {/* RIGHT PANEL: Tactical Intelligence (Knowledge Mesh) */}
        <div className="col-span-3 row-span-8 bg-cyber-dark flex flex-col border-l border-cyber-gray">
            <DeploymentStatus currentOS={currentOS} onUpdateOS={setCurrentOS} />
        </div>

        {/* BOTTOM PANEL: C2 Terminal */}
        <div className="col-span-12 row-span-4 bg-cyber-black border-t border-cyber-gray flex flex-col">
            <div className="h-6 bg-cyber-gray/30 flex items-center px-2 border-b border-cyber-gray/50">
                <span className="text-[10px] text-gray-500 font-mono">TERMINAL // C2_UPLINK</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <Terminal onFluidUpdate={setCurrentOS} currentOS={currentOS} />
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
