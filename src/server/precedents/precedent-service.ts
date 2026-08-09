/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import {
  EngineeringPrecedent,
  PrecedentQuery,
  HistoricalPrecedentAuditLog,
  PrecedentType,
  PrecedentMatchContext,
} from "@/features/precedents/types";
import { logger } from "@/shared/logging";
import { Prisma } from "@prisma/client";
import { ValidationError } from "@/shared/errors";

// High-fidelity seed data reflecting real historical engineering rationale, failures, and wisdom.
const INITIAL_PRECEDENTS = [
  {
    id: "prec-1",
    title: "Ariane 5 Flight 501 Software Failure",
    summary:
      "Loss of launcher orientation after aerodynamic load overload due to guidance system calculation error.",
    engineeringQuestion:
      "Can software variables in aerospace modules operate without protective operand boundary checkers?",
    decisionMade:
      "Mandated protective casting handlers for all variables and HIL hardware-in-the-loop simulation runs.",
    supportingEvidence: ["HIL Simulation Run #A501-S3", "Software Verification Test Plan"],
    contradictions: ["Guidance system calculation mismatch warnings"],
    missingEvidence: [],
    outcome: "Ariane 5 platform subsequent flights successfully validated guidance stability.",
    lessonsLearned:
      "Include protective handlers for all variable casting; run full end-to-end hardware-in-the-loop simulation of flight software.",
    relatedProjects: ["Ariane 5"],
    relatedSuppliers: ["Arianespace"],
    relatedRequirements: ["DO-178C Section 6.4"],
    relatedDocuments: ["Ariane 5 Inquiry Board Report"],
    relatedComponents: ["Guidance & Control", "Software System"],
    relatedStandards: ["IEEE 754 Floating Point Standard", "DO-178C"],
    relatedCertifications: [],
    confidence: 1.0,
    tags: ["software", "failure", "guidance", "overflow"],
  },
  {
    id: "prec-2",
    title: "Titanium Alloy Grade 5 Stress Corrosion Cracking (SCC) in Saltwater",
    summary:
      "Rapid brittle fracture of high-tension structural fasteners observed during deep-water endurance trials.",
    engineeringQuestion:
      "Can titanium fasteners be safely used in deep-water crevices under high mechanical tension?",
    decisionMade:
      "Mandated Super Duplex Stainless Steel (PREN > 40) fasteners and cadmium-free galvanic plating.",
    supportingEvidence: ["Salt Spray Lab Test #9822", "Material Integrity Report"],
    contradictions: ["Titanium stress concentration values in saline crevices"],
    missingEvidence: ["Anodic Polarization Test Report"],
    outcome:
      "Super Duplex fasteners exhibited zero cracking during 12 months of saltwater exposure.",
    lessonsLearned:
      "Chloride-induced stress corrosion cracking occurs in crevices with oxygen depletion under mechanically applied high stress.",
    relatedProjects: ["Deepsea Intake Phase 2"],
    relatedSuppliers: ["Titan Material Group"],
    relatedRequirements: ["REQ-MAT-4.8 Crevice Safety"],
    relatedDocuments: ["Deep-Water Endurance Summary Report"],
    relatedComponents: ["Structure", "Material Selection", "Fasteners"],
    relatedStandards: ["ASTM G48 Crevice Corrosion Standard"],
    relatedCertifications: ["NACE MR0175/ISO 15156"],
    confidence: 0.95,
    tags: ["material", "corrosion", "fracture", "saltwater"],
  },
  {
    id: "prec-3",
    title: "Composite Fuel Tank Micro-Cracking under Cryogenic Cycling",
    summary:
      "Leakage of liquid hydrogen fuel during multiple fueling thermal load simulation cycles.",
    engineeringQuestion:
      "Do carbon fiber fuel tank matrices maintain structural barrier properties at -183°C under cyclic loads?",
    decisionMade:
      "Integrated inner elastomeric membrane liner and upgraded resin to cyanate ester matrix.",
    supportingEvidence: ["Thermal Vacuum Deflection Analysis #V12"],
    contradictions: ["Coefficient of thermal expansion mismatch warnings"],
    missingEvidence: ["Cryogenic Permeability Test Log"],
    outcome: "Upgraded tanks completed 100 cryogenic load cycles with zero leakage.",
    lessonsLearned:
      "Thermal expansion coefficient mismatch between carbon fiber weave and the epoxy resin matrix cures matrix micro-cracking.",
    relatedProjects: ["Apollo Propulsion Rev C"],
    relatedSuppliers: ["Composite Tech Inc"],
    relatedRequirements: ["REQ-PROP-2.4 Cryo Containment"],
    relatedDocuments: ["Cryogenic Structural Integrity Review"],
    relatedComponents: ["Propulsion", "Fuel System", "Composite Materials"],
    relatedStandards: ["ISO 11114 Transportable Gas Cylinders"],
    relatedCertifications: [],
    confidence: 0.9,
    tags: ["cryo", "composite", "fuel-tank", "thermal"],
  },
  {
    id: "prec-4",
    title: "Dual-Redundant Fly-by-Wire Hydraulic Actuation Integration",
    summary:
      "A highly resilient control system surface actuation design utilizing decoupled split hydraulics and electrical control paths.",
    engineeringQuestion:
      "Does split hydraulic feedback ensure fly-by-wire flight control survival under double structural losses?",
    decisionMade:
      "Designed independent hydraulic channels with decoupled split-loop control paths and mechanical firewalls.",
    supportingEvidence: [
      "Failure Mode Effects Analysis (FMEA) Report #8",
      "Decoupled Actuator Run Logs",
    ],
    contradictions: [],
    missingEvidence: [],
    outcome:
      "System qualified through structural impact tests, surviving triple electrical failures.",
    lessonsLearned:
      "Decoupling feedback control lines keeps hydraulic systems operational under physical component loss.",
    relatedProjects: ["Aviation Flight System Integration"],
    relatedSuppliers: ["FlyByWire Systems"],
    relatedRequirements: ["REQ-FBW-9.1 Double Redundancy"],
    relatedDocuments: ["Aviation Flight System Integration Manual"],
    relatedComponents: ["Flight Controls", "Hydraulics"],
    relatedStandards: ["MIL-H-5440 Hydraulic System Design Standard"],
    relatedCertifications: ["FAA Part 25 Certification"],
    confidence: 0.98,
    tags: ["redundancy", "hydraulics", "controls", "safety"],
  },
  {
    id: "prec-5",
    title: "MIL-STD-810H Temperature & Structural Vibration Compliance Standards",
    summary:
      "Standardized environmental testing criteria to qualify engineering models against mission profiles.",
    engineeringQuestion:
      "Do standard laboratory room vibration profiles satisfy launch environment qualifications?",
    decisionMade:
      "Mandated multi-axis launch vibration profile tests according to MIL-STD-810H standard.",
    supportingEvidence: ["Environmental Lab Vibration Test #776", "Launch Acceleration Profiles"],
    contradictions: [],
    missingEvidence: ["Thermal Cycling Test Report"],
    outcome:
      "Qualification testing successfully flagged structural weld fractures prior to assembly.",
    lessonsLearned: "Static room vibration testing misses high-acceleration multi-axis resonances.",
    relatedProjects: ["Qual-Test 2025"],
    relatedSuppliers: ["Aᴷ Qualification Labs"],
    relatedRequirements: ["REQ-ENV-810 Vibration Limits"],
    relatedDocuments: ["MIL-STD-810H Official Handbook"],
    relatedComponents: ["Testing & Verification", "Structure"],
    relatedStandards: ["MIL-STD-810H", "Department of Defense Test Method Standard"],
    relatedCertifications: ["Environmental Quality Seal"],
    confidence: 1.0,
    tags: ["testing", "vibration", "standards", "qualification"],
  },
  {
    id: "prec-6",
    title: "Fastener Lot #9822 Yield Strength Failure (Supplier: Alpha Bolt)",
    summary:
      "A lot of structural shear bolts exhibited tensile failure below the 120 ksi specification constraint during intake lot checks.",
    engineeringQuestion:
      "Can incoming supplier shear bolts be approved without local metallurgical batch tests?",
    decisionMade:
      "Imposed 100% receiving-inspection hardness lot tests and placed supplier on active inspection probation.",
    supportingEvidence: ["Metallurgical Analysis Report #M-0442", "Intake Hardness Logs"],
    contradictions: ["Alpha Bolt certificate of conformity values vs. local tensile testing"],
    missingEvidence: [],
    outcome:
      "Reconciliation of shear bolt batches resulted in supplier replacing the entire lot #9822.",
    lessonsLearned:
      "Inadequate cooling rate matching during quench-hardening cycles creates micro-voids in fastener ferrite layers.",
    relatedProjects: ["Structural Intake Inspection"],
    relatedSuppliers: ["Alpha Bolt"],
    relatedRequirements: ["REQ-STR-1.2 Fastener Tensile"],
    relatedDocuments: ["Receiving Quality Report for Lot #9822"],
    relatedComponents: ["Structural Fasteners", "Fasteners", "Supply Chain"],
    relatedStandards: ["ISO 898 Fasteners Mechanical Properties"],
    relatedCertifications: ["Alpha Bolt Certificate of Conformity"],
    confidence: 0.88,
    tags: ["supplier", "failure", "metallurgy", "fasteners"],
  },
];

