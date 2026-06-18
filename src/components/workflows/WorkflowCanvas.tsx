"use client";

import { useCallback, useRef, useState } from "react";
import {
  createDefaultNode,
  createEdgeId,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowNodeType,
  type WorkflowStepResult,
} from "@/lib/workflows";
import {
  WorkflowNodeCard,
  NODE_WIDTH,
  NODE_HEIGHT,
  getNodePortPosition,
} from "@/components/workflows/WorkflowNodeCard";

interface WorkflowCanvasProps {
  graph: WorkflowGraph;
  selectedNodeId: string | null;
  runSteps?: WorkflowStepResult[];
  onChange: (graph: WorkflowGraph) => void;
  onSelectNode: (id: string | null) => void;
}

function buildEdgePath(
  source: { x: number; y: number },
  target: { x: number; y: number }
): string {
  const dy = target.y - source.y;
  const cp = Math.max(40, Math.abs(dy) * 0.5);
  return `M ${source.x} ${source.y} C ${source.x} ${source.y + cp}, ${target.x} ${target.y - cp}, ${target.x} ${target.y}`;
}

export function WorkflowCanvas({
  graph,
  selectedNodeId,
  runSteps,
  onChange,
  onSelectNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const stepMap = new Map(runSteps?.map((s) => [s.nodeId, s]));

  const updateNodes = useCallback(
    (nodes: WorkflowNode[]) => onChange({ ...graph, nodes }),
    [graph, onChange]
  );

  const updateEdges = useCallback(
    (edges: WorkflowEdge[]) => onChange({ ...graph, edges }),
    [graph, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/workflow-node") as WorkflowNodeType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;
    const x = e.clientX - rect.left + scrollLeft - NODE_WIDTH / 2;
    const y = e.clientY - rect.top + scrollTop - NODE_HEIGHT / 2;

    const node = createDefaultNode(type, {
      x: Math.max(20, x),
      y: Math.max(20, y),
    });

    onChange({
      ...graph,
      nodes: [...graph.nodes, node],
    });
    onSelectNode(node.id);
  }

  function handlePortClick(nodeId: string, port: "input" | "output") {
    if (port === "output") {
      setConnectFrom(nodeId);
      return;
    }

    if (connectFrom && connectFrom !== nodeId) {
      const exists = graph.edges.some(
        (e) => e.source === connectFrom && e.target === nodeId
      );
      if (!exists) {
        updateEdges([
          ...graph.edges,
          { id: createEdgeId(), source: connectFrom, target: nodeId },
        ]);
      }
      setConnectFrom(null);
    }
  }

  function handlePointerDown(nodeId: string, e: React.PointerEvent) {
    if (!canvasRef.current) return;
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    setDragging({
      nodeId,
      offsetX: e.clientX - rect.left + scrollLeft - node.position.x,
      offsetY: e.clientY - rect.top + scrollTop - node.position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const x = e.clientX - rect.left + scrollLeft - dragging.offsetX;
    const y = e.clientY - rect.top + scrollTop - dragging.offsetY;

    updateNodes(
      graph.nodes.map((n) =>
        n.id === dragging.nodeId
          ? { ...n, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : n
      )
    );
  }

  function handlePointerUp() {
    setDragging(null);
  }

  function deleteNode(nodeId: string) {
    onChange({
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== nodeId),
      edges: graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    });
    if (selectedNodeId === nodeId) onSelectNode(null);
  }

  const canvasHeight = Math.max(
    700,
    ...graph.nodes.map((n) => n.position.y + NODE_HEIGHT + 80)
  );
  const canvasWidth = Math.max(
    800,
    ...graph.nodes.map((n) => n.position.x + NODE_WIDTH + 80)
  );

  return (
    <div
      ref={canvasRef}
      className="relative h-full min-h-[560px] flex-1 overflow-auto rounded-xl border border-white/[0.08] bg-[#08080a]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => {
        onSelectNode(null);
        setConnectFrom(null);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(124,58,237,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          minWidth: canvasWidth,
          minHeight: canvasHeight,
        }}
      />

      {/* Edges */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={canvasWidth}
        height={canvasHeight}
        style={{ minWidth: canvasWidth, minHeight: canvasHeight }}
      >
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {graph.edges.map((edge) => {
          const sourceNode = graph.nodes.find((n) => n.id === edge.source);
          const targetNode = graph.nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const from = getNodePortPosition(sourceNode, "output");
          const to = getNodePortPosition(targetNode, "input");
          const isActive =
            runSteps?.some(
              (s) =>
                s.nodeId === edge.source &&
                s.status === "completed" &&
                runSteps.find((t) => t.nodeId === edge.target)?.status !== "pending"
            ) ?? false;

          return (
            <path
              key={edge.id}
              d={buildEdgePath(from, to)}
              fill="none"
              stroke={isActive ? "url(#edge-gradient)" : "rgba(124,58,237,0.35)"}
              strokeWidth={isActive ? 2.5 : 2}
              strokeDasharray={isActive ? undefined : "6 4"}
            />
          );
        })}
      </svg>

      {/* Connect hint */}
      {connectFrom && (
        <div className="absolute left-4 top-4 z-20 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs text-brand-300">
          Click an input port on another node to connect
        </div>
      )}

      {/* Nodes */}
      <div
        className="relative"
        style={{ minWidth: canvasWidth, minHeight: canvasHeight }}
      >
        {graph.nodes.map((node) => (
          <WorkflowNodeCard
            key={node.id}
            node={node}
            selected={selectedNodeId === node.id}
            runStep={stepMap.get(node.id)}
            connectSource={connectFrom === node.id}
            onSelect={() => onSelectNode(node.id)}
            onDelete={() => deleteNode(node.id)}
            onDragStart={(e) => handlePointerDown(node.id, e)}
            onPortClick={(port) => handlePortClick(node.id, port)}
          />
        ))}

        {graph.nodes.length === 0 && (
          <div className="flex h-[560px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-content-muted">Drop nodes here</p>
            <p className="mt-1 text-xs text-content-subtle">
              Drag from the palette or click a node to add
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
