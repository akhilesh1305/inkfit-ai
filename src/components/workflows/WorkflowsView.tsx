"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GitBranch,
  Loader2,
  Play,
  Plus,
  Save,
  Trash2,
  Copy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WorkflowNodePalette } from "@/components/workflows/WorkflowNodePalette";
import { WorkflowCanvas } from "@/components/workflows/WorkflowCanvas";
import { WorkflowInspector } from "@/components/workflows/WorkflowInspector";
import { WorkflowRunPanel } from "@/components/workflows/WorkflowRunPanel";
import {
  createDefaultNode,
  createStarterWorkflow,
  type WorkflowGraph,
  type WorkflowNodeConfig,
  type WorkflowNodeType,
  type WorkflowRunResult,
  type WorkflowSummary,
} from "@/lib/workflows";
import { cn } from "@/lib/utils";

export function WorkflowsView() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled Workflow");
  const [graph, setGraph] = useState<WorkflowGraph>(createStarterWorkflow());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<WorkflowRunResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) ?? null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/workflows");
    if (res.ok) {
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    }
    setLoading(false);
  }, []);

  const loadWorkflow = useCallback(async (id: string) => {
    const res = await fetch(`/api/workflows?id=${id}`);
    if (!res.ok) return;
    const data = await res.json();
    const wf = data.workflow;
    setActiveId(wf.id);
    setName(wf.name);
    setGraph(wf.graph);
    setSelectedNodeId(null);
    setRunResult(null);
    setDirty(false);
  }, []);

  useEffect(() => {
    loadList().then(() => {
      fetch("/api/workflows")
        .then((r) => r.json())
        .then((d) => {
          const first = d.workflows?.[0];
          if (first) loadWorkflow(first.id);
        });
    });
  }, [loadList, loadWorkflow]);

  function handleGraphChange(next: WorkflowGraph) {
    setGraph(next);
    setDirty(true);
  }

  function handleAddNode(type: WorkflowNodeType) {
    const y =
      graph.nodes.length > 0
        ? Math.max(...graph.nodes.map((n) => n.position.y)) + 160
        : 60;
    const node = createDefaultNode(type, { x: 280, y });
    handleGraphChange({ ...graph, nodes: [...graph.nodes, node] });
    setSelectedNodeId(node.id);
  }

  function handleNodeConfigChange(nodeId: string, config: WorkflowNodeConfig) {
    handleGraphChange({
      ...graph,
      nodes: graph.nodes.map((n) => (n.id === nodeId ? { ...n, config } : n)),
    });
  }

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  async function handleCreate() {
    const { res, data } = await apiPost({
      action: "create",
      name: "New Workflow",
      graph: createStarterWorkflow(),
    });
    if (res.ok) {
      await loadList();
      await loadWorkflow(data.workflow.id);
      showToast("Workflow created");
    }
  }

  async function handleSave(): Promise<boolean> {
    if (!activeId) {
      const { res, data } = await apiPost({
        action: "create",
        name,
        graph,
      });
      if (res.ok) {
        setActiveId(data.workflow.id);
        setDirty(false);
        await loadList();
        showToast("Workflow saved");
        return true;
      }
      showToast(data.error ?? "Save failed");
      return false;
    }

    setSaving(true);
    try {
      const { res, data } = await apiPost({
        action: "save",
        id: activeId,
        name,
        graph,
      });
      if (res.ok) {
        setDirty(false);
        await loadList();
        showToast("Workflow saved");
        return true;
      }
      showToast(data.error ?? "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleRun() {
    if (!activeId) {
      showToast("Save workflow before running");
      return;
    }
    if (graph.nodes.length === 0) {
      showToast("Add at least one node");
      return;
    }

    if (dirty) {
      const saved = await handleSave();
      if (!saved) return;
    }

    setRunning(true);
    setRunResult(null);

    const { res, data } = await apiPost({ action: "run", id: activeId });
    setRunning(false);

    if (res.status === 402) {
      showToast(data.error ?? "Insufficient credits");
      return;
    }

    if (res.ok && data.run) {
      setRunResult(data.run);
      showToast(
        data.run.status === "completed"
          ? "Workflow completed successfully"
          : "Workflow failed — check run log"
      );
      await loadList();
    } else {
      showToast(data.error ?? "Run failed");
    }
  }

  async function handleDelete() {
    if (!activeId) return;
    if (!confirm("Delete this workflow?")) return;
    const { res } = await apiPost({ action: "delete", id: activeId });
    if (res.ok) {
      setActiveId(null);
      setGraph(createStarterWorkflow());
      setName("Untitled Workflow");
      await loadList();
      showToast("Workflow deleted");
    }
  }

  async function handleDuplicate() {
    if (!activeId) return;
    const { res, data } = await apiPost({ action: "duplicate", id: activeId });
    if (res.ok) {
      await loadList();
      await loadWorkflow(data.workflow.id);
      showToast("Workflow duplicated");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col space-y-4 lg:h-[calc(100vh-5rem)]">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <GitBranch className="h-7 w-7 text-brand-400" />
            Workflow Automation
          </span>
        }
        description="Build visual content pipelines — drag nodes, connect steps, and run automatically."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <input
          className="min-w-[180px] flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-content-subtle"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(true);
          }}
          placeholder="Workflow name"
        />
        {dirty && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            Unsaved
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleCreate} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="New workflow">
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary !px-2.5 !py-1.5 text-xs"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run
          </button>
          {activeId && (
            <>
              <button type="button" onClick={handleDuplicate} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Duplicate">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={handleDelete} className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-400" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Builder layout */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] lg:flex-row">
        {/* Workflow list */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-white/[0.06] lg:flex">
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-content-subtle">
              My workflows
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                type="button"
                onClick={() => loadWorkflow(wf.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition",
                  activeId === wf.id
                    ? "bg-brand-500/15 border border-brand-500/30"
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <p className="truncate text-xs font-medium text-white">{wf.name}</p>
                <p className="mt-0.5 text-[10px] text-content-subtle">
                  {wf.nodeCount} nodes
                  {wf.lastRunAt && ` · Ran ${new Date(wf.lastRunAt).toLocaleDateString()}`}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* Node palette */}
        <aside className="hidden w-56 shrink-0 border-r border-white/[0.06] xl:block">
          <WorkflowNodePalette onAddNode={handleAddNode} />
        </aside>

        {/* Canvas */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
            <Zap className="h-3.5 w-3.5 text-brand-400" />
            <p className="text-xs text-content-muted">
              Drag nodes · Connect output → input ports · Run to execute in order
            </p>
          </div>
          <div className="relative min-h-0 flex-1 p-3">
            <WorkflowCanvas
              graph={graph}
              selectedNodeId={selectedNodeId}
              runSteps={runResult?.steps}
              onChange={handleGraphChange}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <WorkflowRunPanel run={runResult} running={running} />
        </div>

        {/* Inspector */}
        <aside className="hidden w-64 shrink-0 border-l border-white/[0.06] lg:block">
          <WorkflowInspector
            graph={graph}
            selectedNode={selectedNode}
            onGraphChange={handleGraphChange}
            onNodeConfigChange={handleNodeConfigChange}
          />
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-500/30 bg-[#121214] px-4 py-3 text-sm text-white shadow-glow">
          {toast}
        </div>
      )}
    </div>
  );
}
