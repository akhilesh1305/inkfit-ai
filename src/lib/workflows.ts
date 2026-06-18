export type WorkflowNodeType =
  | "blog_generator"
  | "seo_writer"
  | "linkedin_generator"
  | "carousel_generator"
  | "image_studio"
  | "calendar";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  config: WorkflowNodeConfig;
}

export interface WorkflowNodeConfig {
  topic?: string;
  tone?: string;
  length?: string;
  targetKeyword?: string;
  contentType?: string;
  slides?: number;
  imageStyle?: string;
  aspectRatio?: string;
  calendarAction?: "add_to_calendar" | "schedule_post";
  platform?: string;
  daysFromNow?: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowInput {
  topic: string;
  audience?: string;
  targetKeyword?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  input: WorkflowInput;
}

export interface WorkflowNodeMeta {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  creditAction?: string;
}

export const WORKFLOW_NODE_META: Record<WorkflowNodeType, WorkflowNodeMeta> = {
  blog_generator: {
    type: "blog_generator",
    label: "Blog Generator",
    description: "Generate SEO blog post from topic",
    icon: "FileText",
    color: "#7C3AED",
    gradient: "from-violet-600 to-purple-700",
    creditAction: "content_generation",
  },
  seo_writer: {
    type: "seo_writer",
    label: "SEO Writer",
    description: "Write keyword-optimized article",
    icon: "Search",
    color: "#10B981",
    gradient: "from-emerald-600 to-teal-700",
    creditAction: "seo_article",
  },
  linkedin_generator: {
    type: "linkedin_generator",
    label: "LinkedIn Generator",
    description: "Create LinkedIn post from content",
    icon: "Linkedin",
    color: "#0A66C2",
    gradient: "from-blue-600 to-indigo-700",
    creditAction: "content_generation",
  },
  carousel_generator: {
    type: "carousel_generator",
    label: "Carousel Generator",
    description: "Build LinkedIn carousel slides",
    icon: "Layers",
    color: "#8B5CF6",
    gradient: "from-purple-600 to-violet-700",
    creditAction: "content_generation",
  },
  image_studio: {
    type: "image_studio",
    label: "Image Studio",
    description: "Generate AI image for the post",
    icon: "Image",
    color: "#EC4899",
    gradient: "from-pink-600 to-rose-700",
    creditAction: "ai_image",
  },
  calendar: {
    type: "calendar",
    label: "Calendar",
    description: "Add to calendar & schedule post",
    icon: "Calendar",
    color: "#06B6D4",
    gradient: "from-cyan-600 to-blue-700",
  },
};

export const WORKFLOW_NODE_LIST = Object.values(WORKFLOW_NODE_META);

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string;
  status: string;
  nodeCount: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepResult {
  nodeId: string;
  type: WorkflowNodeType;
  label: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  output?: string;
  preview?: string;
  error?: string;
  durationMs?: number;
}

export interface WorkflowRunResult {
  runId: string;
  status: "running" | "completed" | "failed";
  steps: WorkflowStepResult[];
  error?: string;
}

export function createNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultNode(
  type: WorkflowNodeType,
  position: { x: number; y: number }
): WorkflowNode {
  const defaults: Record<WorkflowNodeType, WorkflowNodeConfig> = {
    blog_generator: { tone: "professional", length: "medium" },
    seo_writer: { targetKeyword: "" },
    linkedin_generator: { contentType: "thought-leadership" },
    carousel_generator: { slides: 7 },
    image_studio: { imageStyle: "modern-saas", aspectRatio: "1:1" },
    calendar: { calendarAction: "schedule_post", platform: "linkedin", daysFromNow: 3 },
  };

  return {
    id: createNodeId(),
    type,
    position,
    config: defaults[type],
  };
}

export function createStarterWorkflow(): WorkflowGraph {
  const nodes: WorkflowNode[] = [
    createDefaultNode("blog_generator", { x: 280, y: 60 }),
    createDefaultNode("linkedin_generator", { x: 280, y: 220 }),
    createDefaultNode("image_studio", { x: 280, y: 380 }),
    createDefaultNode("calendar", { x: 280, y: 540 }),
  ];

  const edges: WorkflowEdge[] = nodes.slice(0, -1).map((node, i) => ({
    id: createEdgeId(),
    source: node.id,
    target: nodes[i + 1].id,
  }));

  return {
    nodes,
    edges,
    input: { topic: "AI content marketing trends", audience: "founders and marketers" },
  };
}

export function parseWorkflowGraph(
  nodesJson: string,
  edgesJson: string,
  inputJson: string
): WorkflowGraph {
  try {
    return {
      nodes: JSON.parse(nodesJson) as WorkflowNode[],
      edges: JSON.parse(edgesJson) as WorkflowEdge[],
      input: JSON.parse(inputJson) as WorkflowInput,
    };
  } catch {
    return createStarterWorkflow();
  }
}

export function serializeWorkflowGraph(graph: WorkflowGraph) {
  return {
    nodes: JSON.stringify(graph.nodes),
    edges: JSON.stringify(graph.edges),
    input: JSON.stringify(graph.input),
  };
}

/** Topological execution order; falls back to Y-position sort. */
export function getExecutionOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    adjacency.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodes
    .filter((n) => (inDegree.get(n.id) ?? 0) === 0)
    .sort((a, b) => a.position.y - b.position.y);

  const ordered: WorkflowNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    ordered.push(current);

    for (const nextId of adjacency.get(current.id) ?? []) {
      const deg = (inDegree.get(nextId) ?? 1) - 1;
      inDegree.set(nextId, deg);
      if (deg === 0) {
        const next = nodeMap.get(nextId);
        if (next) queue.push(next);
      }
    }
  }

  const remaining = nodes
    .filter((n) => !visited.has(n.id))
    .sort((a, b) => a.position.y - b.position.y);

  return [...ordered, ...remaining];
}

export function getNodeCenter(node: WorkflowNode, nodeWidth = 220, nodeHeight = 88) {
  return {
    x: node.position.x + nodeWidth / 2,
    y: node.position.y + nodeHeight / 2,
  };
}

export const DEMO_WORKFLOW_SUMMARIES: WorkflowSummary[] = [
  {
    id: "demo-blog-pipeline",
    name: "Blog → LinkedIn → Image → Schedule",
    description: "Full content pipeline from blog to scheduled post",
    status: "active",
    nodeCount: 4,
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
