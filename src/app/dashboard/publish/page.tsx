"use client";

import { useState, useEffect } from "react";
import { Loader2, Link2, Check, Send } from "lucide-react";
import { PLATFORMS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";

interface Connection {
  platform: string;
  connected: boolean;
  account: string | null;
}

export default function PublishPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/publish")
      .then((r) => r.json())
      .then((d) => setConnections(d.connections ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleConnection(platform: string) {
    const conn = connections.find((c) => c.platform === platform);
    const connected = !conn?.connected;
    const account = connected ? `@${platform}_account` : null;
    await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, connected, account }),
    });
    setConnections((prev) =>
      prev.map((c) => (c.platform === platform ? { ...c, connected, account } : c))
    );
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishing(true);
    setMessage("");
    const res = await fetch("/api/publish", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: selectedPlatform, title, content }),
    });
    const data = await res.json();
    setMessage(res.ok ? data.message : data.error);
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Multi-Platform Publishing"
        description="Connect your accounts and publish directly from your dashboard."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLATFORMS.map((p) => {
          const conn = connections.find((c) => c.platform === p.id);
          return (
            <div key={p.id} className="card">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                <h3 className="font-semibold text-content">{p.name}</h3>
              </div>
              <p className="mb-3 text-xs text-content-subtle">
                {conn?.connected ? `Connected: ${conn.account}` : "Not connected"}
              </p>
              <button
                type="button"
                onClick={() => toggleConnection(p.id)}
                className={conn?.connected ? "btn-secondary w-full text-xs" : "btn-primary w-full text-xs"}
              >
                {conn?.connected ? <><Check className="h-3 w-3" /> Connected</> : <><Link2 className="h-3 w-3" /> Connect</>}
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={handlePublish} className="card max-w-2xl space-y-4">
        <h2 className="text-heading">Publish Content</h2>
        <div>
          <label className="label">Platform</label>
          <select className="input-field" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="input-field min-h-[160px]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Your content..." required />
        </div>
        <button type="submit" className="btn-primary" disabled={publishing}>
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish Now
        </button>
        {message && (
          <p className={`text-sm ${message.includes("queued") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>
        )}
      </form>
    </div>
  );
}
