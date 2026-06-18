"use client";

import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { AgentMessage } from "@/lib/content-agent";
import { cn } from "@/lib/utils";

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 ml-4 list-disc space-y-1 text-sm text-content-muted">
          {listItems.map((item, i) => (
            <li key={i}>{item.replace(/^[-*]\s*/, "").replace(/\*\*/g, "")}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function flushTable() {
    if (tableRows.length > 0) {
      const [header, ...body] = tableRows;
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            {header && (
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  {header.map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-content">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.filter((r) => !r.every((c) => c.match(/^-+$/))).map((row, ri) => (
                <tr key={ri} className="border-b border-white/[0.06]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-content-muted">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      flushList();
      inTable = true;
      tableRows.push(line.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={i} className="mb-2 mt-4 text-sm font-bold text-content first:mt-0">
          {line.replace(/^##\s*/, "")}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={i} className="mb-1 mt-3 text-xs font-semibold text-brand-300">
          {line.replace(/^###\s*/, "")}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line);
    } else if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="my-2 border-l-2 border-brand-500/50 pl-3 text-sm italic text-content-muted"
        >
          {line.replace(/^>\s*/, "").replace(/\*\*/g, "")}
        </blockquote>
      );
    } else if (line.startsWith("---")) {
      flushList();
      elements.push(<hr key={i} className="my-4 border-white/10" />);
    } else if (line.trim()) {
      flushList();
      const text = line.replace(/\*\*(.*?)\*\*/g, "$1");
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-content-muted">
          {text}
        </p>
      );
    }
  }

  flushList();
  if (inTable) flushTable();

  return elements;
}

interface AgentMessageBubbleProps {
  message: AgentMessage;
}

export function AgentMessageBubble({ message }: AgentMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isUser ? "bg-brand-500/20" : "bg-gradient-to-br from-brand-600/30 to-accent-blue/30"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-brand-300" />
        ) : (
          <Bot className="h-4 w-4 text-brand-400" />
        )}
      </div>
      <div className={cn("min-w-0 max-w-[85%]", isUser && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-brand-600/20 text-content"
              : "border border-white/10 bg-white/[0.03]"
          )}
        >
          {isUser ? (
            <p className="text-sm text-left">{message.content}</p>
          ) : (
            <div className="text-left">{renderContent(message.content)}</div>
          )}
        </div>
        {!isUser && (
          <button
            type="button"
            onClick={copy}
            className="mt-1 flex items-center gap-1 text-[10px] text-content-subtle hover:text-content-muted"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
