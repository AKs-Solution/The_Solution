import { config } from "@/shared/config";
import type { ValidationIssueDraft } from "../types";

export interface FileValidationInput {
  buffer: Buffer;
  extension: string;
  sizeBytes: number;
}

const SUPPORTED_EXTENSIONS = new Set([
  "txt",
  "text",
  "md",
  "markdown",
  "csv",
  "docx",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "step",
  "stp",
  "dxf",
  "dwg",
  "iges",
  "igs",
  "xlsx",
  "xls",
  "json",
]);

export function validateFile(input: FileValidationInput): ValidationIssueDraft[] {
  const issues: ValidationIssueDraft[] = [];
  const ext = input.extension.toLowerCase().trim();

  if (input.sizeBytes === 0) {
    issues.push({
      severity: "ERROR",
      code: "MALFORMED_DOCUMENT",
      message: "File is empty",
      stage: "FILE_VALIDATION",
    });
  }

  if (input.sizeBytes > config.ingestionMaxFileSizeBytes) {
    issues.push({
      severity: "ERROR",
      code: "MALFORMED_DOCUMENT",
      message: `File size ${input.sizeBytes} bytes exceeds the maximum of ${config.ingestionMaxFileSizeBytes} bytes`,
      stage: "FILE_VALIDATION",
      context: { sizeBytes: input.sizeBytes, maxBytes: config.ingestionMaxFileSizeBytes },
    });
  }

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    issues.push({
      severity: "ERROR",
      code: "UNSUPPORTED_FORMAT",
      message: `Unsupported file format "${input.extension}"`,
      stage: "FILE_VALIDATION",
    });
  }

  // Magic number & signature mismatch checks
  if (input.buffer.length >= 4) {
    const isPdfHeader = input.buffer.subarray(0, 5).toString("ascii").startsWith("%PDF-");
    if (isPdfHeader && ext === "txt") {
      issues.push({
        severity: "ERROR",
        code: "MALFORMED_DOCUMENT",
        message: "File contains PDF magic header but has .txt extension",
        stage: "FILE_VALIDATION",
      });
    }
  }

  return issues;
}
