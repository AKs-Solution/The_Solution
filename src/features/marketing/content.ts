export const SITE_NAME = "Consecuencia by AK";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ak-consecuencia.vercel.app";

export const DATE_PUBLISHED = "2026-01-15T00:00:00Z";
export const DATE_MODIFIED = "2026-08-16T00:00:00Z";

export const FRESHNESS_LINE =
  "Last updated: August 2026 · Deterministic Engine v4.2.1 · AS9100 Rev D Aligned";

export const DEFAULT_TITLE = "Consecuencia — Deterministic Verification for Aerospace Engineering";
export const TITLE_TEMPLATE = "%s | Consecuencia — Aerospace Decision Intelligence";

export const DEFAULT_DESCRIPTION =
  "Mathematically verify CAD tolerances, material substitutions, and engineering decisions with cryptographic certainty. AS9100 Rev D & FAR Part 25 audit-ready.";

export const SEO_KEYWORDS = [
  "aerospace verification software",
  "deterministic engineering verification",
  "AS9100 compliance software",
  "FAR Part 25 verification",
  "GD&T tolerance analysis",
  "systems engineering traceability",
  "immutable audit trail",
  "aerospace decision intelligence",
];

export const MARKETING_FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "How does Consecuencia prevent generative AI hallucinations?",
    answer:
      "There is no generative step between measurement and conclusion. Recorded CAD callouts, material specs, and requirements are evaluated against a closed set of physical invariants. Pass/fail is derived from those rules, so the engine cannot invent a tolerance or a certification path.",
  },
  {
    question: "What CAD file formats are currently supported for ingestion?",
    answer:
      "PDF drawing packages, DXF and STEP geometry, and extracted GD&T callouts. Quality procedures can be attached as PDF or structured text. Guest evaluation uses the public aerospace corpus; organization tenants ingest their own controlled artifacts.",
  },
  {
    question: "Can this software be deployed in air-gapped / on-premise environments?",
    answer:
      "Yes. Engineering Team is a managed web workspace. Enterprise Defense / OEM includes custom tenant isolation, on-premise or air-gapped deployment, dedicated ITAR compliance guarantees, and custom DSL rule engines.",
  },
  {
    question: "How is epistemic certainty (RECORDED, DERIVED, INFERRED, UNKNOWN) calculated?",
    answer:
      "RECORDED is an ingested artifact. DERIVED is a deterministic rule result over recorded inputs. INFERRED is a bounded graph conclusion that still cites its premises. UNKNOWN / GAP is a missing required input. Status is never sampled from a language model.",
  },
  {
    question: "What compliance standards are built into the automated reporting?",
    answer:
      "AS9100 Rev D Section 8.3 design and development controls, FAR 25.1309 equipment, systems, and installations, and ISO 9001 documented-information alignment. Reports bind findings to requirement IDs, timestamps, and SHA-256 evidence hashes.",
  },
  {
    question: "How does the guest sandbox differ from full enterprise deployment?",
    answer:
      "Guest mode is instant browser evaluation on public NTSB, AD, and SDR records, with no credit card and a session that ends when the browser closes. Enterprise adds tenant isolation, private CAD ingest, Sentinel surveillance, export dossiers, and optional air-gapped deployment.",
  },
];

export const ENGINEERING_ROLES = [
  { value: "chief_engineer", label: "Chief Engineer" },
  { value: "systems_architect", label: "Systems Architect" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "stress_structural", label: "Stress/Structural Engineer" },
  { value: "other", label: "Other" },
] as const;

export type EngineeringRole = (typeof ENGINEERING_ROLES)[number]["value"];
