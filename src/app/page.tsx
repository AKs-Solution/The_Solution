import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  GitBranch,
  Layers,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { ConsolePreview, MarketingFaq, MarketingShell } from "@/components/marketing";
import { HomeStructuredData } from "@/components/seo/structured-data";
import { FRESHNESS_LINE } from "@/features/marketing/content";
import { ContinueAsGuest } from "@/features/auth/components";

const METRICS = [
  { value: "Deterministic", label: "No generative step between record and finding" },
  { value: "Epistemic", label: "Recorded, derived, inferred, or typed gap" },
  { value: "Active", label: "Decision Sentinel watches standing decisions" },
  { value: "SHA-256", label: "Tamper-evident compliance dossier export" },
] as const;

const PROBLEMS = [
  {
    title: "The retiring engineer",
    body: "Decades of judgment leave with a person. Why a supplier was dropped, why a tolerance was tightened, which disposition held — almost none of it written down retrievably.",
  },
  {
    title: "The repeated mistake",
    body: "The precedent that would have prevented scrap, rework, or field consequence existed. It could not be found in time.",
  },
  {
    title: "The fragmentation",
    body: "Rationale scattered across PLM, ERP, quality, supplier portals, email, and spreadsheets. No system connects an engineering choice to its downstream outcome.",
  },
  {
    title: "The silent drift",
    body: "Decisions rest on specs, directives, and supplier realities that change. Invalidated assumptions are discovered by failure unless something watches.",
  },
] as const;

const PILLARS = [
  {
    title: "Memory",
    body: "The permanent record: decisions, outcomes, evidence, and the linked public failure history of the industry.",
    icon: BookOpen,
  },
  {
    title: "Reasoning",
    body: "Every claim carries an explicit evidence status. Absence is typed rather than blank. Precedent validity is computed from the records.",
    icon: Workflow,
  },
  {
    title: "Vigilance",
    body: "Standing decisions under surveillance. When a directive, field cluster, or revision touches a basis, the memory speaks unprompted.",
    icon: Radar,
  },
] as const;

const CAPABILITIES = [
  {
    title: "Searchable institutional memory",
    body: "Plain-language search across decision history. Every result traces to a source record in this organization.",
    icon: Search,
    href: "/search",
  },
  {
    title: "Industry failure graph",
    body: "Public NTSB findings, airworthiness directives, and service difficulty reports, queryable by mechanism, component, and material. Guest explorer uses this corpus when records are loaded.",
    icon: Network,
    href: "/explore",
  },
  {
    title: "Decision validation",
    body: "Validate a change against precedent. Each precedent returns a computed validity verdict: still valid, or superseded and labelled as such.",
    icon: ShieldCheck,
    href: "/precedents",
  },
  {
    title: "Manufacturing validation",
    body: "Proposed GD&T and process parameters checked against deterministic manufacturing rule groups. Results are pass, fail, or not evaluated, each citing the rule applied.",
    icon: Layers,
    href: "/drawings",
  },
  {
    title: "Decision contagion",
    body: "Traverse the relationship graph to see what a change touches: parts, programs, suppliers, and expandable source records.",
    icon: GitBranch,
    href: "/failure-graph",
  },
  {
    title: "Decision Sentinel",
    body: "Standing decisions watched against new directives, field reports, and revisions. Alerts attach the evidence span. Nothing probabilistic.",
    icon: Radar,
    href: "/sentinel",
  },
  {
    title: "Reasoning trace",
    body: "Any answer can emit its derivation: records touched, rules applied, replayable for an auditor.",
    icon: Workflow,
    href: "/reasoning",
  },
  {
    title: "Compliance export",
    body: "A tamper-evident dossier for a decision: precedent, ripple, evidence, Sentinel history, and a reproducible integrity hash.",
    icon: FileCheck2,
    href: "/compliance",
  },
] as const;

