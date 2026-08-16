import type { Metadata } from "next";
import Link from "next/link";
import { DemoInquiryForm, MarketingShell } from "@/components/marketing";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "Request a Guided Technical Evaluation",
  "Schedule a 20-minute aerospace evaluation: live CAD GD&T risk, Decision Sentinel surveillance, and SHA-256 AS9100 package export.",
  "/demo",
);

const AGENDA = [
  "Live CAD drawing GD&T risk evaluation",
  "Decision Sentinel surveillance demo",
  "SHA-256 compliance package export",
];

export default function DemoPage() {
  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Technical evaluation
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Talk to an aerospace engineer.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A 20-minute working session on your program class — not a slide tour. Bring a drawing
            package or use our public corpus.
          </p>
          <h2 className="mt-10 text-sm font-semibold tracking-wide text-slate-900 uppercase">
            What you will see in this 20-minute technical evaluation
          </h2>
          <ol className="mt-4 space-y-3">
            {AGENDA.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                <span className="font-mono text-xs font-semibold text-blue-700">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-slate-500">
            Prefer to explore first?{" "}
            <Link href="/" className="font-medium text-blue-600 no-underline hover:text-blue-700">
              Launch guest access from the homepage
            </Link>
            .
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
          <DemoInquiryForm />
        </div>
      </div>
    </MarketingShell>
  );
}
