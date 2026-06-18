"use client";

import { Bot } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AgentWorkspace } from "@/components/agent/AgentWorkspace";

export default function AgentPage() {
  return (
    <div className="-mx-4 lg:-mx-8">
      <div className="px-4 lg:px-8">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <Bot className="h-7 w-7 text-brand-400" />
              AI Content Agent
            </span>
          }
          description="Your AI marketing employee — content ideas, posts, calendars, and strategies on demand."
        />
      </div>
      <div className="px-4 lg:px-8">
        <AgentWorkspace />
      </div>
    </div>
  );
}