const REASONING = [
  {
    title: "Epistemic status",
    body: "Every claim carries recorded, derived, inferred, asserted, or unknown. Absence is typed and queryable.",
  },
  {
    title: "Temporal validity",
    body: "Precedent validity is computed, not stated. Later records can supersede earlier ones.",
  },
  {
    title: "Decision quality, not outcome luck",
    body: "Process is scored from records present at decision time and stored immutably. Outcomes never rewrite it.",
  },
  {
    title: "Negative knowledge",
    body: "What was considered and rejected, and recorded dissent, stays searchable. Walking away is precedent too.",
  },
  {
    title: "Counterfactual discipline",
    body: "Modeled numbers carry an assumption chain, separated from measured fact.",
  },
  {
    title: "Rules separated from evidence",
    body: "A precedent is what happened. A rule is what the engineering basis permits. Neither stands in for the other.",
  },
] as const;

const WORKFLOW = [
  {
    step: "01",
    title: "Ingest records",
    body: "Drawings, specs, and decisions become recorded inputs. New organizations start empty. Nothing is invented to fill the gap.",
  },
  {
    step: "02",
    title: "Validate against two histories",
    body: "Your decisions and the public industry graph. Manufacturing rules return pass, fail, or not evaluated.",
  },
  {
    step: "03",
    title: "Watch standing decisions",
    body: "Sentinel compares new directives, field clusters, and revisions against the basis of open decisions.",
  },
  {
    step: "04",
    title: "Export the dossier",
    body: "Reasoning trace, evidence chain, and SHA-256 integrity hash for audit and airworthiness review.",
  },
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
    body: "Section 8.3 design controls and reconstructable decision dossiers.",
  },
  {
    href: "/vs/predictive-ai",
    kicker: "Category",
    title: "vs. predictive AI",
    body: "Deterministic, not predictive. What happened, with proof, and the moment that proof stops holding.",
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
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Consecuencia by AK
          </p>
          <div className="mt-5 mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-700 shadow-xs">
            <span className="size-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            Deterministic decision intelligence for aerospace complexity
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.12] font-bold tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-6xl">
            Connect every engineering decision to its consequence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Make that link searchable, provable, permanent, and alive. The engine does not invent,
            infer from a language model, or hallucinate. Where the record is silent, it shows the
            gap as a gap.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ContinueAsGuest
              label="Launch guest explorer"
              compact
              variant="primary"
              className="inline-flex"
              buttonClassName="h-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            />
            <Link
              href="/contact"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-900 no-underline shadow-xs hover:bg-slate-50"
            >
              Contact us
            </Link>
          </div>
          <p className="mt-3 font-mono text-xs text-slate-500">
            Guest mode uses public NTSB, AD, and SDR records · New accounts start empty · No sample
            tenant data
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

        <section id="thesis" className="relative mx-auto max-w-3xl scroll-mt-24 px-6 py-20">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            The thesis
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Every field failure begins with a decision.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Someone chose a material. Approved a supplier. Signed off on a process change.
            Dispositioned a nonconforming part. Today that reasoning lives in one engineer&apos;s
            memory, a buried email thread, a spreadsheet no one can find. Consecuencia is a system
            of record, a system of reasoning, and a system that watches.
          </p>
        </section>

        <section id="problem" className="relative scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              The problem
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
              Four problems no existing system was built to solve.
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {PROBLEMS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-6"
                >
                  <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="what-it-is" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            What it is
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">
            Where PLM tracks what a part is, Consecuencia tracks why the decision was made.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PILLARS.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <item.icon className="mb-4 size-4 text-blue-600" />
                <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
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
              The product
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
              What the engineer gets.
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <section id="workflow" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <p className="text-center font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Workflow
          </p>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-slate-900">
            From record to living hypothesis.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            {WORKFLOW.map((item) => (
              <article
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <span className="font-mono text-[11px] font-semibold text-blue-700">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="reasoning"
          className="relative scroll-mt-24 border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              The reasoning layer
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
              Every claim knows its own evidence.
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {REASONING.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-6"
                >
                  <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
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
              The first domino of motion.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Explore public records as a guest, or contact us for a technical evaluation on your
              program.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ContinueAsGuest
                label="Continue as guest"
                compact
                variant="primary"
                className="inline-flex"
                buttonClassName="h-auto rounded-lg bg-blue-600 px-8 py-3.5 text-base font-medium text-white hover:bg-blue-700"
              />
              <Link
                href="/contact"
                className="rounded-lg border border-slate-700 px-6 py-3.5 text-sm font-medium text-white no-underline hover:bg-slate-800"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
