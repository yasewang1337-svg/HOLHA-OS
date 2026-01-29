

export enum KernelID {
  CORTEX_PREFRONTAL = 'PREFRONTAL_CORTEX', // 前额叶：负责决策、指挥、目标分析
  CORTEX_TEMPORAL = 'TEMPORAL_LOBE',       // 颞叶：负责模式识别、解码、语言处理
  LIMBIC_HIPPOCAMPUS = 'HIPPOCAMPUS',      // 海马体：负责长期记忆、战术库存储
  LIMBIC_AMYGDALA = 'AMYGDALA',            // 杏仁核：负责威胁检测、防御绕过、反溯源
  BRAINSTEM_MOTOR = 'MOTOR_CORTEX'         // 运动皮层：负责具体工具执行 (Nmap/Exploit)
}

export enum BrainState {
  HOMEOSTASIS = 'SURVEILLANCE',      // 稳态：常态化监控
  NEUROGENESIS = 'INTEL_FUSION',     // 神经发生：情报融合与分析
  ACTION_POTENTIAL = 'KINETIC_STRIKE', // 动作电位：发起攻击/执行任务
  SYNAPTIC_PRUNING = 'EVASION_MODE', // 突触修剪：痕迹清除与规避
  ADAPTIVE_STRESS = 'COUNTER_ATTACK' // 应激反应：对抗自动化防御
}

export enum AgentProtocol {
  GRPC = 'gRPC',   // 高性能同步调用
  NATS = 'NATS',   // 异步事件总线 (Synapse)
  GOSSIP = 'GOSSIP' // 节点间状态同步
}

// --- 神经总线消息标准 (Neural Bus Message Standard) ---
export interface AgentMessage {
  id: string;
  timestamp: number;
  protocol: AgentProtocol;
  from: KernelID;
  to: KernelID | 'BROADCAST';
  topic: string; 
  payload: string; // JSON String describing the operational data
  status: 'OK' | 'PENDING' | 'FAILED';
  // 新增：多模态数据引用，用于传输截图或二进制文件
  attachment_ref?: {
      type: 'IMAGE' | 'PCAP' | 'BINARY';
      url: string; // MinIO or S3 link
  };
}

export interface KernelNode {
  id: KernelID;
  name: string;
  role: string; 
  bioRole: string; // 生物学角色映射
  color: string;
  description: string;
}

export interface PredictionNode {
  step: string;
  probability: number;
  impact: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  description: string;
}

// --- 认知循环拓扑 (Cognitive Loop Topology) ---
export interface MultiPointLoop {
  loop_id: string;
  phase: 'SENSATION' | 'PERCEPTION' | 'DECISION' | 'ACTION' | 'FEEDBACK';
  integrity: number; // 循环完整性 (0-100)
  active_nodes: KernelID[];
  iteration_count: number;
}

// --- GOVERNANCE STRUCTURES (v3.0) ---

export interface PolicyAuthority {
    authorized_by_kernel: string;
    policy_ref_id: string;
    assessed_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface DigitalContract {
    operation_id: string;
    roe_hash: string;
    kill_switch_enabled: boolean;
}

// --- 流体上下文 (Fluid Context - The Core "Thought") ---
// 这是Agent OS在任意时刻的"意识切片"
export interface FluidState {
    syndicate_probability: number; // 目标确信度 (0.0 - 1.0)
    gray_market_score: number;     // 灰产关联度
    evasion_complexity: number;    // 防御穿透难度
    adversarial_noise: number;     // 环境对抗噪声水平
    response_entropy: number;      // 响应熵 (衡量系统混乱度)
    current_intent: 'IDLE' | 'PASSIVE_FINGERPRINT' | 'DEANONYMIZE_ADMIN' | 'INFRA_MAPPING' | 'DISRUPT_C2' | 'EXFILTRATE_EVIDENCE';
    
    // v3.0 Extensions
    confidence_lower_bound?: number;
    confidence_upper_bound?: number;
}

export interface FluidContext {
  context_id: string; 
  focus: string;      
  fluid_state: FluidState;
  memory_fragment: VectorEmbedding[]; 
  active_loop?: MultiPointLoop;
  
