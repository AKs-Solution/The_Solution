import { prisma } from "@/server/db";
import { DEFAULT_ENGINEERING_PRINCIPLES } from "./constants";
import { EngineeringPrincipleData } from "./types";
import { NotFoundError, ValidationError } from "@/shared/errors";

/**
 * Seeds the standard 17 engineering principles into the database if missing.
 */
export async function ensurePrinciplesSeeded(): Promise<void> {
  const count = await prisma.engineeringPrinciple.count({
    where: { organizationId: null },
  });

  if (count >= DEFAULT_ENGINEERING_PRINCIPLES.length) return;

  for (const principle of DEFAULT_ENGINEERING_PRINCIPLES) {
    await prisma.engineeringPrinciple.upsert({
      where: { code: principle.code },
      update: {
        name: principle.name,
        category: principle.category,
        description: principle.description,
        governingEquations: principle.governingEquations,
        domain: principle.domain,
        supportingEvidenceRefs: principle.supportingEvidenceRefs ?? [],
      },
      create: {
        code: principle.code,
        name: principle.name,
        category: principle.category,
        description: principle.description,
        governingEquations: principle.governingEquations,
        domain: principle.domain,
        version: 1,
        status: "ACTIVE",
        supportingEvidenceRefs: principle.supportingEvidenceRefs ?? [],
        organizationId: null,
      },
    });
  }
}

/**
 * Retrieves engineering principles accessible by an organization (standard + custom tenant principles).
 */
export async function getEngineeringPrinciples(
  organizationId?: string,
  category?: string,
): Promise<EngineeringPrincipleData[]> {
  await ensurePrinciplesSeeded();

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    OR: [{ organizationId: null }, ...(organizationId ? [{ organizationId }] : [])],
  };

  if (category) {
    where.category = category;
  }

  const rows = await prisma.engineeringPrinciple.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description,
    governingEquations: (r.governingEquations as string[]) ?? [],
    domain: r.domain,
    version: r.version,
    status: r.status,
    supportingEvidenceRefs: (r.supportingEvidenceRefs as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
  }));
}

/**
 * Retrieves a specific principle by code or id.
 */
export async function getPrincipleByCode(
  code: string,
  organizationId?: string,
): Promise<EngineeringPrincipleData> {
  await ensurePrinciplesSeeded();

  const principle = await prisma.engineeringPrinciple.findFirst({
    where: {
      code,
      OR: [{ organizationId: null }, ...(organizationId ? [{ organizationId }] : [])],
    },
  });

  if (!principle) {
    throw new NotFoundError("EngineeringPrinciple", code);
  }

  return {
    id: principle.id,
    code: principle.code,
    name: principle.name,
    category: principle.category,
    description: principle.description,
    governingEquations: (principle.governingEquations as string[]) ?? [],
    domain: principle.domain,
    version: principle.version,
    status: principle.status,
    supportingEvidenceRefs: (principle.supportingEvidenceRefs as string[]) ?? [],
    metadata: (principle.metadata as Record<string, unknown>) ?? {},
  };
}

/**
 * Creates or extends a custom tenant-specific Engineering Principle.
 */
export async function createCustomPrinciple(
  organizationId: string,
  data: Omit<EngineeringPrincipleData, "id" | "version" | "status">,
): Promise<EngineeringPrincipleData> {
  if (!data.code || !data.name || !data.category || !data.description) {
    throw new ValidationError(
      "Missing required principle fields (code, name, category, description)",
    );
  }

  const existing = await prisma.engineeringPrinciple.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new ValidationError(`Engineering Principle with code '${data.code}' already exists`);
  }

  const created = await prisma.engineeringPrinciple.create({
    data: {
      organizationId,
      code: data.code,
      name: data.name,
      category: data.category,
      description: data.description,
      governingEquations: data.governingEquations ?? [],
      domain: data.domain || "Systems",
      version: 1,
      status: "ACTIVE",
      supportingEvidenceRefs: data.supportingEvidenceRefs ?? [],
      metadata: data.metadata ? (data.metadata as unknown as object) : undefined,
    },
  });

  return {
    id: created.id,
    code: created.code,
    name: created.name,
    category: created.category,
    description: created.description,
    governingEquations: (created.governingEquations as string[]) ?? [],
    domain: created.domain,
    version: created.version,
    status: created.status,
    supportingEvidenceRefs: (created.supportingEvidenceRefs as string[]) ?? [],
    metadata: (created.metadata as Record<string, unknown>) ?? {},
  };
}

/**
 * Increments principle version with updated governing equations or supporting evidence.
 */
export async function updatePrincipleVersion(
  id: string,
  organizationId: string,
  updates: Partial<
    Pick<EngineeringPrincipleData, "description" | "governingEquations" | "supportingEvidenceRefs">
  >,
): Promise<EngineeringPrincipleData> {
  const principle = await prisma.engineeringPrinciple.findFirst({
    where: { id, organizationId },
  });

  if (!principle) {
    throw new NotFoundError("EngineeringPrinciple", id);
  }

  const updated = await prisma.engineeringPrinciple.update({
    where: { id },
    data: {
      version: principle.version + 1,
      description: updates.description ?? principle.description,
      governingEquations:
        updates.governingEquations ?? (principle.governingEquations as unknown as object),
      supportingEvidenceRefs:
        updates.supportingEvidenceRefs ?? (principle.supportingEvidenceRefs as unknown as object),
    },
  });

  return {
    id: updated.id,
    code: updated.code,
    name: updated.name,
    category: updated.category,
    description: updated.description,
    governingEquations: (updated.governingEquations as string[]) ?? [],
    domain: updated.domain,
    version: updated.version,
    status: updated.status,
    supportingEvidenceRefs: (updated.supportingEvidenceRefs as string[]) ?? [],
    metadata: (updated.metadata as Record<string, unknown>) ?? {},
  };
}
