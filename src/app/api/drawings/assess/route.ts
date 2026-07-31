/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { parseDrawingPdf } from "@/server/drawings/pdf-parser";
import { parseGDTCallouts } from "@/server/drawings/gdt-parser";
import { computeFusedDrawingRisk } from "@/server/drawings/rules/risk-fusion-engine";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const organizationId = (formData.get("organizationId") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "File parameter missing" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await parseDrawingPdf(buffer, file.name);
      const callouts = parseGDTCallouts(pdfData.dimensions.concat(pdfData.notes));

      const fusedResult = await computeFusedDrawingRisk(pdfData.metadata, callouts, organizationId);
      return NextResponse.json({ success: true, data: fusedResult });
    } else {
      const body = await req.json();
      const rawText: string = body.text || "";
      const filename: string = body.filename || "AFT_BRACKET_1032_REV_B.pdf";
      const organizationId: string | undefined = body.organizationId;

      // Sample mock drawing text if empty body text is passed for testing
      const sampleText =
        rawText ||
        `
        TITLE: AFT ACTUATOR BRACKET
        DWG NO: AFT_BRACKET_1032
        REV: B
        MATERIAL: Titanium Ti-6Al-4V
        FINISH: Hard Anodize Type III
        UNLESS OTHERWISE SPECIFIED DIMENSIONS ARE IN MM
        DRAWING STANDARD: ASME Y14.5-2018
        [A] [B] [C] DATUMS
        
        DIMENSIONS & CALLOUTS:
        1. Flatness < 0.03 mm on Datum Surface A
        2. Position Ø0.08 MMC relative to A|B|C
        3. Bore Ø12 H7 (+0.018/-0.000)
        4. Surface finish Ra 0.8 µm on sealing surface
        5. Deep Pocket depth 35mm cutter 6mm (aspect ratio >5x)
        6. Thin Wall 1.5mm between pocket and outer mounting lug
        7. Threads M6x1.0 STI Helicoil Inserts
      `;

      const lines = sampleText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const pdfData = await parseDrawingPdf(Buffer.from(sampleText), filename);
      const callouts = parseGDTCallouts(lines);

      const fusedResult = await computeFusedDrawingRisk(pdfData.metadata, callouts, organizationId);
      return NextResponse.json({ success: true, data: fusedResult });
    }
  } catch (err: any) {
    console.error("Error in drawing assessment API:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process drawing assessment" },
      { status: 500 },
    );
  }
}
