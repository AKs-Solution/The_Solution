export type PublicRecordKind = "NTSB" | "AD" | "SDR" | "COMPONENT" | "DIRECTIVE" | "FINDING";

export interface PublicAerospaceRecord {
  id: string;
  kind: PublicRecordKind;
  title: string;
  identifier: string;
  summary: string;
  source: string;
  issuedAt: string;
  href: string;
  entityType: string;
  status: "RECORDED";
}

export interface PublicGraphNode {
  id: string;
  entityId: string;
  label: string;
  entityType: string;
  status: string;
  identifier: string;
}

export interface PublicGraphEdge {
  id: string;
  relationshipType: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNode: { id: string; entityId: string; label: string; entityType: string };
  targetNode: { id: string; entityId: string; label: string; entityType: string };
}

const RECORDS: PublicAerospaceRecord[] = [
  {
    id: "pub-ntsb-aar-09-01",
    kind: "NTSB",
    title: "NTSB AAR-09/01 — US Airways 1549 Hudson ditching",
    identifier: "NTSB/AAR-09/01",
    summary:
      "Loss of thrust in both engines after bird ingestion. Evidence chain traces flock strike, engine certification bird-ingestion envelope, and crew decision to ditch.",
    source: "National Transportation Safety Board (public docket)",
    issuedAt: "2010-05-04",
    href: "/explore?record=pub-ntsb-aar-09-01",
    entityType: "INVESTIGATION",
    status: "RECORDED",
  },
  {
    id: "pub-ntsb-aar-19-03",
    kind: "NTSB",
    title: "NTSB AAR-19/03 — Southwest 1380 uncontained fan blade",
    identifier: "NTSB/AAR-19/03",
    summary:
      "CFM56-7B fan blade outboard failure from a subsurface fatigue crack. Links inspection interval, blade lot, and cabin decompression from window fracture.",
    source: "National Transportation Safety Board (public docket)",
    issuedAt: "2019-11-19",
    href: "/explore?record=pub-ntsb-aar-19-03",
    entityType: "INVESTIGATION",
    status: "RECORDED",
  },
  {
    id: "pub-ad-2018-09-51",
    kind: "AD",
    title: "FAA AD 2018-09-51 — CFM56-7B fan blade inspection",
    identifier: "AD 2018-09-51",
    summary:
      "Emergency airworthiness directive requiring ultrasonic inspection of CFM56-7B fan blades after uncontained failure evidence from public accident investigation.",
    source: "Federal Aviation Administration (public AD library)",
    issuedAt: "2018-04-20",
    href: "/explore?record=pub-ad-2018-09-51",
    entityType: "DIRECTIVE",
    status: "RECORDED",
  },
  {
    id: "pub-ad-2020-03-20",
    kind: "AD",
    title: "FAA AD 2020-03-20 — 737 MAX flight control software",
    identifier: "AD 2020-03-20",
    summary:
      "Airworthiness directive addressing MCAS architecture, dual-AOA disagree, and crew alerting. Derived from public accident dockets, not operator private data.",
    source: "Federal Aviation Administration (public AD library)",
    issuedAt: "2020-11-18",
    href: "/explore?record=pub-ad-2020-03-20",
    entityType: "DIRECTIVE",
    status: "RECORDED",
  },
  {
    id: "pub-sdr-cfm56-fan",
    kind: "SDR",
    title: "Service difficulty — CFM56 fan blade crack indications",
    identifier: "SDR-CFM56-FB-2018",
    summary:
      "Aggregated public service-difficulty pattern: ultrasonic indications on fan blades in a defined cycle band, used as recorded evidence for inspection interval tightening.",
    source: "FAA Service Difficulty Reporting (public extracts)",
    issuedAt: "2018-03-12",
    href: "/explore?record=pub-sdr-cfm56-fan",
    entityType: "SERVICE_DIFFICULTY",
    status: "RECORDED",
  },
  {
    id: "pub-comp-cfm56-7b",
    kind: "COMPONENT",
    title: "CFM56-7B turbofan — fan module",
    identifier: "CFM56-7B",
    summary:
      "Public type-certificate data for the CFM56-7B fan module, including bird-ingestion and blade-out containment requirements cited by NTSB and ADs.",
    source: "Type certificate data sheet (public)",
    issuedAt: "1996-12-19",
    href: "/explore?record=pub-comp-cfm56-7b",
    entityType: "COMPONENT",
    status: "RECORDED",
  },
  {
    id: "pub-comp-ge90",
    kind: "COMPONENT",
    title: "GE90 fan blade — composite spar architecture",
    identifier: "GE90-FAN",
    summary:
      "Public certification basis for wide-chord composite fan blades, used to contrast inspection methods against metallic fan-blade fatigue cases.",
    source: "Type certificate data sheet (public)",
    issuedAt: "1995-02-02",
    href: "/explore?record=pub-comp-ge90",
    entityType: "COMPONENT",
    status: "RECORDED",
  },
  {
    id: "pub-finding-aoa",
    kind: "FINDING",
    title: "Finding — single AOA input to MCAS was a recorded design constraint",
    identifier: "FINDING-AOA-MCAS",
    summary:
      "Public accident reports record that MCAS originally used a single angle-of-attack vane. The evidence chain is deterministic: architecture → disagree alerting gap → crew procedure load.",
    source: "NTSB and Joint Authorities Technical Review (public)",
    issuedAt: "2019-10-11",
    href: "/explore?record=pub-finding-aoa",
    entityType: "FINDING",
    status: "RECORDED",
  },
];

