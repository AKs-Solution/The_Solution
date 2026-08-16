import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing";
import { pageMetadata } from "@/features/marketing/metadata";

export const metadata: Metadata = pageMetadata(
  "Pricing — Evaluation, Team, and Enterprise Defense",
  "Clear aerospace buying path: free guest sandbox, Engineering Team seats, and Enterprise Defense / OEM with air-gapped and ITAR options.",
  "/pricing",
);

const TIERS = [
  {
    name: "Evaluation / Pilot (Guest Sandbox)",
    price: "Free",
    cadence: "Instant access",
    points: [
      "Public NTSB, AD, and SDR explorer when those records are loaded",
      "Deterministic manufacturing rule checks on drawings you open",
      "Help center and customer-care form",
      "No credit card · session ends when the browser closes",
    ],
    cta: { href: "/", label: "Start guest sandbox" },
  },
  {
    name: "Engineering Team",
    price: "Seat-based",
    cadence: "Annual or monthly",
    points: [
      "Empty organization on signup — your memory, not sample data",
      "Searchable decisions, precedent validity, and manufacturing rules",
      "Decision Sentinel on standing decisions",
      "SHA-256 compliance dossiers and org invites",
    ],
    cta: { href: "/demo", label: "Request team evaluation" },
  },
  {
    name: "Enterprise Defense / OEM",
    price: "Custom",
    cadence: "Program contract",
    points: [
      "Custom tenant isolation",
      "On-premise and air-gapped deployment options",
      "Dedicated ITAR compliance guarantees",
      "Custom DSL rule engines for program-specific invariants",
    ],
    cta: { href: "/contact", label: "Talk to an aerospace engineer" },
  },
];

const STEPS = [
  {
    title: "Sandbox Verification",
    body: "Launch guest access, run GD&T checks on public records, and confirm the engine never hallucinates a finding.",
  },
  {
    title: "30-Day Program Pilot",
    body: "Bound one assembly or supplier interface. Export a traceability matrix and watch Sentinel on live assumptions.",
  },
  {
    title: "Full Production Deployment",
    body: "Seat rollout or air-gapped OEM tenancy. Custom DSL rules and dedicated ITAR controls where the program requires them.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A clear path from sandbox to production.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-slate-600">
          Evaluate in the browser, pilot a program, then deploy with the isolation your
          airworthiness and security organizations require.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-colors hover:border-slate-300"
            >
              <h2 className="text-lg font-semibold text-slate-900">{tier.name}</h2>
              <p className="mt-3 text-2xl font-bold text-slate-900">{tier.price}</p>
              <p className="text-sm text-slate-500">{tier.cadence}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm leading-relaxed text-slate-600">
                {tier.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className="mt-8 inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white no-underline hover:bg-blue-700"
              >
                {tier.cta.label}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            How Evaluation Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
              >
                <p className="font-mono text-xs font-semibold text-blue-700">{index + 1}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
