import { NextResponse } from "next/server";
import { validateSession } from "@/server/auth/session-service";
import { generatePdfBuffer, PdfReportInput } from "@/server/reporting/pdf-generator";

export async function POST(request: Request) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, content } = body;

    const sections: PdfReportInput["sections"] = Array.isArray(content?.sections)
      ? content.sections.map((section: { title?: string; content?: string }) => ({
          title: section?.title ?? "Section",
          content: section?.content ?? "",
        }))
      : [
          {
            title: "Report",
            content: typeof content === "string" ? content : "",
          },
        ];

    const pdf = generatePdfBuffer({
      title: title || "AKSCI Engineering Intelligence Report",
      subtitle: "Consecuencia Engineering Intelligence System",
      generatedAt: new Date().toISOString(),
      sections,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${Date.now()}.pdf"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
