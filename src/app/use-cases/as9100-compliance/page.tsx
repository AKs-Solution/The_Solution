import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing";
import { StructuredData } from "@/components/seo/structured-data";
import { DATE_MODIFIED, DATE_PUBLISHED, FRESHNESS_LINE } from "@/features/marketing/content";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "AS9100 Compliance Software for Design Controls",
  "Automated AS9100 Rev D audit readiness: Section 8.3 design and development controls, traceability matrices, and SHA-256 evidence packages.",
  "/use-cases/as9100-compliance",
);

export default function As9100UseCasePage() {
  return (
    <MarketingShell>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "AS9100 Rev D automated compliance audit readiness",
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_MODIFIED,
        }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
          Use case
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Automated AS9100 audit readiness and traceability matrices.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Quality organizations should not reconstruct design-control evidence the week before an
          audit. Consecuencia mints the matrix as the work happens.
        </p>
        <h2 className="mt-12 text-xl font-semibold text-slate-900">
          Section 8.3 design & development
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Planning, inputs, controls, outputs, and changes are bound to recorded drawings, specs,
          and decisions. Each derived finding cites the invariant that produced it. There is no
          generative narrative standing in for a missing control.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-slate-900">
          Traceability in under 30 seconds
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Export an AS9100-aligned package with cryptographic hashes. Independent reviewers can
          verify that the dossier matches the engine run, not a later edit.
        </p>
        <p className="mt-10 text-sm">
          <Link
            href="/pricing"
            className="font-medium text-blue-600 no-underline hover:text-blue-700"
          >
            See evaluation tiers
          </Link>
        </p>
        <p className="mt-16 font-mono text-[11px] text-slate-400">{FRESHNESS_LINE}</p>
      </article>
    </MarketingShell>
  );
}
