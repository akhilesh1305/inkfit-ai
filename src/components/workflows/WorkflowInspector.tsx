"use client";

import type {
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeConfig,
} from "@/lib/workflows";
import { WORKFLOW_NODE_META } from "@/lib/workflows";

interface WorkflowInspectorProps {
  graph: WorkflowGraph;
  selectedNode: WorkflowNode | null;
  onGraphChange: (graph: WorkflowGraph) => void;
  onNodeConfigChange: (nodeId: string, config: WorkflowNodeConfig) => void;
}

export function WorkflowInspector({
  graph,
  selectedNode,
  onGraphChange,
  onNodeConfigChange,
}: WorkflowInspectorProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Properties</h3>
        <p className="mt-0.5 text-[11px] text-content-muted">
          {selectedNode ? WORKFLOW_NODE_META[selectedNode.type].label : "Workflow settings"}
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label className="label">Workflow topic</label>
          <input
            className="input-field mt-1.5"
            value={graph.input.topic}
            onChange={(e) =>
              onGraphChange({
                ...graph,
                input: { ...graph.input, topic: e.target.value },
              })
            }
            placeholder="e.g. AI content marketing trends"
          />
        </div>
        <div>
          <label className="label">Target audience</label>
          <input
            className="input-field mt-1.5"
            value={graph.input.audience ?? ""}
            onChange={(e) =>
              onGraphChange({
                ...graph,
                input: { ...graph.input, audience: e.target.value },
              })
            }
            placeholder="e.g. founders and marketers"
          />
        </div>

        {selectedNode && (
          <NodeConfigForm
            node={selectedNode}
            onChange={(config) => onNodeConfigChange(selectedNode.id, config)}
          />
        )}

        {!selectedNode && (
          <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-content-muted">
            Select a node on the canvas to edit its settings, or drag new nodes from the palette.
          </p>
        )}
      </div>
    </div>
  );
}

function NodeConfigForm({
  node,
  onChange,
}: {
  node: WorkflowNode;
  onChange: (config: WorkflowNodeConfig) => void;
}) {
  const config = node.config;

  function set(key: keyof WorkflowNodeConfig, value: string | number) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="space-y-3 border-t border-white/[0.06] pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
        Node settings
      </p>

      <div>
        <label className="label">Override topic</label>
        <input
          className="input-field mt-1.5"
          value={config.topic ?? ""}
          onChange={(e) => set("topic", e.target.value)}
          placeholder="Uses workflow topic if empty"
        />
      </div>

      {node.type === "blog_generator" && (
        <>
          <div>
            <label className="label">Tone</label>
            <select
              className="input-field mt-1.5"
              value={config.tone ?? "professional"}
              onChange={(e) => set("tone", e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="bold">Bold</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
          <div>
            <label className="label">Length</label>
            <select
              className="input-field mt-1.5"
              value={config.length ?? "medium"}
              onChange={(e) => set("length", e.target.value)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </>
      )}

      {node.type === "seo_writer" && (
        <div>
          <label className="label">Target keyword</label>
          <input
            className="input-field mt-1.5"
            value={config.targetKeyword ?? ""}
            onChange={(e) => set("targetKeyword", e.target.value)}
            placeholder="e.g. ai content marketing"
          />
        </div>
      )}

      {node.type === "linkedin_generator" && (
        <div>
          <label className="label">Content type</label>
          <select
            className="input-field mt-1.5"
            value={config.contentType ?? "thought-leadership"}
            onChange={(e) => set("contentType", e.target.value)}
          >
            <option value="thought-leadership">Thought Leadership</option>
            <option value="educational">Educational</option>
            <option value="story">Story</option>
            <option value="personal-brand">Personal Brand</option>
            <option value="industry-insight">Industry Insight</option>
          </select>
        </div>
      )}

      {node.type === "carousel_generator" && (
        <div>
          <label className="label">Slides</label>
          <input
            type="number"
            min={3}
            max={12}
            className="input-field mt-1.5"
            value={config.slides ?? 7}
            onChange={(e) => set("slides", Number(e.target.value))}
          />
        </div>
      )}

      {node.type === "image_studio" && (
        <>
          <div>
            <label className="label">Style</label>
            <select
              className="input-field mt-1.5"
              value={config.imageStyle ?? "modern-saas"}
              onChange={(e) => set("imageStyle", e.target.value)}
            >
              <option value="modern-saas">Modern SaaS</option>
              <option value="corporate">Corporate</option>
              <option value="minimal">Minimal</option>
              <option value="illustration">Illustration</option>
            </select>
          </div>
          <div>
            <label className="label">Aspect ratio</label>
            <select
              className="input-field mt-1.5"
              value={config.aspectRatio ?? "1:1"}
              onChange={(e) => set("aspectRatio", e.target.value)}
            >
              <option value="1:1">1:1 Square</option>
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Portrait</option>
            </select>
          </div>
        </>
      )}

      {node.type === "calendar" && (
        <>
          <div>
            <label className="label">Action</label>
            <select
              className="input-field mt-1.5"
              value={config.calendarAction ?? "schedule_post"}
              onChange={(e) => set("calendarAction", e.target.value)}
            >
              <option value="add_to_calendar">Add to calendar</option>
              <option value="schedule_post">Schedule post</option>
            </select>
          </div>
          <div>
            <label className="label">Platform</label>
            <select
              className="input-field mt-1.5"
              value={config.platform ?? "linkedin"}
              onChange={(e) => set("platform", e.target.value)}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          <div>
            <label className="label">Days from now</label>
            <input
              type="number"
              min={0}
              max={90}
              className="input-field mt-1.5"
              value={config.daysFromNow ?? 3}
              onChange={(e) => set("daysFromNow", Number(e.target.value))}
            />
          </div>
        </>
      )}
    </div>
  );
}
