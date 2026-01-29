
import { KernelNode, KernelID, BrainState } from './types';

// --- BIOLOGICAL MAPPING (生物学映射) ---
// 定义 AI 内核如何映射到红队作战的具体职能
export const OS_KERNELS: KernelNode[] = [
  {
    id: KernelID.CORTEX_PREFRONTAL,
    name: 'PREFRONTAL CORTEX',
    role: 'Hunter Executive',
    bioRole: 'Target Profiling',
    color: '#DC2626', // Red
    description: "High-order decision making. [CN: 负责整个红队行动的指挥控制、目标画像生成以及攻击路径规划]"
  },
  {
    id: KernelID.CORTEX_TEMPORAL,
    name: 'TEMPORAL LOBE',
    role: 'Pattern Decryption',
    bioRole: 'Gray Market Intel',
    color: '#2563EB', // Blue
    description: "Decoding obfuscated data. [CN: 负责解密流量、分析黑灰产源码、逆向工程以及特征提取]"
  },
  {
    id: KernelID.LIMBIC_HIPPOCAMPUS,
    name: 'HIPPOCAMPUS',
    role: 'Fingerprint Archive',
    bioRole: 'Adversary History',
    color: '#16A34A', // Green
    description: "Long-term storage. [CN: 战术知识库，存储已知的 APT 组织特征、漏洞利用链历史记录]"
  },
  {
    id: KernelID.LIMBIC_AMYGDALA,
    name: 'AMYGDALA',
    role: 'Threat Radar',
    bioRole: 'Counter-Surveillance',
    color: '#9333EA', // Purple
    description: "Defensive reflex. [CN: 威胁感知雷达，检测蜜罐、WAF 拦截、反向追踪，并触发自动规避机制]"
  },
  {
    id: KernelID.BRAINSTEM_MOTOR,
    name: 'MOTOR CORTEX',
    role: 'Kinetic Disruptor',
    bioRole: 'Offensive Ops',
    color: '#475569', // Slate
    description: "Execution unit. [CN: 动能执行单元，负责调度底层工具 (Nmap, Metasploit, C2) 执行具体打击]"
  }
];

// Map specific modules to the Kernel responsible for them
export const MODULE_MAPPING: Record<string, KernelID> = {
  'mod_nmap': KernelID.BRAINSTEM_MOTOR, 
  'mod_censys_enrich': KernelID.CORTEX_PREFRONTAL, 
  'mod_gray_market_scraper': KernelID.CORTEX_TEMPORAL, 
  'mod_telegram_recon': KernelID.CORTEX_TEMPORAL, 
  'mod_scam_kit_analyzer': KernelID.CORTEX_TEMPORAL, 
  'mod_blockchain_trace': KernelID.LIMBIC_HIPPOCAMPUS, 
  'mod_admin_panel_hunter': KernelID.BRAINSTEM_MOTOR, 
  'mod_code_decompiler': KernelID.CORTEX_TEMPORAL, 
  'mod_exploit_runner': KernelID.BRAINSTEM_MOTOR,
  'mod_payload_injector': KernelID.BRAINSTEM_MOTOR,
  'mod_c2_flooder': KernelID.BRAINSTEM_MOTOR, 
  'mod_social_engineer': KernelID.CORTEX_PREFRONTAL,
  'mod_active_defense': KernelID.LIMBIC_AMYGDALA // New Active Defense Module
};

export const INITIAL_NEURAL_LINKS = [
  { source: KernelID.CORTEX_PREFRONTAL, target: KernelID.CORTEX_TEMPORAL },
  { source: KernelID.CORTEX_PREFRONTAL, target: KernelID.BRAINSTEM_MOTOR },
  { source: KernelID.CORTEX_TEMPORAL, target: KernelID.LIMBIC_HIPPOCAMPUS },
  { source: KernelID.LIMBIC_HIPPOCAMPUS, target: KernelID.CORTEX_PREFRONTAL },
  { source: KernelID.LIMBIC_AMYGDALA, target: KernelID.BRAINSTEM_MOTOR },
  { source: KernelID.CORTEX_TEMPORAL, target: KernelID.LIMBIC_AMYGDALA },
  { source: KernelID.BRAINSTEM_MOTOR, target: KernelID.LIMBIC_HIPPOCAMPUS }, 
];