  // v3.0 Governance
  authority?: PolicyAuthority;
  contract?: DigitalContract;

  collaboration_trace?: {
      agent_pair: string;
      interaction_strength: number;
      shared_knowledge_keys: string[];
  }[];
}

export interface VectorEmbedding {
  vector_id?: string;
  dimensions?: number[];
  semantic_tag?: string;
  data_type?: string; 
  source?: string;
  payload?: string;
}

// --- 模块编排接口 (Module Orchestration) ---
// 标准化外部工具（如 Nmap, SQLMap）如何作为 "器官" 接入系统
export interface PipelineModule {
  id: string;
  name: string;
  type: 'SENSOR' | 'PROCESSOR' | 'EFFECTOR'; // 感知器 | 处理器 | 执行器
  status: 'ACTIVE' | 'WAITING' | 'COMPLETE';
  input_data?: string;
  output_data?: string;
  // 模块健康度自检
  health_check?: {
      is_responsive: boolean;
      last_error?: string;
  }
}

export interface RouterDecision {
  route_id: 'KINETIC_STRIKE' | 'GHOST_PROTOCOL' | 'DEEP_RESEARCH' | 'INFRA_DEFENSE' | 'UNKNOWN';
  api_route: string; // e.g. /api/v1/recon/deep_scan
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  confidence: number;
  reasoning: string; // AI 出具的中文决策理由
  orchestrated_modules: PipelineModule[];
}

// --- HOLHA-ZERO 2.0 INFRASTRUCTURE TYPES ---

export interface K8sCampaignCRD {
    stealthLevel: 'STANDARD' | 'PARANOID' | 'AGGRESSIVE';
    activeImplants: number;
    targetRegion: string;
    version: string;
}

export interface EvolutionPipeline {
    status: 'IDLE' | 'ACTIVE';
    current_stage: 'MONITOR' | 'CODE_GEN' | 'COMMIT' | 'BUILD' | 'DEPLOY' | 'VERIFY';
    last_evolution_timestamp: number;
    evolution_log: string[];
}

export interface MCPState {
    status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
    server_health: string;
    active_tools: string[];
    k8s_cluster_state: {
        node_count: number;
        pod_count: number;
        operator_status: 'RECONCILING' | 'IDLE' | 'ERROR';
        current_crd: K8sCampaignCRD;
    }
}

export interface ProjectState {
  isConnected: boolean;
  repoUrl: string;
  buildStatus: 'IDLE' | 'CLONING' | 'INJECTING_AGENTS' | 'COMPILING' | 'LIVE';
  activeContainers: {
    name: string;
    role: string;
    status: 'RUNNING' | 'STOPPED' | 'COMPROMISED';
    injectedAgent: KernelID | null;
  }[];
  generatedCodeSnippet?: string;
}

export interface KnowledgeNode {
  type: string;
  value: string;
  current_utility: number;
  threat_actor?: string; // e.g. "APT-29", "Lazarus Group"
  ttps?: string[]; // e.g. ["T1059", "T1190"]
}

export interface OSState {
  op_code: string;
  target_profile: string;
  brain_state: BrainState;
  
  neuroplasticity_index: number; 
  cognitive_load: number;
  dopamine_level: number;
  
  kernels: {
    [key in KernelID]: {
      activity: number; 
      status: 'IDLE' | 'COMPUTING' | 'TRANSMITTING' | 'OFFLINE';
      current_task: string;
      last_ping: number; 
    }
  };

  neural_weights: { source: KernelID; target: KernelID; weight: number }[];
  prediction_chain: PredictionNode[];
  router_decision?: RouterDecision;

  mesh_network: {
    traffic_log: AgentMessage[];
    active_agents: number;
    mesh_integrity: number; 
  };

  current_fluid_context: FluidContext;
  
  // Advanced Engineering State
  project_state?: ProjectState;
  mcp_state?: MCPState;
  evolution_pipeline?: EvolutionPipeline;
  
  knowledge_mesh?: KnowledgeNode[];
  
  sys_log: string;
  timestamp: number;
}