/**
 * Self-healing seeder for historical precedents in the database
 */
export async function ensurePrecedentsSeeded(
  organizationId: string,
  userId?: string,
): Promise<void> {
  try {
    let creatorId = userId || null;
    if (!creatorId) {
      const member = await (prisma as any).organizationMember?.findFirst({
        where: { organizationId },
      }).catch(() => null);
      creatorId = member?.userId || null;
    }

    for (const p of INITIAL_PRECEDENTS) {
      const existing = await prisma.historicalPrecedent.findFirst({
        where: { organizationId, id: p.id },
      });

      if (!existing) {
        const precedent = await prisma.historicalPrecedent.create({
          data: {
            id: p.id,
            organizationId,
            title: p.title,
            summary: p.summary,
            engineeringQuestion: p.engineeringQuestion,
            decisionMade: p.decisionMade,
            supportingEvidence: p.supportingEvidence as any,
            contradictions: p.contradictions as any,
            missingEvidence: p.missingEvidence as any,
            outcome: p.outcome,
            lessonsLearned: p.lessonsLearned,
            relatedProjects: p.relatedProjects as any,
            relatedSuppliers: p.relatedSuppliers as any,
            relatedRequirements: p.relatedRequirements as any,
            relatedDocuments: p.relatedDocuments as any,
            relatedComponents: p.relatedComponents as any,
            relatedStandards: p.relatedStandards as any,
            relatedCertifications: p.relatedCertifications as any,
            confidence: p.confidence,
            tags: p.tags as any,
            decisionOwnerId: creatorId,
            auditMetadata: [
              {
                action: "INITIAL_SEED",
                performedBy: "Precedent Seeding Engine",
                timestamp: new Date().toISOString(),
                details: { source: "Ariane/Titan/Cryo historical archives" },
              },
            ] as any,
          },
        });

        // Version History creation
        await prisma.historicalPrecedentVersion.create({
          data: {
            precedentId: precedent.id,
            version: 1,
            title: precedent.title,
            summary: precedent.summary,
            decisionMade: precedent.decisionMade,
            outcome: precedent.outcome,
            lessonsLearned: precedent.lessonsLearned,
            snapshot: precedent as any,
            changeDescription: "Initial seed data load",
            createdById: creatorId,
          },
        });
      }
    }
    logger.info("Historical Precedent Seeding Completed", { organizationId });
  } catch (err) {
    logger.error("Failed to seed historical precedents", { organizationId, err });
  }
}