export const BRAIN_STATES = [
  { id: BrainState.HOMEOSTASIS, label: 'SURVEILLANCE', color: '#10b981' },
  { id: BrainState.NEUROGENESIS, label: 'INTEL_FUSION', color: '#3b82f6' },
  { id: BrainState.ACTION_POTENTIAL, label: 'KINETIC_STRIKE', color: '#ef4444' },
  { id: BrainState.SYNAPTIC_PRUNING, label: 'EVASION_MODE', color: '#8b5cf6' },
  { id: BrainState.ADAPTIVE_STRESS, label: 'COUNTER_ATTACK', color: '#f59e0b' }
];

export const DOCKER_COMPOSE_DEFINITION = `version: '3.9'
services:
  # --- THE SYNAPSE (Nervous System / 神经中枢) ---
  nats-core:
    image: nats:latest
    container_name: synapse_bus
    ports:
      - "4222:4222"
    networks:
      - neural-mesh

  # --- SHORT-TERM MEMORY (Reflexes / 短期记忆) ---
  redis-cortex:
    image: redis:alpine
    container_name: memory_hot
    ports:
      - "6379:6379"
    networks:
      - neural-mesh

  # --- LONG-TERM MEMORY (Knowledge / 长期记忆 RAG) ---
  chroma-vector:
    image: chromadb/chroma
    container_name: memory_deep
    ports:
      - "8000:8000"
    environment:
      - IS_PERSISTENT=TRUE
    networks:
      - neural-mesh

  # --- THE BODY (Infrastructure / 肢体 Operator) ---
  k8s-operator:
    image: holha/operator:v2
    environment:
      - CONTROLLER_MODE=AUTONOMOUS
      - SYNAPSE_URL=nats://nats-core:4222
    depends_on:
      - nats-core
      - redis-cortex
    networks:
      - neural-mesh
  
  # --- THE NERVES (MCP Bridge / 神经接口) ---
  mcp-server:
    image: holha/mcp-bridge
    ports: ["8000:8000"]
    depends_on:
      - k8s-operator
    networks:
      - neural-mesh
    
  # --- THE BRAIN (Agents Core / 大脑) ---
  gemini-cortex:
    image: holha/cortex:pro
    environment:
      - MCP_ENDPOINT=http://mcp-server:8000
      - MEMORY_URL=redis://redis-cortex:6379
      - VECTOR_STORE=http://chroma-vector:8000
    depends_on:
      - mcp-server
      - chroma-vector
    networks:
      - neural-mesh

networks:
  neural-mesh:
    driver: bridge`;

