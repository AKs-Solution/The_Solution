/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { logger } from "@/shared/logging";
import { storageAdapter } from "../storage";
import { PIPELINE_STAGES, type PipelineStageName } from "../constants";
import type { ValidationIssueDraft } from "./types";
import {
  assignProvenance,
  classifyDocument,
  detectSections,
  detectTables,
  extractEntities,
  extractMetadata,
  extractReferences,
  extractRelationships,
  persistExtraction,
  prepareGraphPreview,
  runStructuralParsing,
  validateExtraction,
  validateFile,
} from "./stages";

export class PipelineCancelledError extends Error {
  constructor() {
    super("Ingestion job was cancelled");
    this.name = "PipelineCancelledError";
  }
}

class StageFailureError extends Error {
  constructor(
    public readonly stageName: PipelineStageName,
    message: string,
  ) {
    super(message);
    this.name = "StageFailureError";
  }
}

const TOTAL_STAGES = PIPELINE_STAGES.length;

function progressFor(stageIndex: number): number {
  return Math.min(100, Math.round((stageIndex / TOTAL_STAGES) * 100));
}

/** Runs the full 13-stage ingestion pipeline for a single job. Never throws - all outcomes are reflected in the job's status. */
export async function runPipeline(jobId: string): Promise<void> {
  const job = await (prisma as any).ingestionJob?.findUnique({
    where: { id: jobId },
    include: { document: true, documentVersion: true },
  }).catch(() => null);
  if (!job) {
    logger.error("Ingestion job not found", { jobId });
    return;
  }

  await (prisma as any).ingestionJob?.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      errorMessage: null,
      errorStage: null,
      cancelRequested: false,
    },
  }).catch(() => null);

  let stageIndex = 0;
  const allIssues: ValidationIssueDraft[] = [];

  async function checkCancelled(): Promise<void> {
    const current = await (prisma as any).ingestionJob?.findUnique({
      where: { id: jobId },
      select: { cancelRequested: true },
    }).catch(() => null);
    if (current?.cancelRequested) {
      throw new PipelineCancelledError();
    }
  }

  async function logStage(
    name: PipelineStageName,
    status: "SUCCEEDED" | "FAILED" | "SKIPPED",
    startedAt: Date,
    errorMessage: string | null,
  ): Promise<void> {
    const completedAt = new Date();
    await (prisma as any).ingestionStageLog?.create({
      data: {
        jobId,
        stageName: name,
        stageIndex,
        status,
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        errorMessage,
      },
    }).catch(() => null);
  }

  async function runStage<T>(name: PipelineStageName, fn: () => Promise<T> | T): Promise<T> {
    await checkCancelled();
    await (prisma as any).ingestionJob?.update({
      where: { id: jobId },
      data: { currentStage: name, stageIndex, progressPercent: progressFor(stageIndex) },
    }).catch(() => null);

    const startedAt = new Date();
    try {
      const result = await fn();
      await logStage(name, "SUCCEEDED", startedAt, null);
      stageIndex++;
      return result;
    } catch (error) {
      if (error instanceof PipelineCancelledError) throw error;
      const message = error instanceof Error ? error.message : "Unknown error";
      await logStage(name, "FAILED", startedAt, message);
      throw new StageFailureError(name, message);
    }
  }

  async function skipStage(name: PipelineStageName): Promise<void> {
    await logStage(name, "SKIPPED", new Date(), null);
    stageIndex++;
  }

  async function finish(
    status: "SUCCEEDED" | "FAILED" | "CANCELLED",
    fields: {
      errorStage?: PipelineStageName | "UNKNOWN";
      errorMessage?: string;
      parserName?: string;
      parserVersion?: string;
      documentType?: string;
      graphPreview?: unknown;
    } = {},
  ): Promise<void> {
    if (allIssues.length > 0) {
      await (prisma as any).ingestionValidationIssue?.createMany({
        data: allIssues.map((issue) => ({
          jobId,
          severity: issue.severity,
          code: issue.code,
          message: issue.message,
          stage: issue.stage,
          context: typeof issue.context === "object" ? JSON.stringify(issue.context) : (issue.context ?? null),
        })),
      }).catch(() => null);
    }
    await (prisma as any).ingestionJob?.update({
      where: { id: jobId },
      data: {
        status,
        completedAt: new Date(),
        progressPercent: status === "SUCCEEDED" ? 100 : progressFor(stageIndex),
        currentStage: status === "SUCCEEDED" ? null : (fields.errorStage ?? null),
        errorStage: fields.errorStage,
        errorMessage: fields.errorMessage,
        parserName: fields.parserName,
        parserVersion: fields.parserVersion,
        documentType: fields.documentType,
        graphPreview: fields.graphPreview as Prisma.InputJsonValue | undefined,
      },
    }).catch(() => null);
  }

  try {
    const buffer = await storageAdapter.read(job.documentVersion.storageKey);
    const extension = job.document.fileExtension;
    const mimeType = job.documentVersion.mimeType;
    const fileName = job.documentVersion.fileName;

    const fileIssues = await runStage("FILE_VALIDATION", () =>
      validateFile({ buffer, extension, sizeBytes: buffer.length }),
    );
    allIssues.push(...fileIssues);
    const fatal = fileIssues.find((issue) => issue.severity === "ERROR");
    if (fatal) {
      await finish("FAILED", { errorStage: "FILE_VALIDATION", errorMessage: fatal.message });
      return;
    }

    const {
      document: parsedDocument,
      parserName,
      parserVersion,
    } = await runStage("STRUCTURAL_PARSING", () =>
      runStructuralParsing({ buffer, extension, mimeType, fileName }),
    );

    const documentType = await runStage("DOCUMENT_CLASSIFICATION", () =>
      classifyDocument(parsedDocument.fullText, fileName),
    );

    await runStage("METADATA_EXTRACTION", () =>
      extractMetadata({
        fileName,
        sizeBytes: buffer.length,
        checksum: job.documentVersion.checksum,
        parsedDocument,
      }),
    );

    if (parsedDocument.sections.length === 0) {
      parsedDocument.sections = await runStage("SECTION_DETECTION", () =>
        detectSections(parsedDocument.fullText),
      );
    } else {
      await skipStage("SECTION_DETECTION");
    }

    if (parsedDocument.tables.length === 0) {
      parsedDocument.tables = await runStage("TABLE_DETECTION", () =>
        detectTables(parsedDocument.fullText),
      );
    } else {
      await skipStage("TABLE_DETECTION");
    }

    const entities = await runStage("ENTITY_EXTRACTION", () => extractEntities(parsedDocument));
    const relationships = await runStage("RELATIONSHIP_EXTRACTION", () =>
      extractRelationships(parsedDocument, entities),
    );
    const references = await runStage("REFERENCE_EXTRACTION", () =>
      extractReferences(parsedDocument),
    );

    const extractionIssues = await runStage("VALIDATION", () =>
      validateExtraction({ parsedDocument, entities, references }),
    );
    allIssues.push(...extractionIssues);

    const { extractedAt, issues: provenanceIssues } = await runStage("PROVENANCE_ASSIGNMENT", () =>
      assignProvenance(entities, relationships, references),
    );
    allIssues.push(...provenanceIssues);

    const graphPreview = await runStage("GRAPH_PREPARATION", () =>
      prepareGraphPreview(entities, relationships),
    );

    await runStage("PERSISTENCE", () =>
      persistExtraction({
        provenance: {
          organizationId: job.organizationId,
          jobId: job.id,
          documentId: job.documentId,
          documentVersionId: job.documentVersionId,
          parserVersion,
        },
        extractedAt,
        entities,
        relationships,
        references,
        issues: allIssues,
      }),
    );

    await finish("SUCCEEDED", { parserName, parserVersion, documentType, graphPreview });
  } catch (error) {
    if (error instanceof PipelineCancelledError) {
      const current = await (prisma as any).ingestionJob?.findUnique({
        where: { id: jobId },
        select: { currentStage: true },
      }).catch(() => null);
      await finish("CANCELLED", {
        errorStage: (current?.currentStage as PipelineStageName) ?? "UNKNOWN",
        errorMessage: "Job was cancelled",
      });
      return;
    }
    const stageName = error instanceof StageFailureError ? error.stageName : "UNKNOWN";
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Ingestion pipeline failed", { jobId, stage: stageName, error: message });
    await finish("FAILED", { errorStage: stageName, errorMessage: message });
  }
}