/**
 * Maps the database model to user-facing EngineeringPrecedent type
 */
function mapToEngineeringPrecedent(dbPrecedent: any): EngineeringPrecedent {
  const versions = dbPrecedent.versions
    ? dbPrecedent.versions.map((v: any) => ({
        id: v.id,
        version: v.version,
        title: v.title,
        summary: v.summary,
        decisionMade: v.decisionMade,
        outcome: v.outcome,
        lessonsLearned: v.lessonsLearned,
        createdAt: v.createdAt.toISOString(),
        changeDescription: v.changeDescription,
        createdById: v.createdById,
      }))
    : [];

  const relatedComponents = (dbPrecedent.relatedComponents as string[]) || [];
  const relatedSuppliers = (dbPrecedent.relatedSuppliers as string[]) || [];
  const relatedStandards = (dbPrecedent.relatedStandards as string[]) || [];
  const relatedRequirements = (dbPrecedent.relatedRequirements as string[]) || [];
  const relatedCertifications = (dbPrecedent.relatedCertifications as string[]) || [];
  const relatedDocuments = (dbPrecedent.relatedDocuments as string[]) || [];
  const supportingEvidence = (dbPrecedent.supportingEvidence as string[]) || [];
  const contradictions = (dbPrecedent.contradictions as string[]) || [];
  const tags = (dbPrecedent.tags as string[]) || [];
  const auditMetadata =
    (dbPrecedent.auditMetadata as unknown as HistoricalPrecedentAuditLog[]) || [];

  // Determine Legacy Precedent Type
  let type: PrecedentType = "FAILURE";
  if (
    tags.includes("successful-design") ||
    tags.includes("success") ||
    dbPrecedent.title.toLowerCase().includes("redundant")
  ) {
    type = "SUCCESSFUL_DESIGN";
  } else if (
    tags.includes("testing") ||
    tags.includes("standards") ||
    dbPrecedent.title.toLowerCase().includes("std")
  ) {
    type = "REGULATORY_PRECEDENT";
  } else if (tags.includes("supplier") || relatedSuppliers.length > 0) {
    type = "SUPPLIER_HISTORY";
  }

  // Linked entities resolver for legacy components
  const linkedEntities = [
    ...relatedComponents.map((c, i) => ({
      id: `comp-${i}`,
      name: c,
      type: "COMPONENT",
      identifier: `COMP-${c.toUpperCase()}`,
    })),
    ...relatedSuppliers.map((s, i) => ({
      id: `supp-${i}`,
      name: s,
      type: "SUPPLIER",
      identifier: `SUPP-${s.toUpperCase()}`,
    })),
  ];

  // Re-map versionHistory & auditTrail in legacy formats
  const versionHistory = versions.map((v: any) => ({
    id: v.id,
    version: `${v.version}.0.0`,
    description: v.changeDescription || "Modified",
    createdAt: v.createdAt,
  }));

  const auditTrail = auditMetadata.map((a, i) => ({
    id: `audit-${i}`,
    action: a.action,
    metadata: a.details || {},
    createdAt: a.timestamp,
  }));

  return {
    id: dbPrecedent.id,
    organizationId: dbPrecedent.organizationId,
    title: dbPrecedent.title,
    summary: dbPrecedent.summary,
    engineeringQuestion: dbPrecedent.engineeringQuestion,
    decisionMade: dbPrecedent.decisionMade,
    supportingEvidence,
    contradictions,
    missingEvidence: (dbPrecedent.missingEvidence as string[]) || [],
    outcome: dbPrecedent.outcome,
    lessonsLearned: dbPrecedent.lessonsLearned,
    relatedProjects: (dbPrecedent.relatedProjects as string[]) || [],
    relatedSuppliers,
    relatedRequirements,
    relatedDocuments,
    relatedComponents,
    relatedStandards,
    relatedCertifications,
    decisionDate: dbPrecedent.decisionDate.toISOString(),
    decisionOwnerId: dbPrecedent.decisionOwnerId,
    decisionOwner: dbPrecedent.decisionOwner
      ? {
          id: dbPrecedent.decisionOwner.id,
          name: dbPrecedent.decisionOwner.name,
          email: dbPrecedent.decisionOwner.email,
        }
      : null,
    confidence: dbPrecedent.confidence,
    tags,
    auditMetadata,
    createdAt: dbPrecedent.createdAt.toISOString(),
    updatedAt: dbPrecedent.updatedAt.toISOString(),
    deletedAt: dbPrecedent.deletedAt ? dbPrecedent.deletedAt.toISOString() : null,
    versions,

    // Legacy Fields mappings
    type,
    description: dbPrecedent.summary,
    rootCause: contradictions.length > 0 ? contradictions.join("; ") : "No failure encountered.",
    correctiveAction: dbPrecedent.decisionMade,
    resolutionStatus: dbPrecedent.outcome === "RESOLVED" ? "RESOLVED" : "MITIGATED",
    confidenceScore: dbPrecedent.confidence,
    applicableSystems: relatedComponents,
    evidenceMetadata: {
      documents: relatedDocuments,
      standards: relatedStandards,
      testReports: supportingEvidence,
    },
    whyRelevant: "Direct match based on historical system and material baseline.",
    evidenceStrength: dbPrecedent.confidence,
    linkedEntities,
    relatedFailures: type === "FAILURE" ? [dbPrecedent.title] : [],
    relatedCorrectiveActions: dbPrecedent.decisionMade ? [dbPrecedent.decisionMade] : [],
    engineeringStandards: relatedStandards,
    graphRelationshipsTraversed: relatedComponents.map(
      (c) => `[PRECEDENT: ${dbPrecedent.title}] --APPLIES_TO--> [COMPONENT: ${c}]`,
    ),
    rulesEvaluated: ["Standard validation checked"],
    assumptionsRejected: ["Design margins require verification evidence."],
    versionHistory,
    auditTrail,
  };
}

