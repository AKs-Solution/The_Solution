import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing";
import { StructuredData } from "@/components/seo/structured-data";
import { DATE_MODIFIED, DATE_PUBLISHED, FRESHNESS_LINE } from "@/features/marketing/content";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "Deterministic Verification vs. Generative LLMs in Aviation",
  "Comparison matrix: deterministic aerospace verification versus predictive and generative AI for mission-critical CAD, GD&T, and certification evidence.",
  "/vs/predictive-ai",
);

const ROWS: ReadonlyArray<{ criterion: string; deterministic: string; generative: string }> = [
  {
    criterion: "Source of a finding",
    deterministic: "Closed physical invariants over recorded artifacts",
    generative: "Sampled language conditioned on training data and prompts",
  },
  {
    criterion: "Hallucination risk",
    deterministic: "Zero generative steps between measurement and conclusion",
    generative: "Can invent tolerances, citations, and certification paths",
  },
  {
    criterion: "GD&T / CAD evaluation",
    deterministic: "Callouts evaluated against recorded geometry and specs",
    generative: "Describes drawings; does not prove a tolerance stack",
  },
  {
    criterion: "Audit evidence",
    deterministic: "SHA-256 evidence chain, requirement IDs, replayable run",
    generative: "Chat logs and screenshots; not independently verifiable",
  },
  {
    criterion: "AS9100 / FAR 25.1309",
    deterministic: "Mapped controls and airworthiness bindings",
    generative: "Narrative assistance only; not a quality-system control",
  },
  {
    criterion: "Failure-mode memory",
    deterministic: "Curated NTSB / AD / SDR precedent graph",
    generative: "May recall, omit, or fabricate accident details",
  },
];

export default function VsPredictiveAiPage() {
  return (
    <MarketingShell>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Deterministic verification vs. generative LLMs in mission-critical aviation",
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_MODIFIED,
        }}
      />
      <article className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
          Comparison
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Deterministic verification vs. generative LLMs in mission-critical aviation.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
          Predictive models are useful for drafting. They are not a substitute for a verification
          engine that must be wrong in a known, inspectable way — or not at all.
        </p>

        <div className="mt-12 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Criterion
                </th>
                <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Consecuencia (deterministic)
                </th>
                <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Generative / predictive AI
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.criterion} className="border-b border-slate-100 last:border-0">
                  <td className="p-3.5 font-medium text-slate-900">{row.criterion}</td>
                  <td className="p-3.5 text-slate-700">{row.deterministic}</td>
                  <td className="p-3.5 text-slate-500">{row.generative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/demo" className="font-medium text-blue-600 no-underline hover:text-blue-700">
            Request a guided comparison on your program
          </Link>
        </p>
        <p className="mt-16 font-mono text-[11px] text-slate-400">{FRESHNESS_LINE}</p>
      </article>
    </MarketingShell>
  );
}