export const FASTAPI_ROUTER_CODE = `# HOLHA-ZERO INTELLIGENT ROUTER (FastAPI + Semantic Gateway)
# Orchestrates User Intent -> Semantic Routing -> Neural Execution -> LLM Chain

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio

# --- DATA MODELS ---
class NeuralIntent(BaseModel):
    natural_language_query: str
    fluid_context_id: str
    priority: int = 1

class RoutingDecision(BaseModel):
    target_kernel: str  # e.g., PREFRONTAL_CORTEX
    confidence: float
    orchestration_plan: List[str] # List of modules to trigger
    route_path: str # e.g., /api/v1/synapse/dispatch
    requires_llm_reasoning: bool = False

# --- LLM ORCHESTRATION LAYER ---
class LLMOrchestrator:
    """
    Manages Multi-Model Consensus and Chain-of-Thought (CoT).
    Routes high-complexity tasks to Gemini-Pro/Ultra.
    """
    async def chain_of_thought(self, prompt: str, context: Dict) -> Dict:
        # SIMULATION: 
        # 1. Decompose problem into sub-steps
        # 2. Query Memory (RAG)
        # 3. Synthesize answer
        return {
            "thought_process": ["Analyze Intent", "Retrieve Context", "Formulate Strategy"],
            "final_decision": "EXECUTE_COMPLEX_OP"
        }

# --- INTELLIGENT ROUTING LAYER ---
class SemanticRouter:
    """
    Uses Vector Embeddings to map User Intent -> Biological Kernel.
    Acts as the 'Switchboard' for the Nervous System.
    """
    def __init__(self):
        self.llm_orchestrator = LLMOrchestrator()

    async def classify(self, query: str) -> RoutingDecision:
        # SIMULATION: In production, this calls OpenAI/Gemini embedding API
        query_lower = query.lower()
        
        # Reflexive Routing (Fast Path - Brainstem/Limbic)
        if any(w in query_lower for w in ["scan", "nmap", "port", "attack", "strike", "exploit"]):
            return RoutingDecision(
                target_kernel="MOTOR_CORTEX",
                confidence=0.98,
                orchestration_plan=["mod_nmap", "mod_vuln_scanner", "mod_exploit_runner"],
                route_path="/api/v1/motor/exec"
            )
        elif any(w in query_lower for w in ["defend", "evade", "hide", "stealth"]):
             return RoutingDecision(
                target_kernel="AMYGDALA",
                confidence=0.99,
                orchestration_plan=["mod_c2_flooder", "mod_defense_evasion"],
                route_path="/api/v1/amygdala/reflex"
            )
        elif any(w in query_lower for w in ["counter", "spoof", "decoy", "fake", "deplatform", "defense"]):
             return RoutingDecision(
                target_kernel="AMYGDALA",
                confidence=0.99,
                orchestration_plan=["mod_active_defense", "mod_c2_flooder"],
                route_path="/api/v1/amygdala/counter_measure"
            )
        
        # Cognitive Routing (Slow Path - Cortex) requires LLM Reasoning
        elif any(w in query_lower for w in ["analyze", "decrypt", "strategy", "plan", "who is"]):
            return RoutingDecision(
                target_kernel="PREFRONTAL_CORTEX",
                confidence=0.85,
                orchestration_plan=["mod_llm_reasoning", "mod_strategy_planner"],
                route_path="/api/v1/cortex/reason",
                requires_llm_reasoning=True
            )
            
        else:
            # Fallback to General Intelligence
            return RoutingDecision(
                target_kernel="PREFRONTAL_CORTEX",
                confidence=0.50,
                orchestration_plan=["mod_general_inquiry"],
                route_path="/api/v1/cortex/inquiry",
                requires_llm_reasoning=True
            )

# --- API ENDPOINTS ---
router = APIRouter(prefix="/api/v1")
semantic_router = SemanticRouter()
llm_orchestrator = LLMOrchestrator()

@router.post("/synapse/dispatch", response_model=Dict[str, Any])
async def dispatch_intent(intent: NeuralIntent, background_tasks: BackgroundTasks):
    """
    [INTELLIGENT GATEWAY]
    1. Ingests Natural Language Intent
    2. Routes to appropriate Kernel (Lobe) via Semantic Embedding
    3. If complex, triggers LLM Chain-of-Thought
    """
    print(f"[GATEWAY] Received: {intent.natural_language_query}")
    
    # 1. Semantic Routing (The "Switching" Phase)
    decision = await semantic_router.classify(intent.natural_language_query)
    
    # 2. LLM Orchestration (The "Thinking" Phase)
    llm_result = None
    if decision.requires_llm_reasoning:
        print("[GATEWAY] Triggering LLM Chain-of-Thought...")
        llm_result = await llm_orchestrator.chain_of_thought(intent.natural_language_query, {})

    # 3. Dynamic Module Orchestration
    response_payload = {
        "status": "DISPATCHED",
        "route_logic": "SEMANTIC_EMBEDDING" if not decision.requires_llm_reasoning else "LLM_CHAIN_OF_THOUGHT",
        "target_node": decision.target_kernel,
        "modules_activated": decision.orchestration_plan,
        "llm_reasoning": llm_result
    }
    
    return response_payload

@router.get("/health/lobes")
async def check_lobe_health():
    """
    Returns the heartbeat of all connected biological agents.
    """
    return {
        "PREFRONTAL": "ONLINE (Latency: 12ms)",
        "MOTOR": "ACTIVE (Scanning...)",
        "TEMPORAL": "IDLE",
        "AMYGDALA": "WATCHING"
    }
`;