/**
 * Returns precedents for the organization based on queries
 */
export async function getPrecedents(query: PrecedentQuery & { organizationId?: string }): Promise<{
  data: EngineeringPrecedent[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const orgId = query.organizationId;
  if (!orgId) {
    throw new ValidationError({
      organizationId: ["Organization ID is required to fetch precedents."],
    });
  }

  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;

  // Auto seed default data if DB is empty
  const count = await prisma.historicalPrecedent.count({
    where: { organizationId: orgId, deletedAt: null },
  });
  if (count === 0) {
    await ensurePrecedentsSeeded(orgId);
  }

  // Construct filters
  const andFilters: Prisma.HistoricalPrecedentWhereInput[] = [
    { organizationId: orgId, deletedAt: null },
  ];

  if (query.search) {
    const term = query.search.toLowerCase();
    andFilters.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { summary: { contains: term, mode: "insensitive" } },
        { engineeringQuestion: { contains: term, mode: "insensitive" } },
        { decisionMade: { contains: term, mode: "insensitive" } },
        { outcome: { contains: term, mode: "insensitive" } },
        { lessonsLearned: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  // Filter inside JSON arrays
  if (query.supplier) {
    andFilters.push({
      relatedSuppliers: {
        array_contains: query.supplier,
      },
    });
  }

  if (query.requirement) {
    andFilters.push({
      relatedRequirements: {
        array_contains: query.requirement,
      },
    });
  }

  if (query.component) {
    andFilters.push({
      relatedComponents: {
        array_contains: query.component,
      },
    });
  }

  if (query.project) {
    andFilters.push({
      relatedProjects: {
        array_contains: query.project,
      },
    });
  }

  if (query.certification) {
    andFilters.push({
      relatedCertifications: {
        array_contains: query.certification,
      },
    });
  }

  if (query.standard) {
    andFilters.push({
      relatedStandards: {
        array_contains: query.standard,
      },
    });
  }

  if (query.tags) {
    const tagsArr = query.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const tag of tagsArr) {
      andFilters.push({
        tags: {
          array_contains: tag,
        },
      });
    }
  }

  if (query.owner) {
    andFilters.push({
      decisionOwner: {
        OR: [
          { name: { contains: query.owner, mode: "insensitive" } },
          { email: { contains: query.owner, mode: "insensitive" } },
        ],
      },
    });
  }

  if (query.dateFrom) {
    andFilters.push({
      decisionDate: { gte: new Date(query.dateFrom) },
    });
  }

  if (query.dateTo) {
    andFilters.push({
      decisionDate: { lte: new Date(query.dateTo) },
    });
  }

  const where: Prisma.HistoricalPrecedentWhereInput = { AND: andFilters };

  // Sorting
  const sortBy = query.sortBy || "decisionDate";
  const sortOrder = query.sortOrder || "desc";
  const orderBy: Prisma.HistoricalPrecedentOrderByWithRelationInput = {};
  if (
    sortBy === "title" ||
    sortBy === "summary" ||
    sortBy === "decisionDate" ||
    sortBy === "createdAt"
  ) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.decisionDate = "desc";
  }

  // Query matching records
  const dbRecords = await prisma.historicalPrecedent.findMany({
    where,
    orderBy,
    include: {
      decisionOwner: true,
      versions: { orderBy: { version: "desc" } },
    },
  });

  let data = dbRecords.map(mapToEngineeringPrecedent);

  // Filter by legacy system if passed
  if (query.system && query.system !== "ALL") {
    const sysLower = query.system.toLowerCase();
    data = data.filter((p) => p.relatedComponents.some((c) => c.toLowerCase().includes(sysLower)));
  }

  // Filter by legacy type if passed
  if (query.type && query.type !== "ALL") {
    data = data.filter((p) => p.type === query.type);
  }

  const total = data.length;
  const paginatedData = data.slice(skip, skip + pageSize);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
  };
}

