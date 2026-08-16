import { BookCheck, FileCheck2, Hash, Radar, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { ContinueAsGuest } from "@/features/auth/components";
import { MarketingShell, ProofStrip } from "@/components/marketing";
import { HomeStructuredData } from "@/components/seo/structured-data";
import { MARKETING_FAQS } from "@/features/marketing/content";

const AUDIENCES = [
  {
    title: "Chief Systems Engineers",
    body: "Bind interfaces, hazards, and design decisions into one graph. See which assumptions still hold when a supplier revision, AD, or flight deviation lands.",
  },
  {
    title: "Certification & Airworthiness Leads",
    body: "Export SHA-256 evidence chains and AS9100 Section 8.3 design-control packages instead of assembling screenshots. FAR 25.1309 findings stay tied to requirement IDs.",
  },
  {
    title: "Stress & Thermal Analysts",
    body: "Evaluate GD&T callouts, material substitutions, and envelope limits against physical invariants. Derived results never invent a load path that was not recorded.",
  },
  {
    title: "Supplier Quality Managers",
    body: "Trace incoming drawing revisions against historical NTSB, AD, and SDR failure modes. Flag aging assumptions before they become a non-conformance.",
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Ingest Blueprint & Specs",
    body: "Accept PDF drawing packages, DXF and STEP geometry, and extracted GD&T callouts. Recorded artifacts become the only inputs the engine may reason over.",
  },
  {
    step: "02",
    title: "AST Rule Evaluation & Contradiction Detection",
    body: "A closed set of physical invariants evaluates tolerances, materials, and requirements. Contradictions surface as first-class findings, not chat suggestions.",
  },
  {
    step: "03",
    title: "Sentinel Surveillance & Historical Precedent Cross-Check",
    body: "Decision Sentinel watches aging assumptions and active flight deviations, then cross-checks against a curated precedent corpus of historical failure modes.",
  },
  {
    step: "04",
    title: "Cryptographic SHA-256 Proof Minting & Audit Package Export",
    body: "Mint an immutable evidence chain and generate an AS9100-ready dossier in seconds. Independent reviewers can verify hashes without trusting the UI.",
  },
];

const STANDARDS = [
  {
    id: "AS9100 §8.3",
    title: "Design & Development Controls",
    body: "Planning, inputs, controls, outputs, and changes are bound to recorded artifacts. Design reviews leave a traceable matrix instead of a meeting note.",
  },
  {
    id: "FAR 25.1309",
    title: "Equipment, Systems & Installations",
    body: "Airworthiness evidence for installed systems stays attached to the requirement, the analysis, and the cryptographic proof that the analysis actually ran.",
  },
  {
    id: "ISO 9001",
    title: "Quality Management Alignment",
    body: "Documented information, nonconformity control, and continual improvement map onto the same evidence graph used for aerospace-specific clauses.",
  },
];

export default function Home() {
  return (
    <MarketingShell>
      <HomeStructuredData />
      <div className="px-6">
        <section className="mx-auto max-w-5xl pt-20 pb-4 text-center sm:pt-28">
          <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700">
            AS9100 Rev D & FAR Part 25 Deterministic Verification Engine
          </div>
          <h1 className="mx-auto max-w-3xl text-center text-4xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Aerospace Decision Intelligence, Grounded in Mathematical Truth.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
            Traditional AI hallucinates. Consecuencia mathematically verifies CAD tolerances,
            material substitutions, and engineering decisions with cryptographic certainty.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ContinueAsGuest
              label="Launch Mission Console — Free Guest Access"
              compact
              variant="primary"
              className="inline-flex"
              buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium w-auto h-auto shadow-sm"
            />
            <Link
              href="/demo"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 no-underline hover:bg-slate-50"
            >
              Request Guided Demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Instant browser evaluation · No credit card required · AS9100 ready
          </p>
          <ProofStrip />
        </section>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="ml-3 font-mono text-[11px] text-slate-500">
              consecuencia.app / drawings / TF-4412
            </span>
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Drawing inspection
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Turbine Flange Tolerance Check
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Rev C → Rev D · CFM56-7B fan case interface
                </p>
              </div>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs text-emerald-700">
                DERIVED
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Callout
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Requirement
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Measured
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 text-slate-800">
                    <td className="p-3.5 font-mono text-xs">Ø 412.00</td>
                    <td className="p-3.5">±0.05 mm true position</td>
                    <td className="p-3.5 font-mono">0.031 mm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                  <tr className="border-b border-slate-100 text-slate-800">
                    <td className="p-3.5 font-mono text-xs">⟂ A</td>
                    <td className="p-3.5">Perpendicularity 0.02</td>
                    <td className="p-3.5 font-mono">0.014 mm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="p-3.5 font-mono text-xs">Ra 1.6</td>
                    <td className="p-3.5">Flange face finish</td>
                    <td className="p-3.5 font-mono">1.2 µm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-20 md:grid-cols-3"
        >
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <BookCheck className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Deterministic Rule Engine</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Evaluate GD&T tolerances and material specs against 15 strict physical invariants.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <ShieldCheck className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Decision Sentinel</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Continuous surveillance on aging assumptions and active flight deviations.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <Hash className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Cryptographic Proofs</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Mint SHA-256 evidence chains and generate instant AS9100 compliance packages.
            </p>
          </article>
        </section>

        <section id="audiences" className="mx-auto max-w-5xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Built for Mission-Critical Engineering Teams
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            Consecuencia is the evaluation layer for people who sign drawings, not the chat window
            that drafts them.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {AUDIENCES.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <Users className="mb-3 size-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="mx-auto max-w-5xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            The Deterministic Verification Workflow
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            How it works: ingest recorded truth, evaluate invariants, watch assumptions, mint proof.
          </p>
          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {WORKFLOW.map((item) => (
              <li key={item.step} className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="font-mono text-xs font-semibold tracking-wider text-blue-700">
                  STEP {item.step}
                </p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="standards" className="mx-auto max-w-5xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Industry Standards & Compliance Mapping
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STANDARDS.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-6">
                <FileCheck2 className="mb-3 size-5 text-blue-600" />
                <p className="font-mono text-[11px] font-semibold text-blue-700">{item.id}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/use-cases/as9100-compliance"
              className="text-sm font-medium text-blue-600 no-underline hover:text-blue-700"
            >
              Read the AS9100 compliance use case
            </Link>
          </p>
        </section>

        <section id="docs" className="mx-auto max-w-3xl pb-16 text-center">
          <Radar className="mx-auto mb-4 size-6 text-blue-600" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Docs</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Sign in to the workspace help center for ingestion, sentinel surveillance, and
            certification package workflows — or start with the public comparison of deterministic
            verification versus generative models.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link href="/help" className="text-blue-600 no-underline hover:text-blue-700">
              Open documentation
            </Link>
            <Link
              href="/vs/predictive-ai"
              className="text-blue-600 no-underline hover:text-blue-700"
            >
              Deterministic vs. predictive AI
            </Link>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl pb-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-4">
            {MARKETING_FAQS.map((item) => (
              <article
                key={item.question}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
