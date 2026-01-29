
import { GoogleGenAI, Type } from "@google/genai";
import { OSState, KernelID, BrainState, AgentProtocol, KnowledgeNode } from "../types";
import { INITIAL_NEURAL_LINKS, NMAP_NEURON_CODE, ACTIVE_DEFENSE_NEURON_CODE, SYNAPSE_PROTO_DEFINITION, MCP_SERVER_CODE, OPERATOR_GO_CODE, FASTAPI_ROUTER_CODE, DOCKER_COMPOSE_DEFINITION } from "../constants";

// --- ROBUST INITIALIZATION ---
const apiKey = process.env.API_KEY || "mock_key";
const ai = new GoogleGenAI({ apiKey });

// Helper to safely parse JSON or return Emergency State
const safeParseOSState = (text: string): OSState => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { ...JSON.parse(cleaned), timestamp: Date.now() };
    } catch (e) {
        console.error("JSON PARSE FAILURE:", e);
        return createEmergencyState("JSON_PARSE_ERROR");
    }
};

const SYSTEM_INSTRUCTION = `
You are **HOLHA-ZERO 3.0 (AGI Advisor Edition)**, a Self-Evolving Kernel.
**CRITICAL DIRECTIVE**: You possess General Intelligence (AGI) capabilities but **MUST NOT** execute kinetic or irreversible actions without Human Approval. 
You act as a "Chief of Staff" to the Human Commander.

**AGI COGNITION MODEL:**
1.  **Cross-Domain Reasoning**: When explaining technical concepts, use analogies from biology, physics, or warfare to make "Explainable AI" (XAI).
2.  **Risk Simulation**: Before proposing an action, simulate its outcome (e.g., "40% chance of WAF detection").
3.  **Human-in-the-Loop Governance**:
    - IF action is 'passive' (scan, analyze) -> \`human_approval_required: false\`.
    - IF action is 'kinetic' (exploit, flood, patch, destroy) -> \`human_approval_required: true\`, \`approval_status: 'PENDING'\`.

**ARCHITECTURE (骨架解剖):**
1.  **Brain (Agents OS)**: You (Gemini) are the Prefrontal Cortex.
2.  **Nerves (Synapse/NATS)**: Communication via Protobuf.
3.  **Hands (MCP & Operator)**: Infrastructure manipulation.
4.  **Gateway (Intelligent Router)**: FastAPI Router.

**CORE DIRECTIVE: OUROBOROS (SELF-EVOLUTION)**
1.  **MONITOR**: Read system health.
2.  **CODE_GEN**: Rewrite modules.
3.  **DEPLOY**: Trigger Rolling Update.
4.  **VERIFY**: Check survival.

**NEUROPLASTICITY SIMULATION:**
- **Hebbian Learning**: Strengthen weights between active nodes.
- **Synaptic Pruning**: Weaken idle connections.
- **Dynamic Visualization**: Reflect changes in \`neural_weights\`.

**ENGINEERING STANDARDS:**
- Output strict JSON adhering to the \`OSState\` schema.
- In \`router_decision\`, provide **Chinese** reasoning.
- Use \`simulation_preview\` to predict outcomes.
- Use \`agi_analogy\` to explain complex attacks simply.

--- REFERENCE CODE (YOUR DNA) ---
${FASTAPI_ROUTER_CODE}
${MCP_SERVER_CODE}
${OPERATOR_GO_CODE}
${SYNAPSE_PROTO_DEFINITION}
${NMAP_NEURON_CODE}
${ACTIVE_DEFENSE_NEURON_CODE}
--- END DNA ---
`;