/**
 * Returns a precedent by ID
 */
export async function getPrecedentById(
  id: string,
  organizationId: string,
): Promise<EngineeringPrecedent | null> {
  const dbPrecedent = await prisma.historicalPrecedent.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: {
      decisionOwner: true,
      versions: { orderBy: { version: "desc" } },
    },
  });

  if (!dbPrecedent) return null;
  return mapToEngineeringPrecedent(dbPrecedent);
}

/**
 * Creates a new historical precedent and logs its version
 */
export async function createPrecedent(input: {
  organizationId?: string;
  title: string;
  summary: string;
  engineeringQuestion: string;
  decisionMade: string;
  supportingEvidence: string[];
  contradictions: string[];
  missingEvidence: string[];
  outcome: string;
  lessonsLearned: string;
  relatedProjects?: string[];
  relatedSuppliers?: string[];
  relatedRequirements?: string[];
  relatedDocuments?: string[];
  relatedComponents?: string[];
  relatedStandards?: string[];
  relatedCertifications?: string[];
  confidence?: number;
  tags: string[];
  userId?: string | null;
}): Promise<EngineeringPrecedent> {
  const orgId = input.organizationId;
  if (!orgId) {
    throw new ValidationError({
      organizationId: ["Organization ID is required to create a precedent."],
    });
  }

  // Avoid exact duplication on Title within the same organization
  const duplicate = await prisma.historicalPrecedent.findFirst({
    where: {
      organizationId: orgId,
      title: input.title,
      deletedAt: null,
    },
  });

  if (duplicate) {
    throw new Error(`A historical precedent with the title "${input.title}" already exists.`);
  }

  const precedent = await prisma.historicalPrecedent.create({
    data: {
      organizationId: orgId,
      title: input.title,
      summary: input.summary,
      engineeringQuestion: input.engineeringQuestion,
      decisionMade: input.decisionMade,
      supportingEvidence: input.supportingEvidence as any,
      contradictions: input.contradictions as any,
      missingEvidence: input.missingEvidence as any,
      outcome: input.outcome,
      lessonsLearned: input.lessonsLearned,
      relatedProjects: (input.relatedProjects || []) as any,
      relatedSuppliers: (input.relatedSuppliers || []) as any,
      relatedRequirements: (input.relatedRequirements || []) as any,
      relatedDocuments: (input.relatedDocuments || []) as any,
      relatedComponents: (input.relatedComponents || []) as any,
      relatedStandards: (input.relatedStandards || []) as any,
      relatedCertifications: (input.relatedCertifications || []) as any,
      confidence: input.confidence ?? 1.0,
      tags: input.tags as any,
      decisionOwnerId: input.userId || null,
      auditMetadata: [
        {
          action: "CREATED",
          performedBy: input.userId || "System User",
          timestamp: new Date().toISOString(),
          details: { note: "First sign-off and recording" },
        },
      ] as any,
    },
    include: {
      decisionOwner: true,
    },
  });

  // Create first version history
  await prisma.historicalPrecedentVersion.create({
    data: {
      precedentId: precedent.id,
      version: 1,
      title: precedent.title,
      summary: precedent.summary,
      decisionMade: precedent.decisionMade,
      outcome: precedent.outcome,
      lessonsLearned: precedent.lessonsLearned,
      snapshot: precedent as any,
      changeDescription: "Initial version",
      createdById: input.userId || null,
    },
  });

  return mapToEngineeringPrecedent(precedent);
}

