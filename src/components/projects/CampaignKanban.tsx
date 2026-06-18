"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KANBAN_COLUMNS,
  CONTENT_TYPE_META,
  type CampaignItem,
  type KanbanColumn,
  type CampaignContentType,
  formatDueDate,
  isOverdue,
} from "@/lib/campaigns";

interface CampaignKanbanProps {
  items: CampaignItem[];
  onMoveItem: (id: string, column: KanbanColumn) => void;
  onAddItem: (column: KanbanColumn, title: string, type: CampaignContentType) => void;
  onDeleteItem: (id: string) => void;
}

export function CampaignKanban({
  items,
  onMoveItem,
  onAddItem,
  onDeleteItem,
}: CampaignKanbanProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<KanbanColumn | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CampaignContentType>("blog");

  function handleDrop(column: KanbanColumn) {
    if (dragId) {
      onMoveItem(dragId, column);
      setDragId(null);
    }
  }

  function submitAdd(column: KanbanColumn) {
    if (!newTitle.trim()) return;
    onAddItem(column, newTitle.trim(), newType);
    setNewTitle("");
    setAddingTo(null);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((col) => {
        const columnItems = items.filter((i) => i.column === col.id);
        return (
          <div
            key={col.id}
            className="flex w-[280px] shrink-0 flex-col rounded-lg border border-white/[0.06] bg-[#0c0c0e]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="border-b border-white/[0.06] px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-content">{col.label}</span>
                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-content-subtle">
                  {columnItems.length}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-content-subtle">{col.hint}</p>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-2 min-h-[320px]">
              {columnItems.map((item) => {
                const meta = CONTENT_TYPE_META[item.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragId(item.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      "group cursor-grab rounded-md border border-white/[0.06] bg-[#141416] p-3 transition active:cursor-grabbing",
                      dragId === item.id && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-subtle opacity-0 group-hover:opacity-100" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 shrink-0" style={{ color: meta.color }} />
                          <span className="text-[10px] font-medium uppercase tracking-wide text-content-subtle">
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium leading-snug text-content">
                          {item.title}
                        </p>
                        {item.dueDate && (
                          <p
                            className={cn(
                              "mt-1.5 text-[10px]",
                              isOverdue(item.dueDate) ? "text-red-400" : "text-content-subtle"
                            )}
                          >
                            Due {formatDueDate(item.dueDate)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="rounded p-1 text-content-subtle opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {addingTo === col.id ? (
                <div className="rounded-md border border-brand-500/30 bg-brand-500/5 p-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitAdd(col.id);
                      if (e.key === "Escape") setAddingTo(null);
                    }}
                    placeholder="Content title"
                    className="input-field w-full py-1.5 text-sm"
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CampaignContentType)}
                    className="input-field mt-2 w-full py-1.5 text-xs"
                  >
                    {(Object.keys(CONTENT_TYPE_META) as CampaignContentType[]).map((t) => (
                      <option key={t} value={t}>
                        {CONTENT_TYPE_META[t].label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => submitAdd(col.id)}
                      className="btn-primary flex-1 !py-1 text-xs"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingTo(null)}
                      className="btn-secondary !py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingTo(col.id);
                    setNewType("blog");
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-content-subtle transition hover:bg-white/[0.04] hover:text-content"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add content
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
