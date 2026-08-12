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
      const filename: string = body.filename || "DRAWING_ASSESSMENT.pdf";
      const organizationId: string | undefined = body.organizationId;

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: "Missing technical drawing file or text content to assess" },
          { status: 400 },
        );
      }

      const lines = rawText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const pdfData = await parseDrawingPdf(Buffer.from(rawText), filename);
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
