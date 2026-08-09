import { logger } from "@/shared/logging";
import { txtParser } from "./txt-parser";
import { markdownParser } from "./markdown-parser";
import { csvParser } from "./csv-parser";
import { docxParser } from "./docx-parser";
import { pdfParser } from "./pdf-parser";
import { imageParser } from "./image-parser";
import { genericTextFallbackParser } from "./generic-text-fallback-parser";
import type { FileDescriptor, ParseContext, ParsedDocument, Parser } from "./parser.types";

export interface ParserHealth {
  parserName: string;
  parserVersion: string;
  totalRuns: number;
  totalFailures: number;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
}

class ParserRegistry {
  private readonly parsers: Parser[] = [];
  private readonly health = new Map<string, ParserHealth>();

  register(parser: Parser): void {
    if (this.parsers.some((p) => p.name === parser.name)) {
      throw new Error(`Parser "${parser.name}" is already registered`);
    }
    this.parsers.push(parser);
    this.health.set(parser.name, {
      parserName: parser.name,
      parserVersion: parser.version,
      totalRuns: 0,
      totalFailures: 0,
      consecutiveFailures: 0,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastErrorMessage: null,
    });
  }

  resolve(file: FileDescriptor): Parser | null {
    return this.parsers.find((p) => p.canParse(file)) ?? null;
  }

  listHealth(): ParserHealth[] {
    return Array.from(this.health.values());
  }

  private recordSuccess(parserName: string): void {
    const entry = this.health.get(parserName);
    if (!entry) return;
    entry.totalRuns += 1;
    entry.consecutiveFailures = 0;
    entry.lastSuccessAt = new Date().toISOString();
  }

  private recordFailure(parserName: string, message: string): void {
    const entry = this.health.get(parserName);
    if (!entry) return;
    entry.totalRuns += 1;
    entry.totalFailures += 1;
    entry.consecutiveFailures += 1;
    entry.lastErrorAt = new Date().toISOString();
    entry.lastErrorMessage = message;
  }

  /**
   * Resolves a parser for the given file and parses it. If the resolved
   * parser throws and the file is a text-representable format, falls back to
   * the generic text parser so the pipeline still produces usable output.
   * Binary formats (docx/pdf/images) never fall back - a parse failure there
   * fails the job with a clear error instead of silently returning garbage.
   */
  async parseWithFallback(
    buffer: Buffer,
    file: FileDescriptor,
    context: ParseContext,
  ): Promise<{ document: ParsedDocument; parserName: string; parserVersion: string }> {
    const parser = this.resolve(file);
    if (!parser) {
      throw new Error(`No parser registered for file extension "${file.extension}"`);
    }

    try {
      const document = await parser.parse(buffer, context);
      this.recordSuccess(parser.name);
      return { document, parserName: parser.name, parserVersion: parser.version };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown parser error";
      this.recordFailure(parser.name, message);
      logger.warn("Parser failed, falling back to generic parser:", {
        parser: parser.name,
        file: file.extension,
        error: message,
      });

      const document = await genericTextFallbackParser.parse(buffer, context);
      this.recordSuccess(genericTextFallbackParser.name);
      return {
        document,
        parserName: genericTextFallbackParser.name,
        parserVersion: genericTextFallbackParser.version,
      };
    }
  }
}

const globalForRegistry = globalThis as unknown as {
  ingestionParserRegistry: ParserRegistry | undefined;
};

export const parserRegistry = globalForRegistry.ingestionParserRegistry ?? new ParserRegistry();

if (!globalForRegistry.ingestionParserRegistry) {
  parserRegistry.register(txtParser);
  parserRegistry.register(markdownParser);
  parserRegistry.register(csvParser);
  parserRegistry.register(docxParser);
  parserRegistry.register(pdfParser);
  parserRegistry.register(imageParser);
  parserRegistry.register(genericTextFallbackParser);
}
