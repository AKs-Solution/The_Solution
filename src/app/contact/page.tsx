import type { Metadata } from "next";
import { DemoInquiryForm, MarketingShell } from "@/components/marketing";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "Contact Enterprise Engineering",
  "Contact Consecuencia for OEM and defense evaluation: tenant isolation, air-gapped deployment, and AS9100-ready deterministic verification.",
  "/contact",
);

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Enterprise contact
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Request a technical evaluation.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Use a work or agency email. Consumer inboxes are rejected so program security reviews
            stay on corporate channels.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600">
            <li>Live CAD drawing GD&T risk evaluation</li>
            <li>Decision Sentinel surveillance demo</li>
            <li>SHA-256 compliance package export</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
          <DemoInquiryForm />
        </div>
      </div>
    </MarketingShell>
  );
}
