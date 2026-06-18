export type ImageStyleId =
  | "corporate"
  | "minimal"
  | "3d"
  | "illustration"
  | "modern-saas"
  | "social-media";

export type AspectRatioId = "1:1" | "16:9" | "9:16" | "4:5";

export interface ImageStyle {
  id: ImageStyleId;
  label: string;
  description: string;
  gradient: string;
  promptSuffix: string;
}

export interface AspectRatioOption {
  id: AspectRatioId;
  label: string;
  size: "1024x1024" | "1792x1024" | "1024x1792";
  icon: string;
}

export interface GalleryImage {
  id: string;
  prompt: string;
  style: ImageStyleId;
  aspectRatio: AspectRatioId;
  url: string;
  favorite: boolean;
  createdAt: string;
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: "corporate",
    label: "Corporate",
    description: "Clean, professional, business-ready",
    gradient: "from-slate-600 to-slate-900",
    promptSuffix: "corporate professional photography, clean office aesthetic, premium business",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Whitespace, subtle tones, elegant",
    gradient: "from-zinc-400 to-zinc-700",
    promptSuffix: "minimal design, lots of negative space, soft neutral palette",
  },
  {
    id: "3d",
    label: "3D",
    description: "Dimensional renders, depth & lighting",
    gradient: "from-violet-600 to-indigo-900",
    promptSuffix: "3D render, octane, soft studio lighting, glossy materials",
  },
  {
    id: "illustration",
    label: "Illustration",
    description: "Hand-crafted vector feel",
    gradient: "from-pink-500 to-orange-500",
    promptSuffix: "flat vector illustration, vibrant colors, modern editorial style",
  },
  {
    id: "modern-saas",
    label: "Modern SaaS",
    description: "Product UI, gradients, tech",
    gradient: "from-brand-600 to-cyan-600",
    promptSuffix: "modern SaaS marketing visual, purple blue gradient, abstract tech shapes",
  },
  {
    id: "social-media",
    label: "Social Media",
    description: "Bold, scroll-stopping creatives",
    gradient: "from-fuchsia-600 to-purple-800",
    promptSuffix: "bold social media creative, eye-catching, trendy, high contrast",
  },
];

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "1:1", label: "Square", size: "1024x1024", icon: "□" },
  { id: "16:9", label: "Landscape", size: "1792x1024", icon: "▭" },
  { id: "9:16", label: "Portrait", size: "1024x1792", icon: "▯" },
  { id: "4:5", label: "Social", size: "1024x1792", icon: "▢" },
];

export const DEMO_GALLERY: Omit<GalleryImage, "id" | "createdAt">[] = [
  {
    prompt: "Futuristic AI workspace with holographic dashboards",
    style: "modern-saas",
    aspectRatio: "16:9",
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    favorite: true,
  },
  {
    prompt: "Minimal product hero on white background",
    style: "minimal",
    aspectRatio: "1:1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    favorite: false,
  },
  {
    prompt: "Corporate team collaboration in modern office",
    style: "corporate",
    aspectRatio: "16:9",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    favorite: true,
  },
  {
    prompt: "3D floating icons for content marketing",
    style: "3d",
    aspectRatio: "1:1",
    url: "https://images.unsplash.com/photo-1626785774573-4b799315346d?w=800&q=80",
    favorite: false,
  },
  {
    prompt: "Playful illustration of creator workflow",
    style: "illustration",
    aspectRatio: "4:5",
    url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    favorite: false,
  },
  {
    prompt: "Vibrant Instagram ad for SaaS launch",
    style: "social-media",
    aspectRatio: "4:5",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    favorite: true,
  },
];

export function getStyleById(id: ImageStyleId): ImageStyle {
  return IMAGE_STYLES.find((s) => s.id === id) ?? IMAGE_STYLES[0];
}

export function getAspectSize(ratio: AspectRatioId): AspectRatioOption["size"] {
  const opt = ASPECT_RATIOS.find((a) => a.id === ratio);
  return opt?.size ?? "1024x1024";
}

export function buildImagePrompt(prompt: string, styleId: ImageStyleId): string {
  const style = getStyleById(styleId);
  return `${prompt.trim()}. Style: ${style.promptSuffix}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadImage(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