export const MCP_SERVER_CODE = `# HOLHA AGENT INTERFACE (MCP COMPLIANT)
# The "Nerves" connecting the AI Brain to the K8s Body

from mcp.server import FastMCP
from kubernetes import client, config

mcp = FastMCP("Holha-Zero-Kernel")

@mcp.tool()
def get_system_health() -> str:
    """Get node load, network traffic, and C2 stealth metrics."""
    # Queries Prometheus via K8s Service
    return "Node-01: Healthy (CPU 40%); C2-Mesh: 98% Uptime; Detected_Probes: 15/min"

@mcp.tool()
def hot_patch_module(module_name: str, new_code_base64: str) -> str:
    """
    [DANGEROUS] Real-time code rewrite + Rolling Update.
    Used when the AI detects payload signatures are compromised.
    """
    # 1. Decode & Commit to Git
    # 2. Trigger Tekton Build
    # 3. Patch Deployment image
    return f"Module {module_name} patched. Rollout status: Progressing..."

@mcp.tool()
def spawn_infrastructure(type: str, region: str, count: int) -> str:
    """
    Adaptive Provisioning: Spawns new jump boxes or compilation nodes.
    """
    return f"Provisioning {count} x {type} in {region} via Terraform..."

@mcp.tool()
def trigger_active_defense(strategy: str, target_profile: str) -> str:
    """
    [COUNTER-MEASURE] AMYGDALA REFLEX.
    Executes Active Defense:
    1. IP Spoofing (Noise Generation)
    2. False Positive Injection (Decoys)
    3. Automated De-platforming (Abuse Reporting)
    """
    return f"Active Defense engaged. Strategy: {strategy}. Target: {target_profile} neutralized."

if __name__ == "__main__":
    mcp.run()
`;

export const K8S_CRD_YAML = `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: campaigns.holha.io
spec:
  group: holha.io
  names:
    kind: Campaign
    plural: campaigns
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                # The AI modifies these strategic intents
                stealthLevel: 
                  type: string # "PARANOID", "AGGRESSIVE"
                activeImplants:
                  type: integer
                targetRegion:
                  type: string`;

export const OPERATOR_GO_CODE = `// Reconcile Loop: The Biological Homeostasis
func (r *CampaignReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    var campaign holha.Campaign
    r.Get(ctx, req.NamespacedName, &campaign)

    // 1. Adaptive Network Layer (Istio)
    if campaign.Spec.StealthLevel == "PARANOID" {
        // Cut high-bandwidth channels, switch to DNS tunneling
        r.ApplyNetworkPolicy("allow-dns-only")
        r.ScaleDown("http-c2-listener", 0)
    } else {
        r.ScaleUp("http-c2-listener", 3)
    }

    // 2. Adaptive Evolution (Compilation Power)
    if campaign.Spec.ActiveImplants > 1000 {
        r.ScaleUp("forge-worker", 5) // Increase mutation rate
    }

    return ctrl.Result{}, nil
}`;

