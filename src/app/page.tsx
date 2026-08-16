import {
  FileCheck2,
  GitBranch,
  Layers,
  Lock,
  Network,
  Radar,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { ConsolePreview, MarketingFaq, MarketingShell } from "@/components/marketing";
import { HomeStructuredData } from "@/components/seo/structured-data";
import { ContinueAsGuest } from "@/features/auth/components";

const METRICS = [
  { value: "100% Deterministic", label: "Zero Generative Hallucinations" },
  { value: "< 30s Traceability", label: "Full AS9100 Matrix Generation" },
  { value: "500+ NTSB Precedents", label: "Live Failure Mode Cross-Checking" },
  { value: "SHA-256 Verified", label: "Cryptographic Evidence Chains" },
] as const;

const WORKFLOW = [
  {
    step: "01",
    title: "Ingestion & Parsing",
    body: "PDF specs, STEP/DXF CAD blueprints, and extracted GD&T callouts become recorded inputs. Nothing else enters the evaluation.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Invariant & Physics Rules",
    body: "AST evaluation across 15 deterministic manufacturing rules. Contradictions are findings, not chat suggestions.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Decision Sentinel & Precedents",
    body: "Real-time surveillance cross-referenced against NTSB records and FAA airworthiness directives.",
    icon: Radar,
  },
  {
    step: "04",
    title: "Immutable Certification",
    body: "Minted SHA-256 evidence chain and instant audit dossier export for airworthiness review.",
    icon: FileCheck2,
  },
] as const;

const CAPABILITIES = [
  {
    title: "CAD Tolerance & Producibility Risk Engine",
    body: "Evaluate GD&T callouts, stack-ups, and material substitutions against physical invariants before a drawing leaves the program.",
    icon: Layers,
  },
  {
    title: "Decision Sentinel & Aging Assumption Monitor",
    body: "Watch active flight deviations and assumptions that have outlived their evidence. Alert before they become a non-conformance.",
    icon: Radar,
  },
  {
    title: "Cross-Program Contagion Ripple Graph",
    body: "See which interfaces, suppliers, and decisions inherit a change when a revision or AD lands on a related assembly.",
    icon: GitBranch,
  },
  {
    title: "Cryptographic Compliance Ledger (FAR 25.1309 / AS9100)",
    body: "Bind every derived finding to a requirement ID, timestamp, and SHA-256 hash. Export an inspectable dossier, not a screenshot pack.",
    icon: ShieldCheck,
  },
  {
    title: "Airworthiness Precedent Knowledge Graph",
    body: "Cross-check current design intent against a curated graph of historical failure modes, ADs, and SDR patterns.",
    icon: Network,
  },
  {
    title: "Air-Gapped & Defense-Grade Data Isolation",
    body: "Tenant isolation by default. Enterprise Defense / OEM adds on-premise and air-gapped options for ITAR-controlled programs.",
    icon: Lock,
  },
] as const;

const USE_CASES = [
  {
    href: "/use-cases/flight-systems",
    title: "Flight systems",
    body: "Interface dependency risk and FAR 25.1309 evidence for installed systems.",
  },
  {
    href: "/use-cases/as9100-compliance",
    title: "AS9100 compliance",
    body: "Section 8.3 design controls and automated traceability matrices.",
  },
  {
    href: "/vs/predictive-ai",
    title: "vs. predictive AI",
    body: "Why deterministic verification is not a generative model with a better prompt.",
  },
] as const;

export default function Home() {
  return (
    <MarketingShell>
      <HomeStructuredData />
      <div className="px-6">
        <section className="mx-auto max-w-5xl pt-20 pb-4 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-blue-600" />
            </span>
            AS9100 Rev D & FAR Part 25 Deterministic Verification Engine
          </div>
          <h1 className="mx-auto max-w-4xl text-center text-4xl leading-[1.15] font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Aerospace Decision Intelligence, Grounded in Mathematical Truth.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
            Traditional AI hallucinates. Consecuencia mathematically verifies CAD tolerances,
            material substitutions, and engineering decisions with cryptographic certainty.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ContinueAsGuest
              label="Launch Mission Console — Free Guest Access →"
              compact
              variant="primary"
              className="inline-flex"
              buttonClassName="h-auto w-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            />
            <Link
              href="/demo"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-900 no-underline hover:bg-slate-50"
            >
              Schedule Technical Evaluation
            </Link>
          </div>
          <p className="mt-3 text-center font-mono text-xs text-slate-500">
            Instant browser evaluation · No credit card required · AS9100 ready
          </p>
        </section>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-6 rounded-lg border-y border-slate-200/80 bg-white/50 px-4 py-6 text-center md:grid-cols-4">
          {METRICS.map((item) => (
            <div key={item.value}>
              <p className="font-mono text-sm font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <ConsolePreview />

        <section id="workflow" className="mx-auto max-w-6xl py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            How Deterministic Verification Works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            From engineering specification to airworthiness certificate.
          </p>
          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-4">
            {WORKFLOW.map((item) => (
              <article
                key={item.step}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs"
              >
                <item.icon className="mb-3 size-5 text-blue-600" />
                <p className="font-mono text-[11px] font-semibold tracking-wider text-blue-700">
                  STEP {item.step}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-6xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Core capabilities
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <item.icon className="mb-4 size-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="compliance" className="mx-auto max-w-5xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Compliance mapping
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            AS9100 Rev D Section 8.3, FAR 25.1309, and ISO 9001 documented information — bound to
            requirement IDs and cryptographic proofs.
          </p>
          <p className="mt-6 text-center text-sm">
            <Link
              href="/use-cases/as9100-compliance"
              className="font-medium text-blue-600 no-underline hover:text-blue-700"
            >
              Read the AS9100 compliance use case
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href="/help"
              className="font-medium text-blue-600 no-underline hover:text-blue-700"
            >
              Open documentation
            </Link>
          </p>
        </section>

        <section id="use-cases" className="mx-auto max-w-5xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Use cases
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {USE_CASES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white p-6 no-underline shadow-xs hover:border-slate-300"
              >
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl pb-8">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Frequently asked questions
          </h2>
          <MarketingFaq />
          <p className="mt-12 text-center font-mono text-xs text-slate-500">
            Last updated: August 2026 · Engine v4.2.1 · AS9100 Rev D Aligned
          </p>
        </section>

        <section className="mx-auto my-20 max-w-5xl rounded-2xl bg-slate-900 p-10 text-center text-white shadow-lg">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Eliminate Unverified Assumptions from Your Flight Systems.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Join leading engineering teams replacing probabilistic guesswork with mathematical
            certainty.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ContinueAsGuest
              label="Launch Guest Sandbox Now"
              compact
              variant="primary"
              className="inline-flex"
              buttonClassName="h-auto w-auto rounded-lg bg-blue-600 px-8 py-3.5 text-base font-medium text-white hover:bg-blue-500"
            />
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-600 px-6 py-3.5 text-sm font-medium text-white no-underline hover:bg-slate-800"
            >
              View pricing
            </Link>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
