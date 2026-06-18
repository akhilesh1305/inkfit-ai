"use client";

import { useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import type { EmployeeMessage } from "@/lib/marketing-employee";
import { cn } from "@/lib/utils";

function renderMarkdownLite(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface EmployeeChatProps {
  messages: EmployeeMessage[];
  loading?: boolean;
}

export function EmployeeChat({ messages, loading }: EmployeeChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-700 shadow-glow">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Your AI Marketing Manager</h2>
        <p className="mt-2 max-w-sm text-sm text-content-muted">
          Tell me your goal — I&apos;ll build strategy, content, posts, images, and your calendar.
          You approve each step along the way.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex gap-3",
            msg.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              msg.role === "user"
                ? "bg-white/10"
                : "bg-gradient-to-br from-brand-600 to-violet-700"
            )}
          >
            {msg.role === "user" ? (
              <User className="h-4 w-4 text-content-muted" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-brand-600/20 text-white"
                : "bg-white/[0.04] text-content-muted border border-white/[0.06]"
            )}
          >
            {renderMarkdownLite(msg.content)}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-700">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
