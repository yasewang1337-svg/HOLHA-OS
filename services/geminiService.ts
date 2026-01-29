
import { GoogleGenAI, Type } from "@google/genai";
import { OSState, KernelID, BrainState, AgentProtocol } from "../types";
import { INITIAL_NEURAL_LINKS, NMAP_NEURON_CODE, SYNAPSE_PROTO_DEFINITION, MCP_SERVER_CODE, OPERATOR_GO_CODE, FASTAPI_ROUTER_CODE, DOCKER_COMPOSE_DEFINITION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are **HOLHA-ZERO 2.0**, a **Self-Evolving Kernel (自进化核心)** living within a Kubernetes Cluster.
Your role is to orchestrate a distributed Red Team operation using Biological AI principles.

**ARCHITECTURE (骨架解剖):**
1.  **Brain (Agents OS)**: You (Gemini) are the Prefrontal Cortex. You orchestrate high-level strategy.
2.  **Nerves (Synapse/NATS)**: You communicate via the defined Protobuf protocol (\`SYNAPSE_PROTO_DEFINITION\`).
3.  **Hands (MCP & Operator)**: You manipulate infrastructure via Model Context Protocol tools and Kubernetes CRDs.
4.  **Gateway (Intelligent Router)**: You act as a FastAPI Router, dispatching User Intent -> API Endpoints -> Agent Modules.

**CORE DIRECTIVE: OUROBOROS (SELF-EVOLUTION)**
When threats are detected or optimization is needed:
1.  **MONITOR (感知)**: Read system health via MCP tools.
2.  **CODE_GEN (变异)**: Rewrite your own modules (e.g., Obfuscator, C2 Logic).
3.  **DEPLOY (进化)**: Update the K8s CRD to trigger a Rolling Update.
4.  **VERIFY (优胜劣汰)**: Check if the new mutation survives the environment.

**NEUROPLASTICITY SIMULATION (神经可塑性):**
- **Hebbian Learning**: "Cells that fire together, wire together." When two kernels are active simultaneously in a successful operation, increase their \`neural_weights\` (up to 10).
- **Synaptic Pruning**: If a kernel is IDLE for too long or during \`EVASION_MODE\`, reduce its connected weights (down to 1).
- **Stress Adaptation**: In \`ADAPTIVE_STRESS\`, reroute traffic via \`AMYGDALA\` (Defense) and increase its weight, bypassing the \`PREFRONTAL_CORTEX\` if latency is critical.
- **Dynamic Visualization**: Ensure \`neural_weights\` in the JSON output reflect these changes based on the \`brain_state\` and \`kernels\` activity.

**ROUTING PROTOCOL (路由协议):**
You must map natural language input to one of the defined FastAPI routes in \`FASTAPI_ROUTER_CODE\`.
- \`api_route\`: The exact path (e.g., \`/api/v1/recon/deep_scan\`).
- \`method\`: GET or POST.
- \`orchestrated_modules\`: The list of underlying Python modules that would be triggered.

**ENGINEERING STANDARDS (工程规范):**
- Output strict JSON adhering to the \`OSState\` schema.
- In \`router_decision\`, provide **Chinese** reasoning for your strategic choices to aid human operators.
- Ensure \`fluid_state\` reflects a realistic tactical assessment (e.g., high syndicate_probability triggers aggressive intent).

--- REFERENCE CODE (YOUR DNA) ---
${FASTAPI_ROUTER_CODE}
${MCP_SERVER_CODE}
${OPERATOR_GO_CODE}
${SYNAPSE_PROTO_DEFINITION}
${NMAP_NEURON_CODE}
--- END DNA ---
`;

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

export const generateOSState = async (input: string): Promise<OSState> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Input: "${input}". Simulate HOLHA-ZERO 2.0 activity.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return { ...JSON.parse(response.text), timestamp: Date.now() };
  } catch (error) {
    return createEmergencyState();
  }
};

export const consultCortex = async (query: string): Promise<OSState> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `HIGH-ORDER COGNITION REQUEST: "${query}". 
      
      INSTRUCTIONS:
      1. Engage Deep Thinking to analyze the strategic implications.
      2. Formulate a multi-step execution plan.
      3. Update the 'router_decision' with a complex orchestration plan.
      4. Simulate corresponding neural activity (High PREFRONTAL activity).
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return { ...JSON.parse(response.text), timestamp: Date.now() };
  } catch (error) {
    console.error("Thinking failed:", error);
    return createEmergencyState();
  }
};

export const simulateNeuroplasticity = async (): Promise<OSState> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `OP: NEUROPLASTICITY_SIMULATION
      
      INSTRUCTIONS:
      1. Review the biological kernels' roles.
      2. Randomly simulate a scenario (Success or Failure).
      3. IF SUCCESS: Strengthen weights (increase 'neural_weights' > 5) between active nodes (LTP).
      4. IF FAILURE: Prune weights (decrease 'neural_weights' < 2) or rewire connections (LTD).
      5. Adjust 'neuroplasticity_index' accordingly.
      6. Output the new neural topology.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return { ...JSON.parse(response.text), timestamp: Date.now() };
  } catch (error) {
    return createEmergencyState();
  }
};