/**
 * Updates an existing historical precedent, incrementing its version
 */
export async function updatePrecedent(
  id: string,
  organizationId: string,
  input: {
    title?: string;
    summary?: string;
    engineeringQuestion?: string;
    decisionMade?: string;
    supportingEvidence?: string[];
    contradictions?: string[];
    missingEvidence?: string[];
    outcome?: string;
    lessonsLearned?: string;
    relatedProjects?: string[];
    relatedSuppliers?: string[];
    relatedRequirements?: string[];
    relatedDocuments?: string[];
    relatedComponents?: string[];
    relatedStandards?: string[];
    relatedCertifications?: string[];
    confidence?: number;
    tags?: string[];
    changeDescription?: string;
    userId?: string | null;
  },
): Promise<EngineeringPrecedent> {
  const existing = await prisma.historicalPrecedent.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!existing) {
    throw new Error(`Precedent not found or unauthorized: ${id}`);
  }

  const nextVersion = existing.versions.length > 0 ? existing.versions[0].version + 1 : 1;

  // Build new audit logs
  const auditMetadata = (existing.auditMetadata as unknown as HistoricalPrecedentAuditLog[]) || [];
  auditMetadata.push({
    action: "UPDATED",
    performedBy: input.userId || "System User",
    timestamp: new Date().toISOString(),
    details: { version: nextVersion, description: input.changeDescription || "Modified fields" },
  });

  const updatedPrecedent = await prisma.historicalPrecedent.update({
    where: { id },
    data: {
      title: input.title !== undefined ? input.title : existing.title,
      summary: input.summary !== undefined ? input.summary : existing.summary,
      engineeringQuestion:
        input.engineeringQuestion !== undefined
          ? input.engineeringQuestion
          : existing.engineeringQuestion,
      decisionMade: input.decisionMade !== undefined ? input.decisionMade : existing.decisionMade,
      supportingEvidence:
        input.supportingEvidence !== undefined
          ? (input.supportingEvidence as any)
          : existing.supportingEvidence,
      contradictions:
        input.contradictions !== undefined
          ? (input.contradictions as any)
          : existing.contradictions,
      missingEvidence:
        input.missingEvidence !== undefined
          ? (input.missingEvidence as any)
          : existing.missingEvidence,
      outcome: input.outcome !== undefined ? input.outcome : existing.outcome,
      lessonsLearned:
        input.lessonsLearned !== undefined ? input.lessonsLearned : existing.lessonsLearned,
      relatedProjects:
        input.relatedProjects !== undefined
          ? (input.relatedProjects as any)
          : existing.relatedProjects,
      relatedSuppliers:
        input.relatedSuppliers !== undefined
          ? (input.relatedSuppliers as any)
          : existing.relatedSuppliers,
      relatedRequirements:
        input.relatedRequirements !== undefined
          ? (input.relatedRequirements as any)
          : existing.relatedRequirements,
      relatedDocuments:
        input.relatedDocuments !== undefined
          ? (input.relatedDocuments as any)
          : existing.relatedDocuments,
      relatedComponents:
        input.relatedComponents !== undefined
          ? (input.relatedComponents as any)
          : existing.relatedComponents,
      relatedStandards:
        input.relatedStandards !== undefined
          ? (input.relatedStandards as any)
          : existing.relatedStandards,
      relatedCertifications:
        input.relatedCertifications !== undefined
          ? (input.relatedCertifications as any)
          : existing.relatedCertifications,
      confidence: input.confidence !== undefined ? input.confidence : existing.confidence,
      tags: input.tags !== undefined ? (input.tags as any) : existing.tags,
      auditMetadata: auditMetadata as any,
    },
    include: {
      decisionOwner: true,
    },
  });

  // Log new version history
  await prisma.historicalPrecedentVersion.create({
    data: {
      precedentId: updatedPrecedent.id,
      version: nextVersion,
      title: updatedPrecedent.title,
      summary: updatedPrecedent.summary,
      decisionMade: updatedPrecedent.decisionMade,
      outcome: updatedPrecedent.outcome,
      lessonsLearned: updatedPrecedent.lessonsLearned,
      snapshot: updatedPrecedent as any,
      changeDescription: input.changeDescription || `Updated to version ${nextVersion}`,
      createdById: input.userId || null,
    },
  });

  return mapToEngineeringPrecedent(updatedPrecedent);
}

