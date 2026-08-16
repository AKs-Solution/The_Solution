import {
  ArrowRight,
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
import { FRESHNESS_LINE } from "@/features/marketing/content";
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
    title: "Ingest Specs",
    body: "PDF specs, STEP/DXF CAD blueprints, and extracted GD&T callouts become recorded inputs. Nothing else enters the evaluation.",
    icon: Layers,
  },
  {
    step: "02",
    title: "AST Physics Verification",
    body: "AST evaluation across 15 deterministic manufacturing rules. Contradictions are findings, not chat suggestions.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Sentinel Surveillance",
    body: "Real-time surveillance cross-referenced against NTSB records and FAA airworthiness directives.",
    icon: Radar,
  },
  {
    step: "04",
    title: "Cryptographic Dossier Minting",
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
    title: "Cryptographic Compliance Ledger",
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

const COMPLIANCE = [
  {
    std: "AS9100 Rev D",
    clause: "§8.3",
    note: "Design and development controls, recorded evidence",
  },
  {
    std: "FAR 25.1309",
    clause: "§25.1309",
    note: "Equipment, systems, and installations safety assessment",
  },
  { std: "ISO 9001", clause: "§7.5", note: "Documented information with cryptographic integrity" },
] as const;

const USE_CASES = [
  {
    href: "/use-cases/flight-systems",
    kicker: "Installed systems",
    title: "Flight systems",
    body: "Interface dependency risk and FAR 25.1309 evidence for installed systems.",
  },
  {
    href: "/use-cases/as9100-compliance",
    kicker: "Quality system",
    title: "AS9100 compliance",
    body: "Section 8.3 design controls and automated traceability matrices.",
  },
  {
    href: "/vs/predictive-ai",
    kicker: "Category",
    title: "vs. predictive AI",
    body: "Why deterministic verification is not a generative model with a better prompt.",
  },
] as const;

export default function Home() {
  return (
    <MarketingShell>
      <HomeStructuredData />
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_58%)]"
        />

        <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-6 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-700 shadow-xs">
            <span className="size-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            AS9100 Rev D & FAR Part 25 Deterministic Verification Engine
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.12] font-bold tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-6xl">
            Aerospace Decision Intelligence, Grounded in Mathematical Truth.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Traditional AI hallucinates. Consecuencia mathematically verifies CAD tolerances,
            material substitutions, and engineering decisions with cryptographic certainty.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ContinueAsGuest
              label="Launch Mission Console — Free Guest Access →"
              compact
              variant="primary"
              className="inline-flex"
              buttonClassName="h-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            />
            <Link
              href="/demo"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-900 no-underline shadow-xs hover:bg-slate-50"
            >
              Schedule Technical Evaluation
            </Link>
          </div>
          <p className="mt-3 font-mono text-xs text-slate-500">
            Instant browser evaluation · No credit card required · AS9100 ready
          </p>
        </section>

        <div className="relative mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-4">
          {METRICS.map((item) => (
            <div key={item.value} className="bg-white px-4 py-5 text-center">
              <p className="font-mono text-sm font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="relative px-6">
          <ConsolePreview />
        </div>

        <section id="workflow" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <p className="text-center font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Workflow
          </p>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-slate-900">
            How deterministic verification works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            Ingest specs, verify physics, watch assumptions, mint the dossier.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            {WORKFLOW.map((item) => (
              <article
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="mb-4 flex items-center justify-between">
                  <item.icon className="size-4 text-slate-400" />
                  <span className="font-mono text-[11px] font-semibold text-slate-400">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="capabilities"
          className="relative scroll-mt-24 border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Capabilities
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
              The verification surface, not a chatbot.
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {CAPABILITIES.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <item.icon className="mb-4 size-4 text-slate-500" />
                  <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="compliance" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Compliance
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
            Bound to the clauses reviewers already cite.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            AS9100 Rev D Section 8.3, FAR 25.1309, and ISO 9001 documented information — requirement
            IDs plus cryptographic proofs.
          </p>
          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Standard
                  </th>
                  <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Clause
                  </th>
                  <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Mapping
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE.map((row) => (
                  <tr key={row.std} className="border-b border-slate-100 last:border-0">
                    <td className="p-3.5 font-medium text-slate-900">{row.std}</td>
                    <td className="p-3.5 font-mono text-xs text-slate-600">{row.clause}</td>
                    <td className="p-3.5 text-slate-500">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="use-cases"
          className="relative scroll-mt-24 border-t border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Use cases
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Where programs start.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {USE_CASES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-6 no-underline transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <p className="font-mono text-[11px] tracking-wider text-slate-400 uppercase">
                    {item.kicker}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{item.body}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                    Read
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-24 px-6 py-24">
          <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-900">
            Frequently asked questions
          </h2>
          <MarketingFaq />
          <p className="mt-10 text-center font-mono text-xs text-slate-500">{FRESHNESS_LINE}</p>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-2xl bg-slate-900 px-8 py-14 text-center text-white sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Eliminate unverified assumptions from your flight systems.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Replace probabilistic guesswork with a recorded evaluation and an inspectable evidence
              chain.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ContinueAsGuest
                label="Launch Guest Sandbox Now"
                compact
                variant="primary"
                className="inline-flex"
                buttonClassName="h-auto rounded-lg bg-blue-600 px-8 py-3.5 text-base font-medium text-white hover:bg-blue-700"
              />
              <Link
                href="/pricing"
                className="rounded-lg border border-slate-700 px-6 py-3.5 text-sm font-medium text-white no-underline hover:bg-slate-800"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
