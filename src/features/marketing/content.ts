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
    question: "How is Consecuencia different from generative AI for aerospace engineering?",
    answer:
      "Generative models sample plausible language. Consecuencia evaluates recorded CAD callouts, material specs, and requirements against a closed set of physical invariants. Pass/fail outcomes are derived from those rules, not predicted. There is no generative step between measurement and conclusion, so the engine cannot hallucinate a tolerance or invent a certification path.",
  },
  {
    question: "Which CAD and specification formats can be ingested?",
    answer:
      "The verification workflow accepts PDF drawing packages, DXF and STEP geometry, and extracted GD&T callouts. Specs and quality procedures can be attached as PDF or structured text. Guest evaluation uses a public aerospace corpus; organization tenants ingest their own controlled artifacts.",
  },
  {
    question: "Is Consecuencia ready for AS9100 Rev D and FAR Part 25 evidence packages?",
    answer:
      "Yes. Design and development controls map to AS9100 Section 8.3. Equipment, systems, and installations evidence maps to FAR 25.1309. Every finding is bound to a requirement identifier, an evidence hash, and a timestamp so airworthiness and quality teams can export an audit-ready dossier instead of assembling screenshots.",
  },
  {
    question: "How is program data secured, including ITAR-controlled information?",
    answer:
      "Organization workspaces are tenant-isolated. Guest mode never sees customer artifacts—only curated public NTSB, AD, and SDR records. Enterprise Defense / OEM deployments support dedicated tenancy and air-gapped options for ITAR-controlled programs. Cryptographic evidence chains are SHA-256 hashed so exported packages can be independently verified.",
  },
  {
    question: "What does a typical evaluation and deployment path look like?",
    answer:
      "Teams start in the guest sandbox for instant browser evaluation, then run a 30-day program pilot on a bounded assembly, then move to production with Sentinel surveillance and full export dossiers. Engineering Team is seat-priced; Enterprise Defense / OEM is custom, including on-premise options.",
  },
  {
    question: "Can we run Consecuencia on-premise or in an air-gapped network?",
    answer:
      "Yes. The Engineering Team tier is a managed web workspace. Enterprise Defense / OEM includes custom tenant isolation, on-premise or air-gapped deployment, dedicated ITAR compliance guarantees, and custom DSL rule engines for program-specific invariants.",
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
