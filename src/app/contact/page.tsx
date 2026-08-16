import type { Metadata } from "next";
import { DemoInquiryForm, CustomerCareForm, MarketingShell } from "@/components/marketing";
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
            <li>Product interest and evaluation requests</li>
            <li>Decision Sentinel and industry-graph walkthrough</li>
            <li>Complaints and support via the customer-care form</li>
          </ul>
        </div>
        <div className="space-y-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Product interest</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Request a technical evaluation. Use a work or agency email.
            </p>
            <DemoInquiryForm />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">Customer care</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Complaints, support tickets, and product feedback.
            </p>
            <CustomerCareForm />
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
