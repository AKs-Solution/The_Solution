/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import type {
  ExtractedEntityDraft,
  ExtractedReferenceDraft,
  ExtractedRelationshipDraft,
  ProvenanceBase,
  ValidationIssueDraft,
} from "../types";

export interface PersistenceInput {
  provenance: ProvenanceBase;
  extractedAt: Date;
  entities: ExtractedEntityDraft[];
  relationships: ExtractedRelationshipDraft[];
  references: ExtractedReferenceDraft[];
  issues: ValidationIssueDraft[];
}

export interface PersistenceOutput {
  entityCount: number;
  relationshipCount: number;
  referenceCount: number;
  issueCount: number;
}

/**
 * Writes everything produced by the pipeline in a single transaction.
 * Entities are created one-by-one (not createMany) because relationships
 * need to resolve source/target by the entities' real database ids, which
 * only exist once each row is created.
 */
export async function persistExtraction(input: PersistenceInput): Promise<PersistenceOutput> {
  const { provenance, extractedAt } = input;

  await prisma.$transaction(
    async (tx: any) => {
      const localIdToDbId = new Map<string, string>();

      for (const entity of input.entities) {
        const created = await tx.extractedEntity.create({
          data: {
            organizationId: provenance.organizationId,
            jobId: provenance.jobId,
            documentId: provenance.documentId,
            documentVersionId: provenance.documentVersionId,
            entityType: entity.entityType,
            identifier: entity.identifier,
            name: entity.name,
            rawText: entity.rawText,
            attributes: (entity.attributes ?? Prisma.DbNull) as Prisma.InputJsonValue,
            confidence: entity.confidence,
            page: entity.page,
            section: entity.section,
            paragraph: entity.paragraph,
            extractionMethod: entity.extractionMethod,
            parserVersion: provenance.parserVersion,
            extractedAt,
          },
        });
        localIdToDbId.set(entity.localId, created.id);
      }

      const relationshipRows = input.relationships
        .map((relationship) => {
          const sourceId = localIdToDbId.get(relationship.sourceLocalId);
          const targetId = localIdToDbId.get(relationship.targetLocalId);
          if (!sourceId || !targetId) return null;
          return {
            organizationId: provenance.organizationId,
            jobId: provenance.jobId,
            documentId: provenance.documentId,
            relationshipType: relationship.relationshipType,
            sourceExtractedEntityId: sourceId,
            targetExtractedEntityId: targetId,
            confidence: relationship.confidence,
            page: relationship.page,
            section: relationship.section,
            extractionMethod: relationship.extractionMethod,
            parserVersion: provenance.parserVersion,
            extractedAt,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (relationshipRows.length > 0) {
        await tx.extractedRelationship.createMany({ data: relationshipRows });
      }

      if (input.references.length > 0) {
        await tx.extractedReference.createMany({
          data: input.references.map((reference) => ({
            organizationId: provenance.organizationId,
            jobId: provenance.jobId,
            documentId: provenance.documentId,
            referenceType: reference.referenceType,
            rawText: reference.rawText,
            targetIdentifier: reference.targetIdentifier,
            page: reference.page,
            section: reference.section,
            confidence: reference.confidence,
            extractionMethod: reference.extractionMethod,
            parserVersion: provenance.parserVersion,
            extractedAt,
          })),
        });
      }

      if (input.issues.length > 0) {
        await tx.ingestionValidationIssue.createMany({
          data: input.issues.map((issue) => ({
            jobId: provenance.jobId,
            severity: issue.severity,
            code: issue.code,
            message: issue.message,
            stage: issue.stage,
            context: typeof issue.context === "object" ? JSON.stringify(issue.context) : (issue.context ?? null),
          })),
        });
      }
    },
    { timeout: 30_000 },
  );

  return {
    entityCount: input.entities.length,
    relationshipCount: input.relationships.length,
    referenceCount: input.references.length,
    issueCount: input.issues.length,
  };
}