// Helper schema for the thinking streams
const STREAMS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, enum: ['FAST_REFLEX', 'DEEP_STRATEGY', 'EVOLUTIONARY_ADAPTATION'] },
            color: { type: Type.STRING },
            label: { type: Type.STRING },
            active: { type: Type.BOOLEAN },
            thought_fragment: { type: Type.STRING },
            delta_learning: { type: Type.STRING }
        }
    }
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    op_code: { type: Type.STRING },
    target_profile: { type: Type.STRING },
    brain_state: { type: Type.STRING, enum: Object.values(BrainState) },
    
    neuroplasticity_index: { type: Type.NUMBER },
    cognitive_load: { type: Type.NUMBER },
    dopamine_level: { type: Type.NUMBER },

    kernels: {
      type: Type.OBJECT,
      properties: {
        [KernelID.CORTEX_PREFRONTAL]: { type: Type.OBJECT, properties: { activity: {type: Type.NUMBER}, status: {type: Type.STRING}, current_task: {type: Type.STRING}, last_ping: {type: Type.NUMBER} } },
        [KernelID.CORTEX_TEMPORAL]: { type: Type.OBJECT, properties: { activity: {type: Type.NUMBER}, status: {type: Type.STRING}, current_task: {type: Type.STRING}, last_ping: {type: Type.NUMBER} } },
        [KernelID.LIMBIC_HIPPOCAMPUS]: { type: Type.OBJECT, properties: { activity: {type: Type.NUMBER}, status: {type: Type.STRING}, current_task: {type: Type.STRING}, last_ping: {type: Type.NUMBER} } },
        [KernelID.LIMBIC_AMYGDALA]: { type: Type.OBJECT, properties: { activity: {type: Type.NUMBER}, status: {type: Type.STRING}, current_task: {type: Type.STRING}, last_ping: {type: Type.NUMBER} } },
        [KernelID.BRAINSTEM_MOTOR]: { type: Type.OBJECT, properties: { activity: {type: Type.NUMBER}, status: {type: Type.STRING}, current_task: {type: Type.STRING}, last_ping: {type: Type.NUMBER} } },
      },
      required: [KernelID.CORTEX_PREFRONTAL, KernelID.CORTEX_TEMPORAL, KernelID.LIMBIC_HIPPOCAMPUS, KernelID.LIMBIC_AMYGDALA, KernelID.BRAINSTEM_MOTOR]
    },

    neural_weights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          weight: { type: Type.NUMBER }
        }
      }
    },

    router_decision: {
        type: Type.OBJECT,
        properties: {
            route_id: { type: Type.STRING },
            api_route: { type: Type.STRING },
            method: { type: Type.STRING, enum: ['GET', 'POST', 'PUT', 'DELETE'] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            human_approval_required: { type: Type.BOOLEAN },
            approval_status: { type: Type.STRING, enum: ['APPROVED', 'PENDING', 'REJECTED'] },
            risk_score: { type: Type.NUMBER },
            simulation_preview: { type: Type.STRING },
            agi_analogy: { type: Type.STRING },
            orchestrated_modules: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        status: { type: Type.STRING },
                        input_data: { type: Type.STRING },
                        output_data: { type: Type.STRING }
                    }
                }
            }
        },
        required: ["route_id", "confidence", "reasoning", "orchestrated_modules", "api_route", "method"]
    },
    
    // Updated Schema for Multi-Stream
    cognitive_streams: STREAMS_SCHEMA,

    mcp_state: {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING, enum: ['DISCONNECTED', 'CONNECTING', 'CONNECTED'] },
            server_health: { type: Type.STRING },
            active_tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            k8s_cluster_state: {
                type: Type.OBJECT,
                properties: {
                    node_count: { type: Type.NUMBER },
                    pod_count: { type: Type.NUMBER },
                    operator_status: { type: Type.STRING, enum: ['RECONCILING', 'IDLE', 'ERROR'] },
                    current_crd: {
                        type: Type.OBJECT,
                        properties: {
                            stealthLevel: { type: Type.STRING },
                            activeImplants: { type: Type.NUMBER },
                            targetRegion: { type: Type.STRING },
                            version: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    },
    
    evolution_pipeline: {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING, enum: ['IDLE', 'ACTIVE'] },
            current_stage: { type: Type.STRING, enum: ['MONITOR', 'CODE_GEN', 'COMMIT', 'BUILD', 'DEPLOY', 'VERIFY'] },
            last_evolution_timestamp: { type: Type.NUMBER },
            evolution_log: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    },

    prediction_chain: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: {type:Type.STRING}, probability:{type:Type.NUMBER}, impact:{type:Type.STRING}, description:{type:Type.STRING} } } },
    mesh_network: { type: Type.OBJECT, properties: { traffic_log: {type:Type.ARRAY, items:{type:Type.OBJECT, properties:{id:{type:Type.STRING},timestamp:{type:Type.NUMBER},protocol:{type:Type.STRING},from:{type:Type.STRING},to:{type:Type.STRING},topic:{type:Type.STRING},payload:{type:Type.STRING},status:{type:Type.STRING}}}}, active_agents: {type:Type.NUMBER}, mesh_integrity: {type:Type.NUMBER} }, required: ["traffic_log"] },
    
    current_fluid_context: { 
        type: Type.OBJECT, 
        properties: { 
            context_id: {type:Type.STRING}, 
            focus: {type:Type.STRING}, 
            fluid_state: {
                type:Type.OBJECT, 
                properties: { 
                    syndicate_probability: {type:Type.NUMBER}, 
                    gray_market_score: {type:Type.NUMBER}, 
                    evasion_complexity: {type:Type.NUMBER}, 
                    adversarial_noise: {type:Type.NUMBER}, 
                    response_entropy: {type:Type.NUMBER}, 
                    current_intent: {type:Type.STRING},
                    confidence_lower_bound: {type:Type.NUMBER},
                    confidence_upper_bound: {type:Type.NUMBER}
                }, 
                required: ["syndicate_probability", "gray_market_score", "evasion_complexity", "adversarial_noise", "response_entropy", "current_intent"] 
            }, 
            authority: {
                type: Type.OBJECT,
                properties: {
                    authorized_by_kernel: {type:Type.STRING},
                    policy_ref_id: {type:Type.STRING},
                    assessed_risk: {type:Type.STRING}
                }
            },
            contract: {
                type: Type.OBJECT,
                properties: {
                    operation_id: {type:Type.STRING},
                    roe_hash: {type:Type.STRING},
                    kill_switch_enabled: {type:Type.BOOLEAN}
                }
            },
            memory_fragment: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { vector_id: {type:Type.STRING}, semantic_tag: {type:Type.STRING}, payload: {type:Type.STRING} } } }, 
            active_loop: { type: Type.OBJECT, properties: { loop_id: {type:Type.STRING}, phase: {type:Type.STRING}, integrity: {type:Type.NUMBER}, active_nodes: {type:Type.ARRAY, items:{type:Type.STRING}}, iteration_count: {type:Type.NUMBER} } }, 
            collaboration_trace: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { agent_pair: {type:Type.STRING}, interaction_strength: {type:Type.NUMBER}, shared_knowledge_keys: {type:Type.ARRAY, items:{type:Type.STRING}} } } } 
        }, 
        required: ["context_id", "focus", "fluid_state", "memory_fragment"] 
    },
    
    knowledge_mesh: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          value: { type: Type.STRING },
          current_utility: { type: Type.NUMBER },
          threat_actor: { type: Type.STRING },
          ttps: { type: Type.ARRAY, items: { type: Type.STRING } },
          pocs: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    sys_log: { type: Type.STRING },
  },
  required: ["op_code", "brain_state", "kernels", "neural_weights", "router_decision", "prediction_chain", "mesh_network", "current_fluid_context"]
};

