export type VideoInputType = "blog" | "transcript" | "url" | "text";

export type VideoScriptId =
  | "youtube"
  | "podcast"
  | "shorts"
  | "reel"
  | "hook"
  | "cta";

export interface VideoStudioRequest {
  inputType: VideoInputType;
  content: string;
  url?: string;
  topic?: string;
}

export interface ScriptBlock {
  id: VideoScriptId;
  label: string;
  content: string;
  wordCount: number;
  estimatedSeconds: number;
}

export interface PlatformRecommendation {
  platform: string;
  fit: "excellent" | "good" | "fair";
  reason: string;
  suggestedFormat: string;
}

export interface VideoStudioOutput {
  topic: string;
  sourceWordCount: number;
  scripts: ScriptBlock[];
  hook: string;
  cta: string;
  platformRecommendations: PlatformRecommendation[];
  live?: boolean;
}

export const INPUT_TYPES: {
  id: VideoInputType;
  label: string;
  placeholder: string;
  hint: string;
}[] = [
  {
    id: "blog",
    label: "Blog Article",
    placeholder: "Paste your full blog post or article…",
    hint: "We'll extract key beats and turn them into video-ready scripts.",
  },
  {
    id: "transcript",
    label: "Transcript",
    placeholder: "Paste a podcast or video transcript…",
    hint: "Repurpose spoken content into new formats and platforms.",
  },
  {
    id: "url",
    label: "URL",
    placeholder: "https://yourblog.com/article",
    hint: "Import content from a public URL (article page).",
  },
  {
    id: "text",
    label: "Raw Text",
    placeholder: "Paste notes, outline, or any raw source material…",
    hint: "Flexible input — bullets, notes, or rough ideas work great.",
  },
];

export const SCRIPT_META: Record<
  VideoScriptId,
  { label: string; wpm: number; description: string }
> = {
  youtube: {
    label: "YouTube Script",
    wpm: 150,
    description: "8–12 min talking-head or explainer format",
  },
  podcast: {
    label: "Podcast Script",
    wpm: 140,
    description: "Conversational solo or interview-style segments",
  },
  shorts: {
    label: "Shorts Script",
    wpm: 160,
    description: "Vertical short — 30–60 seconds",
  },
  reel: {
    label: "Reel Script",
    wpm: 165,
    description: "Fast-paced Instagram/TikTok reel — 15–45 seconds",
  },
  hook: {
    label: "Video Hook",
    wpm: 170,
    description: "Opening 3–5 seconds to stop the scroll",
  },
  cta: {
    label: "Video CTA",
    wpm: 150,
    description: "Closing call-to-action for any platform",
  },
};