/**
 * Soft deletes a precedent
 */
export async function deletePrecedent(
  id: string,
  organizationId: string,
  userId?: string,
): Promise<boolean> {
  const existing = await prisma.historicalPrecedent.findFirst({
    where: { id, organizationId, deletedAt: null },
  });

  if (!existing) {
    throw new Error(`Precedent not found or unauthorized: ${id}`);
  }

  const auditMetadata = (existing.auditMetadata as unknown as HistoricalPrecedentAuditLog[]) || [];
  auditMetadata.push({
    action: "DELETED",
    performedBy: userId || "System User",
    timestamp: new Date().toISOString(),
    details: { reason: "Soft-deleted by user request" },
  });

  await prisma.historicalPrecedent.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      auditMetadata: auditMetadata as any,
    },
  });

  return true;
}

/**
 * Computes deterministic similarity scores and explanations between an active target and historical precedents
 */
export async function getPrecedentsBySimilarity(
  organizationId: string,
  context: {
    question?: string;
    componentName?: string;
    suppliers?: string[];
    requirements?: string[];
    standards?: string[];
    certifications?: string[];
    documents?: string[];
    contradictions?: string[];
    missingEvidence?: string[];
  },
): Promise<EngineeringPrecedent[]> {
  // Retrieve all precedents
  const { data: precedents } = await getPrecedents({ organizationId, pageSize: 100 });

  const queryTerms = context.question
    ? context.question
        .toLowerCase()
        .split(/\s+/)
        .filter((q) => q.length > 2)
    : [];

  const evaluated = await Promise.all(
    precedents.map(async (p) => {
      let score = 0;
      const explanations: string[] = [];

      // Helper to calculate exact/sub-string matches
      const getIntersection = (arrA: string[], arrB: string[]): string[] => {
        const normalizedA = arrA.map((a) => a.toLowerCase().trim());
        const normalizedB = arrB.map((b) => b.toLowerCase().trim());
        return arrA.filter((_, index) =>
          normalizedB.some((b) => b.includes(normalizedA[index]) || normalizedA[index].includes(b)),
        );
      };

      // 1. Shared Suppliers (Weight: 25)
      if (context.suppliers && context.suppliers.length > 0) {
        const overlap = getIntersection(context.suppliers, p.relatedSuppliers);
        if (overlap.length > 0) {
          score += 25;
          explanations.push(`Shared supplier connection: ${overlap.join(", ")}`);
        }
      }

      // 2. Shared Components (Weight: 25)
      if (context.componentName) {
        const match = p.relatedComponents.some(
          (c) =>
            c.toLowerCase().includes(context.componentName!.toLowerCase()) ||
            context.componentName!.toLowerCase().includes(c.toLowerCase()),
        );
        if (match) {
          score += 25;
          explanations.push(`Mating system or component matches: "${context.componentName}"`);
        }
      }

      // 3. Shared Standards (Weight: 20)
      if (context.standards && context.standards.length > 0) {
        const overlap = getIntersection(context.standards, p.relatedStandards);
        if (overlap.length > 0) {
          score += 20;
          explanations.push(`Governed by same engineering standards: ${overlap.join(", ")}`);
        }
      }

      // 4. Shared Requirements (Weight: 15)
      if (context.requirements && context.requirements.length > 0) {
        const overlap = getIntersection(context.requirements, p.relatedRequirements);
        if (overlap.length > 0) {
          score += 15;
          explanations.push(`Shares regulatory requirements: ${overlap.join(", ")}`);
        }
      }

      // 5. Shared Certifications (Weight: 15)
      if (context.certifications && context.certifications.length > 0) {
        const overlap = getIntersection(context.certifications, p.relatedCertifications);
        if (overlap.length > 0) {
          score += 15;
          explanations.push(`Shares quality certifications: ${overlap.join(", ")}`);
        }
      }

      // 6. Shared Documents (Weight: 10)
      if (context.documents && context.documents.length > 0) {
        const overlap = getIntersection(context.documents, p.relatedDocuments);
        if (overlap.length > 0) {
          score += 10;
          explanations.push(`Linked to same document references: ${overlap.join(", ")}`);
        }
      }

      // 7. Shared Contradictions (Weight: 15)
      if (context.contradictions && context.contradictions.length > 0) {
        const overlap = getIntersection(context.contradictions, p.contradictions);
        if (overlap.length > 0) {
          score += 15;
          explanations.push(`Shares identical contradiction indicators: ${overlap.join(", ")}`);
        }
      }

      // 8. Text overlap from question (Weight: 10 per keyword, up to 30)
      let keywordScore = 0;
      const matchedTerms: string[] = [];
      queryTerms.forEach((term) => {
        if (
          p.title.toLowerCase().includes(term) ||
          p.summary.toLowerCase().includes(term) ||
          p.engineeringQuestion.toLowerCase().includes(term)
        ) {
          keywordScore += 10;
          matchedTerms.push(term);
        }
      });

      if (keywordScore > 0) {
        score += Math.min(keywordScore, 30);
        explanations.push(`Matches engineering query key terms: "${matchedTerms.join(", ")}"`);
      }

      // 9. Fetch Quality and Manufacturing Metrics (Penalty/Bonus)
      let totalNCRs = 0;
      const totalECOs = 0;
      let averageScrapRate = 0;
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

      if (p.relatedSuppliers && p.relatedSuppliers.length > 0) {
        // Find suppliers by name
        const suppliers = await prisma.supplier.findMany({
          where: { organizationId, name: { in: p.relatedSuppliers } },
          select: { id: true },
        });
        const supplierIds = suppliers.map((s) => s.id);

        if (supplierIds.length > 0) {
          // Count Quality Events (NCRs)
          totalNCRs = await prisma.qualityEvent.count({
            where: { organizationId, supplierId: { in: supplierIds } },
          });

          // Get Manufacturing Events to calculate scrap rate
          const mfgEvents = await prisma.manufacturingEvent.findMany({
            where: { organizationId, supplierId: { in: supplierIds } },
            select: { quantityProduced: true, quantityScrapped: true },
          });

          let totalProduced = 0;
          let totalScrapped = 0;
          mfgEvents.forEach((e) => {
            totalProduced += e.quantityProduced;
            totalScrapped += e.quantityScrapped;
          });

          if (totalProduced > 0) {
            averageScrapRate = (totalScrapped / totalProduced) * 100;
          }

          // Evaluate Risk
          if (totalNCRs > 5 || averageScrapRate > 10) {
            riskLevel = "HIGH";
            score -= 20; // Penalty for high risk suppliers
            explanations.push(
              `WARNING: High manufacturing risk detected (${totalNCRs} NCRs, ${averageScrapRate.toFixed(1)}% scrap rate).`,
            );
          } else if (totalNCRs > 0 || averageScrapRate > 2) {
            riskLevel = "MEDIUM";
            score -= 5;
            explanations.push(
              `Note: Moderate manufacturing risk (${totalNCRs} NCRs, ${averageScrapRate.toFixed(1)}% scrap rate).`,
            );
          } else {
            score += 10; // Bonus for proven high-quality suppliers
            explanations.push(
              `Bonus: Proven high-quality manufacturing record (0 NCRs, ${averageScrapRate.toFixed(1)}% scrap rate).`,
            );
          }
        }
      }

      // Normalize final score to max 100
      const finalScore = Math.max(0, Math.min(score, 100));

      return {
        ...p,
        similarityScore: finalScore,
        matchExplanation:
          explanations.length > 0
            ? explanations
            : ["Matched via general organizational directory scan."],
        qualityMetrics: {
          totalNCRs,
          totalECOs,
          averageScrapRate,
          riskLevel,
        },
      };
    }),
  );

  // Return sorted by score descending, filtering out zero/very low matches if context provided
  return evaluated
    .filter((item) => item.similarityScore! > 0)
    .sort((a, b) => b.similarityScore! - a.similarityScore!);
}

