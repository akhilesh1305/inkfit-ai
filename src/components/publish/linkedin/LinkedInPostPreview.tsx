"use client";

import Image from "next/image";
import type { LinkedInConnection } from "@/lib/linkedin-publishing";
import { formatLinkedInHandle } from "@/lib/linkedin-publishing";

interface LinkedInPostPreviewProps {
  connection: LinkedInConnection;
  content: string;
  title?: string;
}

export function LinkedInPostPreview({ connection, content, title }: LinkedInPostPreviewProps) {
  const displayContent = content.trim() || "Your post preview will appear here…";
  const name = connection.profileName ?? "Your Name";
  const handle = formatLinkedInHandle(connection.account) || "@your-handle";
  const avatar = connection.profileImage;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
        Live preview
      </p>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2] text-sm font-bold text-white">
              in
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-content-subtle">{handle} · 1st</p>
            {title && (
              <p className="mt-2 text-sm font-medium text-white">{title}</p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
              {displayContent}
            </p>
            <div className="mt-4 flex gap-4 border-t border-white/[0.06] pt-3 text-[11px] text-content-subtle">
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>↗ Repost</span>
              <span>✉ Send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
