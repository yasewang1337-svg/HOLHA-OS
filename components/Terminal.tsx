

import React, { useState, useEffect, useRef } from 'react';
import { generateOSState, runNmapNeuron, connectMCPServer, dispatchTask, consultCortex, activateProjectSimulation } from '../services/geminiService';
import { OSState } from '../types';

interface TerminalProps {
  onFluidUpdate: (state: OSState) => void;
  currentOS?: OSState | null;
}

export const Terminal: React.FC<TerminalProps & { currentOS: OSState | null }> = ({ onFluidUpdate, currentOS }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'in' | 'out' | 'code' | 'net'; text: string; }[]>([
    { type: 'out', text: 'Holha-Zero Kernel v2.0.4 loaded.' },
    { type: 'out', text: 'Type "help" for strategic command list.' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const lastTimestampRef = useRef<number>(0);

  // Watch for external OS updates (e.g. from DeploymentStatus scan button)
  useEffect(() => {
    if (currentOS && currentOS.timestamp > lastTimestampRef.current) {
        lastTimestampRef.current = currentOS.timestamp;
        if (currentOS.sys_log) {
            setHistory(prev => [...prev, { type: 'net', text: `[SYSTEM] ${currentOS.sys_log}` }]);
        }
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentOS]);

  const processCommand = async (cmd: string) => {
      if (!cmd.trim() || loading) return;
      setLoading(true);
      setHistory(prev => [...prev, { type: 'in', text: cmd }]);

      try {
        let osState: OSState | null = null;
        const args = cmd.split(' ');
        const baseCmd = args[0];

        if (baseCmd === 'help') {
             setHistory(prev => [...prev, 
                { type: 'out', text: 'Available Commands:' },
                { type: 'out', text: '  mcp start           :: Connect to Infrastructure (K8s)' },
                { type: 'out', text: '  matrix init         :: Deploy Matrix Infra via Docker' },
                { type: 'out', text: '  ping <target>       :: Low-latency spinal scan' },
                { type: 'out', text: '  analyze <text>      :: Ingest Intel into Knowledge Graph' },
                { type: 'out', text: '  dispatch <task>     :: Route via Intelligent Gateway' },
                { type: 'out', text: '  ask <query>         :: Consult Cortex (Thinking Mode)' },
                { type: 'out', text: '  nmap <target>       :: Execute Nmap Neuron' },
             ]);
             setLoading(false);
             return;
        }

        if (cmd === 'mcp start') {
            osState = await connectMCPServer();
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
            // Default to STANDARD mode if not specified
            osState = await runNmapNeuron(args[1] || '127.0.0.1', 'STANDARD');
        } else {
            osState = await generateOSState(cmd);
        }
        
        if (osState) {
            // Update global state; useEffect will handle logging the sys_log
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
      
      <div className="p-2 bg-cyber-gray/20 border-t border-cyber-gray flex items-center">
        <span className="text-cyber-green mr-2 font-bold">➜</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600"
          placeholder="Execute command..."
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
};