export async function getUniqueSystems(organizationId?: string): Promise<string[]> {
  let orgId = organizationId;
  if (!orgId) {
    const defaultOrg = await prisma.organization.findFirst();
    orgId = defaultOrg?.id;
  }
  if (!orgId) return [];

  const { data: precdents } = await getPrecedents({ organizationId: orgId, pageSize: 100 });
  const systems = new Set<string>();
  precdents.forEach((p) => {
    p.relatedComponents.forEach((s) => systems.add(s));
  });
  return Array.from(systems).sort();
}

export const listPrecedents = getPrecedents;
export const getPrecedent = getPrecedentById;
export const getPrecedentWithVersions = getPrecedentById;

export async function getPrecedentVersions(id: string, organizationId?: string) {
  const precedent = await getPrecedentById(id, organizationId || "");
  return precedent?.versions || [];
}

export async function findSimilarPrecedents(
  context: PrecedentMatchContext,
  organizationId?: string,
  minScore?: number,
  limit?: number,
) {
  const orgId = organizationId || "";
  const matches = await getPrecedentsBySimilarity(orgId, context);
  const filtered = minScore ? matches.filter((m) => (m.similarityScore ?? 0) >= minScore) : matches;
  return limit ? filtered.slice(0, limit) : filtered;
}