const NODES: PublicGraphNode[] = RECORDS.map((record) => ({
  id: `node-${record.id}`,
  entityId: record.id,
  label: record.title,
  entityType: record.entityType,
  status: record.status,
  identifier: record.identifier,
}));

function edge(id: string, type: string, source: string, target: string): PublicGraphEdge {
  const sourceNode = NODES.find((n) => n.entityId === source)!;
  const targetNode = NODES.find((n) => n.entityId === target)!;
  return {
    id,
    relationshipType: type,
    sourceNodeId: sourceNode.id,
    targetNodeId: targetNode.id,
    sourceNode: {
      id: sourceNode.id,
      entityId: sourceNode.entityId,
      label: sourceNode.label,
      entityType: sourceNode.entityType,
    },
    targetNode: {
      id: targetNode.id,
      entityId: targetNode.entityId,
      label: targetNode.label,
      entityType: targetNode.entityType,
    },
  };
}

const EDGES: PublicGraphEdge[] = [
  edge("e1", "CAUSED_BY", "pub-ntsb-aar-19-03", "pub-comp-cfm56-7b"),
  edge("e2", "GOVERNED_BY", "pub-comp-cfm56-7b", "pub-ad-2018-09-51"),
  edge("e3", "DERIVED_FROM", "pub-ad-2018-09-51", "pub-ntsb-aar-19-03"),
  edge("e4", "VERIFIED_BY", "pub-ad-2018-09-51", "pub-sdr-cfm56-fan"),
  edge("e5", "ASSOCIATED_WITH", "pub-sdr-cfm56-fan", "pub-comp-cfm56-7b"),
  edge("e6", "JUSTIFIED_BY", "pub-ad-2020-03-20", "pub-finding-aoa"),
  edge("e7", "AFFECTS", "pub-finding-aoa", "pub-ad-2020-03-20"),
  edge("e8", "ASSOCIATED_WITH", "pub-ntsb-aar-09-01", "pub-comp-cfm56-7b"),
];

export function listPublicRecords(): PublicAerospaceRecord[] {
  return RECORDS;
}

export function getPublicRecord(id: string): PublicAerospaceRecord | undefined {
  return RECORDS.find((record) => record.id === id);
}

export function searchPublicCorpus(query: string, limit = 20): PublicAerospaceRecord[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return RECORDS.filter((record) => {
    const haystack =
      `${record.title} ${record.identifier} ${record.summary} ${record.kind} ${record.source}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);
}

export function getPublicSubgraph(entityType?: string, limit = 100) {
  const nodes = NODES.filter((node) => (entityType ? node.entityType === entityType : true)).slice(
    0,
    limit,
  );
  const ids = new Set(nodes.map((node) => node.id));
  const edges = EDGES.filter((item) => ids.has(item.sourceNodeId) || ids.has(item.targetNodeId));
  return { nodes, edges };
}

export function getPublicGraphStats() {
  return { nodes: NODES.length, edges: EDGES.length };
}

export function getPublicEvidenceChain(entityId: string) {
  const record = getPublicRecord(entityId);
  if (!record) return null;
  const related = EDGES.filter(
    (item) => item.sourceNode.entityId === entityId || item.targetNode.entityId === entityId,
  );
  return {
    rootId: entityId,
    totalDepth: related.length > 0 ? 2 : 1,
    links: related.map((item, index) => ({
      nodeId: item.id,
      relationType: item.relationshipType,
      depth: index + 1,
      node: {
        id:
          item.targetNode.entityId === entityId
            ? item.sourceNode.entityId
            : item.targetNode.entityId,
        type: "EVIDENCE",
        label:
          item.targetNode.entityId === entityId ? item.sourceNode.label : item.targetNode.label,
        entityId:
          item.targetNode.entityId === entityId
            ? item.sourceNode.entityId
            : item.targetNode.entityId,
        entityType:
          item.targetNode.entityId === entityId
            ? item.sourceNode.entityType
            : item.targetNode.entityType,
        status: "RECORDED",
        createdAt: record.issuedAt,
        updatedAt: record.issuedAt,
      },
    })),
  };
}

export function searchPublicReasoning(query: string) {
  const matches = searchPublicCorpus(query, 8);
  return {
    query,
    mode: "deterministic",
    explanation:
      "Results are produced by exact and substring match over recorded public identifiers, titles, and docket text. No generative model is used to invent citations.",
    matches: matches.map((record) => ({
      id: record.id,
      title: record.title,
      identifier: record.identifier,
      kind: record.kind,
      epistemicStatus: "RECORDED",
      source: record.source,
      href: record.href,
      why: `Matched public ${record.kind} record ${record.identifier}.`,
    })),
  };
}

export function mapRecordToSearchHit(record: PublicAerospaceRecord) {
  return {
    id: record.id,
    type: record.kind === "COMPONENT" ? "entity" : "document",
    label: record.title,
    subtitle: `${record.kind} · ${record.identifier} · ${record.source}`,
    href: record.href,
    icon: record.kind === "COMPONENT" ? "Tags" : "FileText",
  };
}
