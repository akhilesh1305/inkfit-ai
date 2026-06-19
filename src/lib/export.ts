export async function exportToPDF(title: string, content: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const lines = content.split("\n");

  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    if (line.startsWith("# ")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const wrapped = doc.splitTextToSize(line.replace(/^#+\s*/, ""), pageWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 7 + 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    } else if (line.startsWith("## ")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const wrapped = doc.splitTextToSize(line.replace(/^#+\s*/, ""), pageWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 6 + 3;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    } else if (line.trim()) {
      const wrapped = doc.splitTextToSize(line.replace(/\*\*/g, ""), pageWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
    } else {
      y += 4;
    }
  }

  doc.save(`${title.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.pdf`);
}

export function exportToWord(title: string, content: string) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${title}</title></head>
    <body>
      <h1>${title}</h1>
      <div>${content
        .split("\n")
        .map((line) => {
          if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
          if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
          if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
          if (line.trim()) return `<p>${line}</p>`;
          return "<br/>";
        })
        .join("")}</div>
    </body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