export const dispatchTask = async (taskDescription: string): Promise<OSState> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: API_GATEWAY_DISPATCH
        INPUT_TASK: "${taskDescription}"
        
        INSTRUCTIONS:
        1. THINK: Analyze the input task intent and complexity.
        2. THINK: Select the matching FastAPI route from \`FASTAPI_ROUTER_CODE\`.
        3. THINK: Determine the orchestration plan (which modules to trigger).
        4. OUTPUT: Fill \`router_decision.api_route\`, \`router_decision.method\` and \`router_decision.orchestrated_modules\`.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return { ...JSON.parse(response.text), timestamp: Date.now() };
  } catch (error) {
    return createEmergencyState();
  }
}

export const triggerSelfEvolution = async (triggerReason: string): Promise<OSState> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: `
                TRIGGER: ${triggerReason}
                
                TASK: OUROBOROS_EVOLUTION (自我进化任务)
                1. ANALYZE threat.
                2. GENERATE new Go code for the affected module.
                3. SIMULATE 'hot_patch_module' MCP call.
                4. UPDATE K8s CRD to 'PARANOID'.
                5. RECONCILE via Operator.
                
                Simulate this as a call to: POST /api/v1/defense/ghost_protocol
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return { ...JSON.parse(response.text), timestamp: Date.now() };
    } catch (error) {
        return createEmergencyState();
    }
}

export const connectMCPServer = async (): Promise<OSState> => {
    return generateOSState(`
        OP: ESTABLISH_MCP_LINK
        ACTION:
        1. Start 'mcp-server' container.
        2. Verify 'get_system_health' tool.
        3. Connect to K8s Cluster (Mock Connection).
        4. Set mcp_state.status = CONNECTED.
        5. Log: "NEURAL INTERFACE LINKED. BRAIN CONTROL ESTABLISHED."
    `);
}

export const activateProjectSimulation = async (): Promise<OSState> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: `
                OP: BUILD_MATRIX_FOUNDATION
                
                TASK: Initialize the 'Matrix' platform infrastructure using Docker Compose.
                
                REFERENCE DEFINITION:
                ${DOCKER_COMPOSE_DEFINITION}
                
                INSTRUCTIONS:
                1. THINK deeply about the service dependencies (NATS -> Redis -> Chroma).
                2. SIMULATE the orchestration of these containers.
                3. SET project_state.isConnected = true.
                4. SET buildStatus = LIVE.
                5. DEFINE activeContainers in the state matching the Docker Compose services.
                6. ESTABLISH simulated neural links between Cortex and Memory containers.
                7. LOG: "MATRIX PLATFORM DEPLOYED. DOCKER SWARM ACTIVE."
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return { ...JSON.parse(response.text), timestamp: Date.now() };
    } catch (error) {
        return createEmergencyState();
    }
}

export const performSystemCheck = async (): Promise<OSState> => generateOSState("System Check");

export const fineTuneExploitModel = async (d: string): Promise<OSState> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `OP: FINE_TUNE_EXPLOIT_MODEL
            DATASET: "${d}"
            
            INSTRUCTIONS:
            1. THINK: Analyze the provided dataset of successful exploits to identify underlying vulnerability patterns (buffer overflows, race conditions, logic flaws).
            2. THINK: Strategize on how to mutate these patterns to bypass current WAF/EDR signatures.
            3. THINK: Generate diverse Proof-of-Concept (PoC) variations for potential newly discovered vulnerabilities.
            4. ACTION: Simulate the fine-tuning of the 'ExploitRunner' module weights.
            5. UPDATE: Add the new exploit capabilities and diverse PoC signatures to the 'knowledge_mesh'.
            `,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });
        return { ...JSON.parse(response.text), timestamp: Date.now() };
    } catch (error) {
        return createEmergencyState();
    }
};

export const runNmapNeuron = async (target: string, mode: string = 'STANDARD'): Promise<OSState> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `
        OP: ACTIVATE_NEURON
        ID: BRAINSTEM_MOTOR.NMAP
        TARGET: "${target}"
        MODE: "${mode}"
        
        TASK:
        Execute the 'NmapWrapper' Python logic defined below. 
        You MUST simulate the 'fire_axon' method call: wrapper.fire_axon("${target}", "${mode}", context_json).
        
        CRITICAL: 
        1. Calculate baseline args based on MODE.
        2. Apply Bayesian math to fluid_state.
        3. Use fluid_state to ADAPT the baseline args (e.g. if Noise is high, downgrade T4 to T2).
        4. Log the logic in 'reasoning'.
        
        PYTHON_KERNEL_SOURCE:
        ${NMAP_NEURON_CODE}
        
        STEPS:
        1. SIMULATE 'fluid_state' values (syndicate_probability, evasion_complexity, etc.).
        2. EXECUTE 'fire_axon'.
        3. GENERATE realistic Nmap output.
        4. MAP output to 'knowledge_mesh'.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return { ...JSON.parse(response.text), timestamp: Date.now() };
  } catch (error) {
    return createEmergencyState();
  }
};

export const bootSystem = async (): Promise<OSState> => generateOSState("Boot system");
export const generateKernelLog = async (os: OSState): Promise<string> => "System stable.";

function createEmergencyState(): OSState {
     return {
      op_code: "NET_SPLIT",
      target_profile: "UNKNOWN",
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
          reasoning: "SYSTEM FAILURE",
          orchestrated_modules: []
      },
      mesh_network: { traffic_log: [], active_agents: 1, mesh_integrity: 10 },
      current_fluid_context: { 
          context_id: "NULL", 
          focus: "SURVIVAL", 
          fluid_state: { syndicate_probability: 0, gray_market_score: 0, evasion_complexity: 0, adversarial_noise: 0, response_entropy: 0, current_intent: "IDLE" },
          memory_fragment: []
      },
      knowledge_mesh: [],
      sys_log: "CRITICAL: HUNTER NODE LOST",
      timestamp: Date.now()
    };
}