const WORDS_PER_MINUTE_DEFAULT = 150;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateDurationSeconds(wordCount: number, wpm = WORDS_PER_MINUTE_DEFAULT): number {
  return Math.max(5, Math.round((wordCount / wpm) * 60));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function extractTopic(content: string, fallback = "your topic"): string {
  const firstLine = content.split("\n").find((l) => l.trim().length > 10)?.trim() ?? "";
  const cleaned = firstLine.replace(/^#+\s*/, "").slice(0, 80);
  return cleaned || fallback;
}

function summarizeSource(content: string, maxWords = 120): string {
  const words = content.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return content.trim();
  return words.slice(0, maxWords).join(" ") + "…";
}

function buildPlatformRecommendations(
  sourceWords: number,
  inputType: VideoInputType
): PlatformRecommendation[] {
  const recs: PlatformRecommendation[] = [];

  if (sourceWords >= 800) {
    recs.push({
      platform: "YouTube",
      fit: "excellent",
      reason: "Long-form source maps well to 8–15 min deep-dive videos.",
      suggestedFormat: "Talking-head + B-roll explainer",
    });
    recs.push({
      platform: "Podcast",
      fit: "excellent",
      reason: "Enough depth for a 20–40 min episodic breakdown.",
      suggestedFormat: "Solo episode or interview segment",
    });
  } else if (sourceWords >= 300) {
    recs.push({
      platform: "YouTube",
      fit: "good",
      reason: "Solid mid-length video potential with tight editing.",
      suggestedFormat: "5–8 min tutorial or opinion piece",
    });
  }

  recs.push({
    platform: "YouTube Shorts",
    fit: sourceWords >= 200 ? "excellent" : "good",
    reason: "Clip the strongest insight into a vertical hook-led short.",
    suggestedFormat: "30–60s vertical, captions on",
  });

  recs.push({
    platform: "Instagram Reels",
    fit: "excellent",
    reason: "High-energy reel from one punchy takeaway.",
    suggestedFormat: "15–30s trend-friendly cut",
  });

  if (inputType === "transcript") {
    recs.push({
      platform: "Podcast (clip)",
      fit: "good",
      reason: "Transcript source — audiograms and clip posts perform well.",
      suggestedFormat: "60s audiogram + quote card",
    });
  }

  recs.push({
    platform: "TikTok",
    fit: sourceWords >= 150 ? "good" : "fair",
    reason: "Repurpose hook + one insight for discovery.",
    suggestedFormat: "Face-to-camera or text-on-screen",
  });

  return recs.slice(0, 5);
}

function makeScript(id: VideoScriptId, content: string): ScriptBlock {
  const wc = countWords(content);
  const wpm = SCRIPT_META[id].wpm;
  return {
    id,
    label: SCRIPT_META[id].label,
    content,
    wordCount: wc,
    estimatedSeconds: estimateDurationSeconds(wc, wpm),
  };
}

export function generateVideoStudio(req: VideoStudioRequest): VideoStudioOutput {
  const source = req.content.trim();
  const topic = req.topic?.trim() || extractTopic(source);
  const summary = summarizeSource(source);
  const sourceWordCount = countWords(source);

  const hook = `[HOOK — 0:00]
Stop scrolling if you care about ${topic}.

Here's the one thing nobody tells you — and it changed how I think about this entire space.

[Pattern interrupt]
What if everything you've been told about ${topic} is backwards?`;

  const cta = `[CTA — closing]
If this helped, hit subscribe and save this for later.

Comment "${topic.split(" ")[0]?.toUpperCase() ?? "YES"}" below and I'll send you the full breakdown.

Follow for more — I post every week on ${topic}.`;

  const youtube = `[YOUTUBE SCRIPT — ${topic}]
[INTRO — 0:00]
${hook.split("\n").slice(1, 4).join("\n")}

[CONTEXT — 0:30]
Today we're breaking down ${topic} — pulled from real experience, not theory.

Source insight:
${summary}

[MAIN — 1:00]
Point 1: The problem most people miss
→ Explain the gap in the market or common mistake.

Point 2: The framework that works
→ Walk through 3 actionable steps from the source material.

Point 3: Proof or example
→ Share a mini case study or personal result.

[RECAP — 8:00]
Quick recap: problem → framework → proof.

${cta}`;

  const podcast = `[PODCAST SCRIPT — ${topic}]
[SEGMENT OPEN]
Welcome back. Today: ${topic}.

I'm going to walk you through what I learned — and what I'd do differently.

[BEAT 1 — The setup]
Here's the context behind this conversation…
${summary}

[BEAT 2 — The insight]
The turning point was realizing most advice about ${topic} optimizes for the wrong metric.

[BEAT 3 — Actionable takeaways]
1. Start with audience pain, not your product.
2. Ship one piece of content before perfecting the stack.
3. Measure engagement quality, not vanity views.

[SEGMENT CLOSE]
${cta.replace("[CTA — closing]", "[OUTRO]")}`;

  const shorts = `[SHORTS SCRIPT — 30–60s]
[ON CAMERA — fast pace]

"${topic} — in 60 seconds."

Here's what matters:
① One bold claim from your content
② One proof point
③ One action step

[Text on screen: "Save this ↓"]

${cta.split("\n")[1]}`;

  const reel = `[REEL SCRIPT — 15–45s]
[0:00] Hook: "POV: you finally understand ${topic}"
[0:03] Quick cut — 3 rapid bullets from source
[0:15] "Comment if you want part 2"
[0:20] Trending audio under voiceover

Voiceover:
${summary.split(" ").slice(0, 40).join(" ")}`;

  const scripts: ScriptBlock[] = [
    makeScript("youtube", youtube),
    makeScript("podcast", podcast),
    makeScript("shorts", shorts),
    makeScript("reel", reel),
    makeScript("hook", hook),
    makeScript("cta", cta),
  ];

  return {
    topic,
    sourceWordCount,
    scripts,
    hook,
    cta,
    platformRecommendations: buildPlatformRecommendations(sourceWordCount, req.inputType),
  };
}

export function parseVideoStudioOutput(json: string): VideoStudioOutput | null {
  try {
    return JSON.parse(json) as VideoStudioOutput;
  } catch {
    return null;
  }
}
