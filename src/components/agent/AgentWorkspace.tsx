"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  MessageSquare,
  Bookmark,
  Zap,
  Send,
  Loader2,
  Bot,
  Trash2,
  Star,
  Cloud,
  CloudOff,
} from "lucide-react";
import { AgentMessageBubble } from "@/components/agent/AgentMessageBubble";
import {
  QUICK_ACTIONS,
  conversationTitle,
  type AgentConversation,
  type AgentMessage,
} from "@/lib/content-agent";
import { cn } from "@/lib/utils";

function newMessage(role: "user" | "assistant", content: string): AgentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function AgentWorkspace() {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"history" | "saved" | "actions">("actions");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId);

  const loadFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/agent");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setSavedPrompts(data.savedPrompts ?? []);
      setSyncError(false);
    } catch {
      setSyncError(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, loading]);

  function startNewChat() {
    setActiveId(null);
    setInput("");
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);

    const userMsg = newMessage("user", trimmed);
    const optimisticAssistant = newMessage("assistant", "…");
    let convId = activeId;
    let optimisticConv: AgentConversation;

    if (!convId) {
      optimisticConv = {
        id: `temp-${Date.now()}`,
        title: conversationTitle(trimmed),
        messages: [userMsg, optimisticAssistant],
        updatedAt: new Date().toISOString(),
      };
      convId = optimisticConv.id;
      setActiveId(convId);
      setConversations((prev) => [optimisticConv, ...prev]);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, userMsg, optimisticAssistant],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    }

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          conversationId: activeId && !activeId.startsWith("temp-") ? activeId : undefined,
        }),
      });
      const data = await res.json();

      if (data.conversation) {
        setConversations((prev) => {
          const withoutTemp = prev.filter((c) => c.id !== convId);
          const existing = withoutTemp.find((c) => c.id === data.conversation.id);
          if (existing) {
            return [data.conversation, ...withoutTemp.filter((c) => c.id !== data.conversation.id)];
          }
          return [data.conversation, ...withoutTemp];
        });
        setActiveId(data.conversation.id);
      }
      setSyncError(false);
    } catch {
      setSyncError(true);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.filter((m) => m.id !== optimisticAssistant.id),
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);

    if (!id.startsWith("temp-")) {
      setSyncing(true);
      try {
        await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", conversationId: id }),
        });
      } catch {
        setSyncError(true);
        await loadFromServer();
      } finally {
        setSyncing(false);
      }
    }
  }

  async function savePrompt(prompt: string) {
    if (savedPrompts.includes(prompt)) return;
    setSavedPrompts((prev) => [prompt, ...prev].slice(0, 20));
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-prompt", prompt }),
      });
      const data = await res.json();
      if (data.savedPrompts) setSavedPrompts(data.savedPrompts);
    } catch {
      setSyncError(true);
    }
  }

  async function removeSavedPrompt(prompt: string) {
    setSavedPrompts((prev) => prev.filter((p) => p !== prompt));
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-prompt", prompt }),
      });
      const data = await res.json();
      if (data.savedPrompts) setSavedPrompts(data.savedPrompts);
    } catch {
      setSyncError(true);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-ink-surface/40 shadow-card">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-surface/60 md:flex">
        <div className="p-3">
          <button type="button" onClick={startNewChat} className="btn-primary w-full !py-2.5 text-sm">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 pb-2 text-[10px] text-content-subtle">
          {syncing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing…
            </>
          ) : syncError ? (
            <>
              <CloudOff className="h-3 w-3 text-amber-400" />
              Offline — changes may not persist
            </>
          ) : (
            <>
              <Cloud className="h-3 w-3 text-emerald-400" />
              Saved to cloud
            </>
          )}
        </div>

        <div className="flex border-b border-white/10 px-2">
          {(
            [
              { id: "actions" as const, label: "Actions", icon: Zap },
              { id: "history" as const, label: "History", icon: MessageSquare },
              { id: "saved" as const, label: "Saved", icon: Bookmark },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSidebarTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 border-b-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition",
                sidebarTab === tab.id
                  ? "border-brand-500 text-brand-300"
                  : "border-transparent text-content-subtle hover:text-content-muted"
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sidebarTab === "actions" && (
            <div className="space-y-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-xs text-content-muted transition hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-content disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {sidebarTab === "history" && (
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-content-subtle">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-xl transition",
                      activeId === conv.id ? "bg-brand-500/10" : "hover:bg-white/[0.04]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(conv.id)}
                      className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-xs text-content-muted"
                    >
                      {conv.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteConversation(conv.id)}
                      className="btn-ghost !rounded-lg !p-1.5 opacity-0 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-content-subtle" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {sidebarTab === "saved" && (
            <div className="space-y-1">
              {savedPrompts.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-content-subtle">
                  Star prompts from chat to save them
                </p>
              ) : (
                savedPrompts.map((prompt) => (
                  <div key={prompt} className="group flex items-start gap-1 rounded-xl hover:bg-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="min-w-0 flex-1 px-3 py-2 text-left text-xs text-content-muted"
                    >
                      {prompt}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedPrompt(prompt)}
                      className="btn-ghost !rounded-lg !p-1.5 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-blue">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-content">InkFit Content Agent</p>
            <p className="text-[10px] text-content-subtle">Your AI marketing employee</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!active?.messages.length ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
                <Bot className="h-8 w-8 text-brand-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-content">
                What should we create today?
              </h2>
              <p className="mt-1 max-w-md text-sm text-content-subtle">
                Ask for LinkedIn content, blog ideas, content strategies, SEO plans, or full calendars.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.slice(0, 4).map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-content-muted transition hover:border-brand-500/30 hover:text-brand-300 disabled:opacity-50"
                  >
                    {action.prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {active.messages
                .filter((m) => m.content !== "…")
                .map((msg) => (
                  <AgentMessageBubble key={msg.id} message={msg} />
                ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-blue/30">
                    <Bot className="h-4 w-4 text-brand-400" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                    <span className="text-sm text-content-subtle">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-ink-surface/80 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="mx-auto flex max-w-3xl gap-2"
          >
            <button
              type="button"
              onClick={() => input.trim() && savePrompt(input.trim())}
              disabled={!input.trim()}
              className="btn-ghost !rounded-xl !p-2.5"
              title="Save prompt"
            >
              <Star className="h-4 w-4" />
            </button>
            <input
              className="input-field flex-1 !rounded-2xl !py-3"
              placeholder="e.g. Create next week's LinkedIn content."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary !rounded-2xl !px-4"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
