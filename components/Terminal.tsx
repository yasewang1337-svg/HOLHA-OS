
import React, { useState, useEffect, useRef } from 'react';
import { generateOSState, runNmapNeuron, connectMCPServer, dispatchTask, consultCortex, activateProjectSimulation, fineTuneExploitModel, executeApprovedTask, simulateChaosMode, runActiveDefenseNeuron, runEvolutionaryLoop } from '../services/geminiService';
import { OSState, RouterDecision } from '../types';

interface TerminalProps {
  onFluidUpdate: (state: OSState) => void;
  currentOS?: OSState | null;
}

export const Terminal: React.FC<TerminalProps & { currentOS: OSState | null }> = ({ onFluidUpdate, currentOS }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'in' | 'out' | 'code' | 'net' | 'warn' | 'ai'; text: string; }[]>([
    { type: 'out', text: 'Holha-Zero Kernel v3.1.0 (AGI Advisor) loaded.' },
    { type: 'out', text: 'Type "help" for strategic command list.' },
    { type: 'out', text: 'Type "evolve" to trigger Ouroboros Self-Correction Loop.' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const lastTimestampRef = useRef<number>(0);

  // Pending Decision State
  const [pendingDecision, setPendingDecision] = useState<RouterDecision | null>(null);

  // Watch for external OS updates
  useEffect(() => {
    if (currentOS && currentOS.timestamp > lastTimestampRef.current) {
        lastTimestampRef.current = currentOS.timestamp;
        if (currentOS.sys_log) {
            setHistory(prev => [...prev, { type: 'net', text: `[SYSTEM] ${currentOS.sys_log}` }]);
        }
        
        // CHECK FOR PENDING APPROVALS
        if (currentOS.router_decision?.approval_status === 'PENDING') {
            setPendingDecision(currentOS.router_decision);
            setHistory(prev => [...prev, 
                { type: 'warn', text: `⚠ INTERVENTION REQUIRED ⚠` },
                { type: 'out', text: `RISK SCORE: ${currentOS.router_decision?.risk_score}/100` },
                { type: 'ai', text: `ANALYSIS: ${currentOS.router_decision?.agi_analogy || currentOS.router_decision?.reasoning}` },
                { type: 'out', text: `SIMULATION: ${currentOS.router_decision?.simulation_preview || 'N/A'}` },
                { type: 'warn', text: `Type 'approve' to execute or 'reject' to abort.` }
            ]);
        }
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentOS]);

  const processCommand = async (cmd: string) => {
      if (!cmd.trim() || loading) return;
      setLoading(true);
      setHistory(prev => [...prev, { type: 'in', text: cmd }]);

      try {
        // --- APPROVAL WORKFLOW ---
        if (pendingDecision) {
            if (cmd.toLowerCase() === 'approve') {
                setHistory(prev => [...prev, { type: 'out', text: '>> AUTH_TOKEN_ACCEPTED. EXECUTING KILL CHAIN...' }]);
                const newState = await executeApprovedTask(pendingDecision);
                setPendingDecision(null);
                onFluidUpdate(newState);
                setLoading(false);
                return;
            } else if (cmd.toLowerCase() === 'reject') {
                setHistory(prev => [...prev, { type: 'out', text: '>> OPERATION ABORTED BY COMMANDER.' }]);
                setPendingDecision(null);
                setLoading(false);
                return;
            } else {
                 setHistory(prev => [...prev, { type: 'warn', text: '>> SYSTEM LOCKED. WAITING FOR APPROVAL [approve/reject]' }]);
                 setLoading(false);
                 return;
            }
        }

        let osState: OSState | null = null;
        const args = cmd.split(' ');
        const baseCmd = args[0];

        if (baseCmd === 'help') {
             setHistory(prev => [...prev, 
                { type: 'out', text: 'Available Commands:' },
                { type: 'out', text: '  mcp start           :: Connect to Infrastructure (K8s)' },
                { type: 'out', text: '  evolve              :: TRIGGER ADAPTIVE LEARNING (Ouroboros)' },
                { type: 'out', text: '  matrix init         :: Deploy Matrix Infra via Docker' },
                { type: 'out', text: '  ping <target>       :: Low-latency spinal scan' },
                { type: 'out', text: '  analyze <text>      :: Ingest Intel into Knowledge Graph' },
                { type: 'out', text: '  dispatch <task>     :: Route via Intelligent Gateway' },
                { type: 'out', text: '  ask <query>         :: Consult Cortex (AGI Mode)' },
                { type: 'out', text: '  nmap <target>       :: Execute Nmap Neuron (Adaptive)' },
                { type: 'out', text: '  defense <target>    :: Trigger Amygdala Active Defense' },
                { type: 'out', text: '  train <dataset>     :: Fine-tune Exploit LLM on new data' },
                { type: 'out', text: '  test chaos          :: Simulate Global Adaptation (Stress Test)' },
             ]);
             setLoading(false);
             return;
        }

        if (cmd === 'mcp start') {
            osState = await connectMCPServer();
        } else if (cmd === 'evolve') {
            setHistory(prev => [...prev, { type: 'warn', text: '>> INITIATING OUROBOROS PROTOCOL. MUTATING KERNELS...' }]);
            osState = await runEvolutionaryLoop();
        } else if (cmd === 'matrix init') {
            osState = await activateProjectSimulation();
        } else if (cmd.startsWith('analyze')) {
             osState = await generateOSState(`ANALYZE INTEL: ${cmd.replace('analyze ', '')}`);
        } else if (cmd.startsWith('ping')) {
             osState = await generateOSState(`PING SCAN: ${cmd}`);
        } else if (cmd.startsWith('dispatch')) {
            osState = await dispatchTask(cmd.replace('dispatch ', ''));
        } else if (cmd.startsWith('ask')) {
             osState = await consultCortex(cmd.replace('ask ', ''));
        } else if (cmd.startsWith('nmap')) {
            const target = args[1] || '127.0.0.1';
            let scanType = 'CONNECT';
            if (args.includes('--scan-type')) {
                const idx = args.indexOf('--scan-type');
                if (idx + 1 < args.length) {
                    scanType = args[idx + 1];
                }
            }
            osState = await runNmapNeuron(target, 'STANDARD', scanType);
        } else if (cmd.startsWith('defense')) {
            const parts = args.slice(1);
            let target = 'Global';
            let strategy = 'AUTO';
            
            if (parts.length >= 2) {
                strategy = parts[0].toUpperCase();
                target = parts[1];
            } else if (parts.length === 1) {
                target = parts[0];
            }
            
            setHistory(prev => [...prev, { type: 'warn', text: `>> ENGAGING AMYGDALA DEFENSE (${strategy}) AGAINST ${target}...` }]);
            osState = await runActiveDefenseNeuron(target, strategy);
        } else if (cmd.startsWith('train')) {
             osState = await fineTuneExploitModel(cmd.replace('train ', ''));
        } else if (cmd === 'test chaos') {
             setHistory(prev => [...prev, { type: 'warn', text: '>> INITIATING CHAOS SIMULATION [NOISE > 0.8]...' }]);
             osState = await simulateChaosMode();
        } else {
            osState = await generateOSState(cmd);
        }
        
        if (osState) {
            onFluidUpdate(osState);
        }
      } catch (error) {
        setHistory(prev => [...prev, { type: 'out', text: 'ERR: EXECUTION_FAILURE' }]);
      } finally {
        setLoading(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          const cmd = input.trim();
          if (cmd) {
              setCmdHistory(prev => [...prev, cmd]);
              setHistoryIndex(-1);
              setInput('');
              processCommand(cmd);
          }
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex < cmdHistory.length - 1) {
             const idx = historyIndex === -1 ? cmdHistory.length - 1 : historyIndex - 1;
             if (idx >= 0) {
                 setHistoryIndex(idx);
                 setInput(cmdHistory[idx]);
             }
          }
      }
  };

  return (
    <div className="flex flex-col h-full font-mono text-[11px] bg-cyber-black">
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {history.map((msg, idx) => (
          <div key={idx} className={`${
              msg.type === 'in' ? 'text-white font-bold' : 
              msg.type === 'code' ? 'text-cyber-dim' : 
              msg.type === 'net' ? 'text-cyber-blue' :
              msg.type === 'warn' ? 'text-cyber-red animate-pulse font-bold' :
              msg.type === 'ai' ? 'text-cyber-purple italic' :
              'text-gray-400'
          }`}>
             {msg.type === 'in' ? (
                 <span className="text-cyber-green mr-2">➜ ~</span>
             ) : (
                 <span className="text-gray-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
             )}
             {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      <div className={`p-2 border-t flex items-center ${pendingDecision ? 'bg-red-900/20 border-red-500' : 'bg-cyber-gray/20 border-cyber-gray'}`}>
        <span className={`${pendingDecision ? 'text-red-500' : 'text-cyber-green'} mr-2 font-bold`}>
            {pendingDecision ? 'AUTHORIZE >' : '➜'}
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600"
          placeholder={pendingDecision ? "Type 'approve' or 'reject'..." : "Execute command..."}
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
};
