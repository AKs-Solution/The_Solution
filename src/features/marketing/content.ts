export const SITE_NAME = "Consecuencia by Aᴷ";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ak-consecuencia.vercel.app";

export const DATE_PUBLISHED = "2026-01-15T00:00:00Z";
export const DATE_MODIFIED = "2026-08-16T00:00:00Z";

export const FRESHNESS_LINE = "Last updated: August 2026 · Engine v4.2.1 · AS9100 Rev D Aligned";

export const DEFAULT_TITLE =
  "Consecuencia by Aᴷ — Deterministic Decision Intelligence for Aerospace";
export const TITLE_TEMPLATE = "%s | Consecuencia by Aᴷ";

export const DEFAULT_DESCRIPTION =
  "Connect every aerospace engineering decision to its consequence. Searchable memory, computed precedent validity, manufacturing rule checks, Decision Sentinel, and SHA-256 compliance export. No generative hallucinations.";

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
      "There is no generative step between record and conclusion. Findings are anchored to stored records and deterministic rules. Where the record is silent, the product shows a typed gap. It does not invent citations.",
  },
  {
    question: "What is available on day one, before we upload our history?",
    answer:
      "Guest explorer can query public NTSB, AD, and SDR records when those tables have data. Organization accounts start empty: your decisions, drawings, and evidence are only what you record. Nothing is seeded to look busy.",
  },
  {
    question: "Which product capabilities are in the live workspace?",
    answer:
      "Searchable memory, industry failure graph, decision and manufacturing validation, contagion / relationship graph, Decision Sentinel, reasoning traces, compliance export with integrity hash, epistemic status, negative knowledge, and org invites. Air-gapped OEM tenancy is an Enterprise evaluation path, not a self-serve installer in this web app.",
  },
  {
    question: "How is epistemic status calculated?",
    answer:
      "RECORDED is an ingested artifact. DERIVED is a deterministic rule result over recorded inputs. INFERRED is a bounded graph conclusion that still cites its premises. UNKNOWN / GAP is a missing required input. Status is never sampled from a language model.",
  },
  {
    question: "Where do contact and complaints go?",
    answer:
      "Product interest, waitlist, and contact requests go to ak.consecuencia@gmail.com. Complaints, support tickets, and customer-care submissions go to customercare.consecuencia@outlook.com.",
  },
  {
    question: "How does guest mode differ from a signed-in organization?",
    answer:
      "Guest mode is a browser session on public records, with no credit card, ending when the browser closes. A registered organization is empty until you ingest and decide. Team features include invites, Sentinel on your decisions, and SHA-256 dossiers.",
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
