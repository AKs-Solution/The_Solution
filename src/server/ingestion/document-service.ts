/* eslint-disable @typescript-eslint/no-unused-vars */
import { createHash } from "node:crypto";
import path from "node:path";
import { prisma } from "@/server/db";
import { config } from "@/shared/config";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/logging";
import { storageAdapter } from "./storage";
import type { DocumentFilterInput } from "./validation";

export interface UploadFileInput {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}

function checksumOf(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function extensionOf(fileName: string): string {
  return path.extname(fileName).replace(/^\./, "").toLowerCase();
}

function assertSupportedExtension(_extension: string): void {
  // Allow all file formats (PDF, CAD STEP/DXF/DWG, CSV, XLSX, DOCX, TXT, images, etc.)
  return;
}

function assertWithinSizeLimit(sizeBytes: number): void {
  if (sizeBytes > config.ingestionMaxFileSizeBytes) {
    throw new ValidationError({
      file: [
        `File exceeds the maximum allowed size of ${config.ingestionMaxFileSizeBytes / (1024 * 1024)}MB`,
      ],
    });
  }
}

export async function uploadDocument(
  organizationId: string,
  userId: string,
  file: UploadFileInput,
) {
  const extension = extensionOf(file.fileName);
  assertSupportedExtension(extension);
  assertWithinSizeLimit(file.buffer.length);

  const document = await prisma.ingestionDocument.create({
    data: {
      organizationId,
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileExtension: extension,
      sizeBytes: file.buffer.length,
      checksum: checksumOf(file.buffer),
      storageKey: "", // set below once we know the generated document id
      uploadedById: userId,
    },
  });

  const storageKey = await storageAdapter.save(
    { organizationId, documentId: document.id, version: 1, fileName: file.fileName },
    file.buffer,
  );

  const [updatedDocument] = await prisma.$transaction([
    prisma.ingestionDocument.update({ where: { id: document.id }, data: { storageKey } }),
    prisma.ingestionDocumentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.buffer.length,
        checksum: checksumOf(file.buffer),
        storageKey,
        createdById: userId,
      },
    }),
  ]);

  logger.info("Ingestion document uploaded", { documentId: document.id, fileName: file.fileName });
  return updatedDocument;
}

export async function uploadNewVersion(
  documentId: string,
  organizationId: string,
  userId: string,
  file: UploadFileInput,
) {
  const document = await prisma.ingestionDocument.findFirst({
    where: { id: documentId, organizationId, deletedAt: null },
  });
  if (!document) throw new NotFoundError("IngestionDocument", documentId);

  const extension = extensionOf(file.fileName);
  assertSupportedExtension(extension);
  assertWithinSizeLimit(file.buffer.length);

  const nextVersion = document.currentVersion + 1;
  const storageKey = await storageAdapter.save(
    { organizationId, documentId, version: nextVersion, fileName: file.fileName },
    file.buffer,
  );

  const [, version] = await prisma.$transaction([
    prisma.ingestionDocument.update({
      where: { id: documentId },
      data: {
        currentVersion: nextVersion,
        fileName: file.fileName,
        mimeType: file.mimeType,
        fileExtension: extension,
        sizeBytes: file.buffer.length,
        checksum: checksumOf(file.buffer),
        storageKey,
        status: "UPLOADED",
      },
    }),
    prisma.ingestionDocumentVersion.create({
      data: {
        documentId,
        version: nextVersion,
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.buffer.length,
        checksum: checksumOf(file.buffer),
        storageKey,
        createdById: userId,
      },
    }),
  ]);

  logger.info("Ingestion document version uploaded", { documentId, version: nextVersion });
  return version;
}

export async function listDocuments(organizationId: string, filters: DocumentFilterInput) {
  const { search, page, pageSize } = filters;
  const where: Record<string, unknown> = { organizationId, deletedAt: null };
  if (search) {
    where.fileName = { contains: search, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.ingestionDocument.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { versions: true, jobs: true } } },
    }),
    prisma.ingestionDocument.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getDocument(documentId: string, organizationId: string) {
  const document = await prisma.ingestionDocument.findFirst({
    where: { id: documentId, organizationId, deletedAt: null },
    include: {
      versions: { orderBy: { version: "desc" } },
      jobs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!document) throw new NotFoundError("IngestionDocument", documentId);
  return document;
}

export async function getCurrentDocumentVersion(documentId: string, organizationId: string) {
  const document = await prisma.ingestionDocument.findFirst({
    where: { id: documentId, organizationId, deletedAt: null },
  });
  if (!document) throw new NotFoundError("IngestionDocument", documentId);

  const version = await prisma.ingestionDocumentVersion.findUnique({
    where: { documentId_version: { documentId, version: document.currentVersion } },
  });
  if (!version)
    throw new NotFoundError("IngestionDocumentVersion", String(document.currentVersion));
  return version;
}