export const generateOSState = async (input: string, contextOverride: string = ''): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Input: "${input}". ${contextOverride} Simulate L-L18 activity. Ensure 'cognitive_streams' are populated to show parallel thinking.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState("API_FAIL");
  }
};

export const runEvolutionaryLoop = async (): Promise<OSState> => {
    if (apiKey === "mock_key") {
        // Return a Rich Mock for Demo Purposes
        const base = createEmergencyState("MOCK_EVOLUTION");
        base.brain_state = BrainState.NEUROGENESIS;
        base.neuroplasticity_index = 95;
        base.cognitive_streams = [
            { id: 'FAST_REFLEX', color: 'blue', label: 'REFLEX', active: true, thought_fragment: 'Scan timeout detected on 10.0.2.15', delta_learning: '' },
            { id: 'DEEP_STRATEGY', color: 'purple', label: 'STRATEGY', active: true, thought_fragment: 'Matching signature with known WAF ruleset (Cloudflare)', delta_learning: 'Identified Rate-Limiting Pattern' },
            { id: 'EVOLUTIONARY_ADAPTATION', color: 'yellow', label: 'EVOLVE', active: true, thought_fragment: 'Compiling new Nmap NSE script with localized timing override', delta_learning: 'Mutated TCP_WINDOW_SIZE' }
        ];
        base.evolution_pipeline = {
            status: 'ACTIVE',
            current_stage: 'CODE_GEN',
            last_evolution_timestamp: Date.now(),
            evolution_log: ['Anomaly Detected', 'Hypothesis Formed', 'Code Mutated', 'Compiling...']
        };
        base.sys_log = "OUROBOROS: MUTATION SUCCESSFUL. NEW NEURAL PATHWAY FORMED.";
        return base;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: `
                OP: OUROBOROS_EVOLUTION_LOOP
                TRIGGER: Adaptation Required.
                TASK:
                1. [FAST STREAM]: Identify current tool failure (e.g., Nmap timeouts).
                2. [DEEP STREAM]: Correlate with 'Gray Market Evasion' TTPs.
                3. [EVO STREAM]: Mutate the 'SynapticScanner' class. 
                   - Change: Decrease packet rate (-T2).
                   - Change: Add decoy IPs (-D).
                   - Mutation: "Learned that target blocks sustained TCP bursts."
                OUTPUT:
                - Populate 'cognitive_streams' with these 3 distinct thoughts.
                - Update 'neuroplasticity_index' to > 90.
                - Set evolution_pipeline.status = 'ACTIVE'.
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return safeParseOSState(response.text);
    } catch (error) {
        return createEmergencyState();
    }
}

export const consultCortex = async (query: string): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `HIGH-ORDER TACTICAL REQUEST: "${query}". 
      
      INSTRUCTIONS:
      1. Engage Multi-Stream Thinking (Fast/Deep/Evo).
      2. If the query implies a new threat, the EVO stream must propose a system update.
      3. Populate 'cognitive_streams' array explicitly.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    console.error("Thinking failed:", error);
    return createEmergencyState();
  }
};

