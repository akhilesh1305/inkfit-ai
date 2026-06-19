import type { CarouselData, CarouselSlide } from "@/lib/carousel-content";

const SIZE = 1080;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const paragraphs = text.split("\n");
  let cy = y;
  for (const para of paragraphs) {
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        line = word;
        cy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lineHeight;
    }
    cy += lineHeight * 0.3;
  }
  return cy;
}

export function renderSlideToCanvas(
  slide: CarouselSlide,
  topic: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, "#0A0A0A");
  grad.addColorStop(0.5, "#111827");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const accentGrad = ctx.createLinearGradient(0, 0, SIZE, 0);
  accentGrad.addColorStop(0, "#7C3AED");
  accentGrad.addColorStop(0.5, "#3B82F6");
  accentGrad.addColorStop(1, "#06B6D4");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, SIZE, 8);

  ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
  ctx.beginPath();
  ctx.arc(SIZE - 120, 120, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  ctx.beginPath();
  ctx.arc(80, SIZE - 80, 200, 0, Math.PI * 2);
  ctx.fill();

  const roleColors: Record<string, string> = {
    hook: "#7C3AED",
    content: "#3B82F6",
    cta: "#06B6D4",
  };
  const roleLabels: Record<string, string> = {
    hook: "HOOK",
    content: `SLIDE ${slide.number}`,
    cta: "CTA",
  };

  ctx.fillStyle = roleColors[slide.role] ?? "#7C3AED";
  ctx.fillRect(80, 80, 160, 44);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText(roleLabels[slide.role], 100, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px system-ui, sans-serif";
  wrapText(ctx, slide.title, 80, 200, SIZE - 160, 62);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "32px system-ui, sans-serif";
  wrapText(ctx, slide.body, 80, 420, SIZE - 160, 44);

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText(topic.slice(0, 50), 80, SIZE - 80);

  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText("InkFit AI", SIZE - 160, SIZE - 80);

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function downloadSlidePng(slide: CarouselSlide, topic: string) {
  const canvas = renderSlideToCanvas(slide, topic);
  const slug = topic.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  downloadCanvas(canvas, `${slug}-slide-${slide.number}.png`);
}

export function downloadAllSlidesPng(data: CarouselData) {
  data.slides.forEach((slide, i) => {
    setTimeout(() => {
      downloadSlidePng(slide, data.topic);
    }, i * 300);
  });
}

export async function downloadCarouselPdf(data: CarouselData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "px", format: [SIZE, SIZE] });

  data.slides.forEach((slide, i) => {
    if (i > 0) doc.addPage([SIZE, SIZE]);
    const canvas = renderSlideToCanvas(slide, data.topic);
    const img = canvas.toDataURL("image/png");
    doc.addImage(img, "PNG", 0, 0, SIZE, SIZE);
  });

  const slug = data.topic.slice(0, 40).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  doc.save(`${slug}-carousel.pdf`);
}
