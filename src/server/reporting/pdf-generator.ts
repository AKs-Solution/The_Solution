/**
 * Minimal dependency-free PDF writer used by the export endpoints.
 *
 * Emits a spec-compliant PDF 1.4 document (media box 612x792) with a title,
 * optional subtitle, generation timestamp, and wrapped body sections. Text is
 * rendered with the core Helvetica / Helvetica-Bold fonts, so no font files or
 * external libraries are required. The produced buffer is a real PDF stream
 * (readable by pdf-parse and standard viewers).
 */

export interface PdfReportInput {
  title: string;
  subtitle?: string;
  generatedAt: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

interface TextOp {
  font: string; // "F1" | "F2"
  size: number;
  x: number;
  y: number;
  text: string;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function maxCharsFor(size: number): number {
  return Math.floor(CONTENT_WIDTH / (size * 0.55));
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line.length === 0 ? word : `${line} ${word}`;
      if (candidate.length > maxChars) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function layoutPages(input: PdfReportInput): TextOp[][] {
  const pages: TextOp[][] = [[]];
  let page = 0;
  let y = PAGE_HEIGHT - 72;

  function emit(font: string, size: number, text: string) {
    const lineHeight = size + 6;
    if (y - lineHeight < 50) {
      page += 1;
      pages.push([]);
      y = PAGE_HEIGHT - 72;
    }
    pages[page].push({ font, size, x: MARGIN, y, text });
    y -= lineHeight;
  }

  emit("F2", 18, input.title || "Engineering Intelligence Report");
  if (input.subtitle) emit("F1", 12, input.subtitle);
  emit("F1", 9, `Generated: ${input.generatedAt || new Date().toISOString()}`);
  y -= 16;

  for (const section of input.sections ?? []) {
    emit("F2", 13, section.title || "Section");
    for (const line of wrapText(section.content || "", maxCharsFor(11))) {
      emit("F1", 11, line);
    }
    y -= 10;
  }

  return pages;
}

function buildContentStream(ops: TextOp[]): string {
  const commands: string[] = ["BT"];
  for (const op of ops) {
    commands.push(`/${op.font} ${op.size} Tf`);
    commands.push(`1 0 0 1 ${op.x} ${op.y} Tm`);
    commands.push(`(${escapePdfText(op.text)}) Tj`);
  }
  commands.push("ET");
  return commands.join("\n");
}

export function generatePdfBuffer(input: PdfReportInput): Buffer {
  const pages = layoutPages(input);
  const fontObj1 = 3 + pages.length * 2;
  const fontObj2 = fontObj1 + 1;
  const objCount = fontObj2;

  const objects: string[] = new Array(objCount + 1).fill("");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const kids = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;

  for (let i = 0; i < pages.length; i++) {
    const pageObj = 3 + i * 2;
    const contentObj = pageObj + 1;
    const stream = buildContentStream(pages[i]);
    objects[pageObj] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontObj1} 0 R /F2 ${fontObj2} 0 R >> >> ` +
      `/Contents ${contentObj} 0 R >>`;
    objects[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  objects[fontObj1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontObj2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = new Array(objCount + 1).fill(0);
  for (let n = 1; n <= objCount; n++) {
    offsets[n] = Buffer.byteLength(pdf, "latin1");
    pdf += `${n} 0 obj\n${objects[n]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let n = 1; n <= objCount; n++) {
    pdf += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objCount + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