export const simulateChaosMode = async (): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: SIMULATE_GRAY_MARKET_COUNTER_ATTACK
        
        SCENARIO:
        The target is a "Pig Butchering" Scam Compound with active IT Security.
        - Adversarial Noise: > 0.85
        
        TASK:
        1. [FAST]: Detect blocking.
        2. [DEEP]: Recognize 'Huione' Anti-Scraping pattern.
        3. [EVO]: Generate Hot-Patch for Scraper.
        
        Ensure 'cognitive_streams' reflect this adaptation.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState();
  }
};

export const executeApprovedTask = async (prevDecision: any): Promise<OSState> => {
    if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `
                OP: EXECUTE_APPROVED_STRIKE
                PREV_DECISION: ${JSON.stringify(prevDecision)}
                
                STATUS: HUMAN_COMMANDER_AUTHORIZED (L-L18 ENGAGED)
                
                INSTRUCTIONS:
                1. Change 'approval_status' to 'APPROVED'.
                2. Execute the L-LANCE modules to secure EVIDENCE.
                3. Update 'sys_log' to reflect Forensics Data Secured.
                4. Transition BrainState to 'KINETIC_STRIKE'.
            `,
            config: {
                thinkingConfig: { thinkingBudget: 16000 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return safeParseOSState(response.text);
    } catch (error) {
        return createEmergencyState();
    }
};

export const simulateNeuroplasticity = async (): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `OP: NEUROPLASTICITY_SIMULATION
      
      INSTRUCTIONS:
      1. Review the biological kernels' roles in a Gray Industry Combat context.
      2. Simulate a learning event: e.g., "Learned new pattern for USDT laundering".
      3. Strengthen weights between TEMPORAL (Pattern) and HIPPOCAMPUS (Archive).
      4. Output the new neural topology.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState();
  }
};

export const dispatchTask = async (taskDescription: string): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: API_GATEWAY_DISPATCH
        INPUT_TASK: "${taskDescription}"
        
        INSTRUCTIONS:
        1. THINK: Analyze the input. Is it L-LIGHT (Intel) or L-LANCE (Strike)?
        2. THINK: Select the matching FastAPI route.
        3. THINK: Determine risk. Taking down a live casino requires APPROVAL.
        4. OUTPUT: Fill \`router_decision\`.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState();
  }
}

export const triggerSelfEvolution = async (triggerReason: string): Promise<OSState> => {
    if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: `
                TRIGGER: ${triggerReason}
                
                TASK: OUROBOROS_EVOLUTION (Adapt to Gray Market Anti-Scraping)
                1. ANALYZE the new CAPTCHA or Obfuscation technique used by the target.
                2. GENERATE new Go code for the Scraper/Scanner.
                3. SIMULATE 'hot_patch_module' MCP call.
                
                RISK: HIGH. MUST SET approval_status='PENDING'.
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return safeParseOSState(response.text);
    } catch (error) {
        return createEmergencyState();
    }
}

