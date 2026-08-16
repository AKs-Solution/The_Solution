import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing";
import { StructuredData } from "@/components/seo/structured-data";
import { DATE_MODIFIED, DATE_PUBLISHED, FRESHNESS_LINE } from "@/features/marketing/content";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "Flight Systems Verification & Dependency Risk",
  "Systems engineering verification for flight systems: interface dependency risk, assumption aging, and FAR 25.1309-aligned evidence chains.",
  "/use-cases/flight-systems",
);

export default function FlightSystemsUseCasePage() {
  return (
    <MarketingShell>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Flight systems engineering verification",
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_MODIFIED,
        }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
          Use case
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Systems engineering verification for flight systems.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Flight systems fail at interfaces: a sensor envelope, a supplier revision, an assumption
          that aged past its evidence. Consecuencia maps those dependencies and evaluates them
          deterministically.
        </p>
        <h2 className="mt-12 text-xl font-semibold text-slate-900">Dependency risk analysis</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Recorded ICD items, drawing callouts, and hazard controls become graph nodes. When a
          revision lands, Sentinel shows which decisions still hold and which now contradict a
          physical invariant or a historical failure mode.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-slate-900">Airworthiness evidence</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          FAR 25.1309 findings stay attached to the installed system, the analysis that ran, and a
          SHA-256 evidence chain. Certification leads export a package instead of reconstructing the
          argument from email.
        </p>
        <p className="mt-10 text-sm">
          <Link href="/demo" className="font-medium text-blue-600 no-underline hover:text-blue-700">
            Request a flight-systems evaluation
          </Link>
        </p>
        <p className="mt-16 font-mono text-[11px] text-slate-400">{FRESHNESS_LINE}</p>
      </article>
    </MarketingShell>
  );
}