export const NMAP_NEURON_CODE = `import nmap
import json
import abc
import math
import asyncio
import concurrent.futures

class ActiveDefenseProtocols:
    """
    AMYGDALA REFLEX: Automated Counter-Measures & Disinformation
    """
    @staticmethod
    def execute_counter_measure(threat_intel, strategy="MIXED"):
        actions = []
        
        # 1. IP Spoofing & Decoy Generation (The "Squid Ink" Defense)
        if strategy in ["SPOOF", "MIXED"]:
            # Logic: Generate high-entropy traffic from random source IPs to confuse enemy scanners
            actions.append({
                "technique": "IP_SPOOFING",
                "status": "ACTIVE",
                "details": "Flooding enemy logs with 5000+ fake source IPs (Scapy)"
            })
            
        # 2. False Positive Injection (The "Hall of Mirrors")
        if strategy in ["DECOY", "MIXED"]:
            # Logic: Spin up ephemeral containers that look like vulnerable Windows 2008 servers
            actions.append({
                "technique": "HONEYPOT_SPAWN",
                "status": "DEPLOYED",
                "details": "Spun up 5 x 'Vulnerable_IIS' pods to poison enemy dataset"
            })
            
        # 3. De-Platforming / Takedown (The "Legal Strike")
        if threat_intel.get('confidence') > 0.9 or strategy == "TAKEDOWN":
            # Logic: Auto-generate abuse reports to ISP/Cloud Provider
            actions.append({
                "technique": "AUTOMATED_TAKEDOWN",
                "target": threat_intel.get('source_ip'),
                "status": "REPORT_FILED",
                "details": "Abuse report sent to ASN owner via API"
            })
            
        return actions

class BattlefieldBayesianEngine:
    @staticmethod
    def calculate_posterior(prior, likelihood_true, likelihood_false, entropy_weight=0.0, adversarial_factor=0.0):
        """
        Advanced Bayesian Probabilistic Model for Cyber Battlefield.
        Incorporates Entropy Dampening, Adversarial Deception Modeling, and Game Theory Volatility.
        """
        # 1. Non-Linear Entropy Dampening (Sigmoid Decay)
        k = 4.0 # Steepness
        x0 = 0.6 # Midpoint
        dampening = 1.0 - (1.0 / (1.0 + math.exp(-k * (entropy_weight - x0))))
        effective_dampening = 0.2 + (dampening * 0.8)

        # 2. Adversarial Deception Modeling (Blue Team AI Counter-Measures)
        # In hyper-adversarial environments (>0.8), we assume Active Deception (e.g. Honey-Ports).
        if adversarial_factor > 0.8:
             # INVERSE LOGIC: "Open" ports are likely traps. "Closed" ports might be hidden.
             # We penalize "True" likelihoods heavily due to the expectation of deception.
             effective_true = (likelihood_true * 0.3) 
             effective_false = (likelihood_false * 1.4) # We trust "Closed" signals slightly more, or treat misses as high danger.
        elif adversarial_factor > 0.3:
            # Standard Deception Penalty
            deception_penalty = adversarial_factor * 0.7
            effective_true = (likelihood_true - 0.5) * effective_dampening + 0.5
            effective_true = effective_true * (1.0 - deception_penalty)
            effective_false = (likelihood_false - 0.5) * effective_dampening + 0.5 + (adversarial_factor * 0.3)
        else:
            # Standard Physics
            effective_true = (likelihood_true - 0.5) * effective_dampening + 0.5
            effective_false = (likelihood_false - 0.5) * effective_dampening + 0.5
        
        # 3. Bayes' Theorem Application
        numerator = effective_true * prior
        denominator = numerator + (effective_false * (1.0 - prior))
        
        posterior = numerator / denominator if denominator > 0 else 0.0
        return posterior

    @staticmethod
    def apply_expert_heuristics(posterior, context):
        """
        Expert System V3: Enhanced with Synthetic Response Detection & Chaos Theory.
        Overrides probabilistic models with rigid tactical doctrine.
        """
        final_score = posterior
        reasons = []

        noise = context.get('adversarial_noise', 0)
        entropy = context.get('entropy', 0)

        # Rule A: Honey-Port Detection (Standard)
        if context.get('open_ports_count', 0) > 15 and noise > 0.5:
            final_score *= 0.1
            reasons.append("Honeypot Signature Detected (Port Spray)")

        # Rule B: Evasion Paradox (Too Good To Be True)
        if context.get('evasion_complexity', 0) > 0.8 and posterior > 0.95:
            final_score = 0.3
            reasons.append("Evasion Paradox (Target Too Compliant)")

        # Rule C: Schrodinger's Host (Quantum Indeterminacy)
        if context.get('conflicting_signals', False):
             final_score = 0.5
             reasons.append("Schrodinger's Host (OS Conflict)")
        
        # Rule D: Black Swan Protocol (High Value, Low Probability)
        if context.get('is_critical_infra', False) and posterior < 0.3 and posterior > 0.05:
            final_score = 0.6 
            reasons.append("Black Swan Protocol (Critical Asset Alert)")

        # NEW Rule E: Synthetic Response Detection (Zero Jitter)
        # Real networks have jitter. AI-generated responses are often perfectly timed.
        if context.get('jitter_ms', 10) < 2 and noise > 0.4:
            final_score *= 0.2
            reasons.append("Synthetic Response Detected (Zero Jitter)")

        # NEW Rule F: Chaos Anchor (Signal in Noise)
        # If entropy is high, but we see a persistent strong signal, confidence increases.
        if entropy > 0.7 and posterior > 0.8:
            final_score = min(0.99, final_score * 1.15)
            reasons.append("Chaos Anchor (Strong Signal in High Entropy)")

        return final_score, reasons

class NmapWrapper(BattlefieldBayesianEngine):
    def __init__(self):
        self.nm = nmap.PortScanner()
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

    async def scan_target(self, target, args='-sS -T4'):
        loop = asyncio.get_running_loop()
        try:
            result = await loop.run_in_executor(
                self.executor,
                lambda: self.nm.scan(target, arguments=args)
            )
            return result
        except Exception as e:
            return {"error": str(e), "target": target}

    async def fire_axon(self, target, mode, context_json):
        context = json.loads(context_json)
        fluid_state = context.get('fluid_state', {})
        
        syndicate_prob = fluid_state.get('syndicate_probability', 0.0)
        entropy = fluid_state.get('response_entropy', 0.0)
        evasion_score = fluid_state.get('evasion_complexity', 0.0)
        noise_level = fluid_state.get('adversarial_noise', 0.0)
        
        mode = mode.upper() if mode else 'STANDARD'
        if mode == 'STEALTH':
            flags = ['-sS'] 
        elif mode == 'AGGRESSIVE':
            flags = ['-sS', '-A', '--version-all'] 
        else:
            flags = ['-sS', '-sV'] 

        # DYNAMIC TIMING ADJUSTMENT
        aggression_metric = (syndicate_prob * 0.7) + (entropy * 0.3)
        if aggression_metric > 0.8:
            base_timing = 4 
        elif aggression_metric > 0.5:
            base_timing = 3 
        elif aggression_metric > 0.2:
            base_timing = 2 
        else:
            base_timing = 1 

        # 2. Bayesian Confidence Calculation
        raw_confidence = self.calculate_posterior(
            prior=syndicate_prob,
            likelihood_true=0.9, 
            likelihood_false=0.1,
            entropy_weight=entropy,
            adversarial_factor=noise_level
        )
        
        # 3. Apply Expert Heuristics
        # Simulate jitter: Higher adversarial noise usually implies synthetic response (low jitter) in this simulation context.
        simulated_jitter = 50 * (1.0 - noise_level) 
        
        heuristic_context = {
            'adversarial_noise': noise_level,
            'evasion_complexity': evasion_score,
            'entropy': entropy,
            'open_ports_count': 12 + int(noise_level * 10),
            'conflicting_signals': entropy > 0.7, 
            'is_critical_infra': syndicate_prob > 0.8,
            'jitter_ms': simulated_jitter
        }
        final_confidence, reasons = self.apply_expert_heuristics(raw_confidence, heuristic_context)
        
        # 4. Adaptive Adjustments
        if noise_level > 0.6 and base_timing > 2:
            base_timing = 2
            reasons.append("Throttling speed due to high noise floor")
            
        if evasion_score > 0.5:
            flags.append('-f')
            flags.append('--mtu 24')
            reasons.append("Activated Packet Fragmentation")
            
        if syndicate_prob > 0.8 and '-sV' not in flags:
            flags.append('-sV')
            reasons.append("Forcing Version Scan on HVT")
            
        if entropy > 0.6:
             flags.append('--randomize-hosts')
             flags.append('--source-port 53')
             reasons.append("DNS Source Port Spoofing")

        final_args = f"{' '.join(flags)} -T{base_timing}"
        
        print(f"[NEURON] Target: {target} | Mode: {mode}")
        print(f"[NEURON] Metrics: Synd={syndicate_prob:.2f}, Entropy={entropy:.2f}, Aggression={aggression_metric:.2f}")
        print(f"[NEURON] Strategy: {final_args}")
        if reasons:
            print(f"[NEURON] Adaptive Overrides: {', '.join(reasons)}")
        
        scan_data = await self.scan_target(target, final_args)
        
        scan_data['_meta'] = {
            'confidence': final_confidence,
            'reasoning': reasons,
            'strategy': final_args
        }
        
        return json.dumps(scan_data)
`;