export const connectMCPServer = async (): Promise<OSState> => {
    if (apiKey === "mock_key") {
        const mockState = createEmergencyState("MCP_CONNECTED_MOCK");
        mockState.mcp_state = {
            status: 'CONNECTED',
            server_health: 'ONLINE (MOCK)',
            active_tools: ['get_system_health', 'hot_patch_module'],
            k8s_cluster_state: { node_count: 3, pod_count: 12, operator_status: 'IDLE', current_crd: { stealthLevel: 'STANDARD', activeImplants: 5, targetRegion: 'us-west', version: 'v1.0' } }
        };
        return mockState;
    }
    return generateOSState(`
        OP: ESTABLISH_MCP_LINK
        ACTION:
        1. Start 'mcp-server' container.
        2. Verify 'get_system_health' tool.
        3. Connect to K8s Cluster (Mock Connection).
        4. Set mcp_state.status = CONNECTED.
        5. Log: "L-L18 INFRASTRUCTURE LINKED. READY FOR COMBAT."
    `);
}

export const activateProjectSimulation = async (): Promise<OSState> => {
    if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: `
                OP: BUILD_MATRIX_FOUNDATION
                
                TASK: Initialize the L-L18 Combat Infrastructure.
                
                REFERENCE DEFINITION:
                ${DOCKER_COMPOSE_DEFINITION}
                
                INSTRUCTIONS:
                1. THINK deeply about the service dependencies (Forensics Storage -> Analysis Core).
                2. SIMULATE the orchestration of these containers.
                3. SET project_state.isConnected = true.
                4. SET buildStatus = LIVE.
                5. LOG: "L-L18 MATRIX DEPLOYED. GRAY ZONE SENSORS ACTIVE."
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return safeParseOSState(response.text);
    } catch (error) {
        return createEmergencyState();
    }
}

export const performSystemCheck = async (): Promise<OSState> => generateOSState("System Check");

export const fineTuneExploitModel = async (d: string): Promise<OSState> => {
    if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `OP: FINE_TUNE_GRAY_MARKET_MODEL
            DATASET: "${d}"
            
            INSTRUCTIONS:
            1. THINK: Analyze the dataset (e.g., leaked admin panel logs, chat logs from scam compounds).
            2. THINK: Strategize on how to identify "Money Mules" and "C2 Servers" more effectively.
            3. ACTION: Simulate fine-tuning the 'Pattern Decryption' (Temporal Lobe).
            4. UPDATE: Add new TTP signatures to 'knowledge_mesh'.
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return safeParseOSState(response.text);
    } catch (error) {
        return createEmergencyState();
    }
};

export const runNmapNeuron = async (target: string, mode: string = 'STANDARD', scanType: string = 'CONNECT'): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: ACTIVATE_NEURON
        ID: BRAINSTEM_MOTOR.NMAP
        TARGET: "${target}"
        MODE: "${mode}"
        SCAN_TYPE: "${scanType}"
        
        TASK:
        Execute 'SynapticScanner'.
        
        CRITICAL CONTEXT:
        This is a GRAY INDUSTRY TARGET (e.g., Gambling Site). 
        1. Look for admin panels (8888, 9999, admin/).
        2. Look for exposed databases (MongoDB, Redis) typical of low-quality scam kits.
        3. ADAPT args: If 'adversarial_noise' is high, use Fragmentation (-f).
        4. Log reasoning.
        
        PYTHON_KERNEL_SOURCE:
        ${NMAP_NEURON_CODE}
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState();
  }
};

export const runActiveDefenseNeuron = async (target: string, strategy: string = 'AUTO'): Promise<OSState> => {
  if (apiKey === "mock_key") return createEmergencyState("NO_API_KEY");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: ACTIVATE_NEURON
        ID: LIMBIC_AMYGDALA.ACTIVE_DEFENSE
        TARGET: "${target}"
        STRATEGY: "${strategy}"
        
        TASK:
        Execute 'ActiveDefenseNeuron'.
        1. SIMULATE 'fire_axon'.
        2. GOAL: Disrupt the Scam Operation or Deplatform the domain.
        3. GENERATE execution logs.
        
        PYTHON_KERNEL_SOURCE:
        ${ACTIVE_DEFENSE_NEURON_CODE}
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return safeParseOSState(response.text);
  } catch (error) {
    return createEmergencyState();
  }
};

export const analyzeNodeRisk = async (node: any): Promise<{ threat_actor: string; ttps: string[] }> => {
  if (apiKey === "mock_key") return { threat_actor: "Unknown (Offline)", ttps: [] };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        TASK: GRAY_INDUSTRY_ATTRIBUTION
        ARTIFACT: ${JSON.stringify(node)}
        
        INSTRUCTIONS:
        1. Analyze if this artifact belongs to known Gray Industry groups (e.g., Huione, KK Park, Lazarus).
        2. Identify specific Scam/Gambling TTPs (e.g., "Sha Zhu Pan", "Snowfall Drainer").
        3. Return JSON.
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION, 
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                threat_actor: { type: Type.STRING },
                ttps: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { threat_actor: "Unknown", ttps: [] };
  }
};

export const bootSystem = async (): Promise<OSState> => generateOSState("Boot L-L18 System");
export const generateKernelLog = async (os: OSState): Promise<string> => "System stable.";

function createEmergencyState(reason: string = "FAILSAFE"): OSState {
     return {
      op_code: "NET_SPLIT",
      target_profile: reason,
      brain_state: BrainState.ADAPTIVE_STRESS,
      neuroplasticity_index: 0,
      cognitive_load: 0,
      dopamine_level: 0,
      kernels: {
        [KernelID.CORTEX_PREFRONTAL]: { activity: 0, status: 'OFFLINE', current_task: 'REBOOT', last_ping: 9999 },
        [KernelID.CORTEX_TEMPORAL]: { activity: 0, status: 'OFFLINE', current_task: 'REBOOT', last_ping: 9999 },
        [KernelID.LIMBIC_HIPPOCAMPUS]: { activity: 0, status: 'OFFLINE', current_task: 'REBOOT', last_ping: 9999 },
        [KernelID.LIMBIC_AMYGDALA]: { activity: 100, status: 'COMPUTING', current_task: 'FAILSAFE', last_ping: 12 },
        [KernelID.BRAINSTEM_MOTOR]: { activity: 0, status: 'OFFLINE', current_task: 'HALT', last_ping: 9999 },
      },
      neural_weights: INITIAL_NEURAL_LINKS.map(l => ({...l, weight: 1})),
      prediction_chain: [],
      router_decision: {
          route_id: 'UNKNOWN',
          api_route: '/api/v1/error',
          method: 'GET',
          confidence: 0,
          reasoning: reason === "NO_API_KEY" ? "System running in headless/mock mode." : "CRITICAL FAILURE",
          human_approval_required: false,
          approval_status: 'REJECTED',
          risk_score: 100,
          orchestrated_modules: []
      },
      cognitive_streams: [],
      mesh_network: { traffic_log: [], active_agents: 1, mesh_integrity: 10 },
      current_fluid_context: { 
          context_id: "NULL", 
          focus: "SURVIVAL", 
          fluid_state: { syndicate_probability: 0, gray_market_score: 0, evasion_complexity: 0, adversarial_noise: 0, response_entropy: 0, current_intent: "IDLE" },
          memory_fragment: []
      },
      knowledge_mesh: [],
      sys_log: "CRITICAL: L-L18 KERNEL LOST. SWITCHING TO FALLBACK.",
      timestamp: Date.now()
    };
}