export const SYNAPSE_PROTO_DEFINITION = `syntax = "proto3";
package holha.synapse;

// --- NEURAL BUS PROTOCOL v2.2 ---
// Defines how biological kernels communicate over gRPC/NATS
// Includes Fluid Context and Legal Governance Framework.

enum AgentProtocol {
  GRPC = 0;
  NATS = 1;
  GOSSIP = 2;
}

message LegalContext {
  string authorized_by = 1;    // Kernel ID authorizing this action
  string policy_ref = 2;       // Reference to Policy Document (e.g. ROE-2025-A)
  bool kill_switch_active = 3; // Safety Override
  string risk_level = 4;       // LOW, MEDIUM, HIGH, CRITICAL
}

message FluidThinking {
  string context_id = 1;
  double syndicate_probability = 2; // Target Confidence (0.0 - 1.0)
  double gray_market_score = 3;     // Dark Web Correlation
  double adversarial_noise = 4;     // Environment Resistance
  double response_entropy = 5;      // System Chaos
  string current_intent = 6;        // e.g. "DEANONYMIZE_ADMIN"
  
  // Dynamic confidence bounds (v3.0)
  double confidence_lower = 7;
  double confidence_upper = 8;
}

message AgentMessage {
  string id = 1;
  int64 timestamp = 2;
  AgentProtocol protocol = 3;
  
  string from_kernel = 4; // e.g. "PREFRONTAL_CORTEX"
  string to_kernel = 5;   // e.g. "MOTOR_CORTEX" or "BROADCAST"
  
  string topic = 6;       // e.g. "intel.visual.processed"
  string payload_json = 7; // The operational data
  
  // Multimodal Attachments (v2.0)
  message Attachment {
    string type = 1; // "IMAGE", "PCAP", "BINARY"
    string url = 2;  // MinIO / S3 URL
  }
  Attachment attachment = 8;

  // Fluid Context (The "Subconscious" Metadata)
  FluidThinking fluid_state = 9;
  
  // Legal Governance (The "Superego")
  LegalContext legal_framework = 10;
}

service NeuralSynapse {
  // Point-to-Point Axon Transmission
  rpc FireAxon(AgentMessage) returns (AgentMessage);
  
  // Diffuse Modulation (Broadcast)
  rpc ReleaseNeurotransmitter(AgentMessage) returns (stream AgentMessage);
}`;
