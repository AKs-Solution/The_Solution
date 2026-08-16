import Link from "next/link";
import { FRESHNESS_LINE } from "@/features/marketing/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
      <p>
        © 2026 Consecuencia by AK. Deterministic verification for mission-critical aerospace
        engineering.
      </p>
      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        <Link href="/pricing" className="text-slate-500 no-underline hover:text-slate-800">
          Pricing
        </Link>
        <Link href="/demo" className="text-slate-500 no-underline hover:text-slate-800">
          Request demo
        </Link>
        <Link href="/contact" className="text-slate-500 no-underline hover:text-slate-800">
          Contact
        </Link>
        <Link
          href="/use-cases/as9100-compliance"
          className="text-slate-500 no-underline hover:text-slate-800"
        >
          AS9100
        </Link>
        <Link
          href="/use-cases/flight-systems"
          className="text-slate-500 no-underline hover:text-slate-800"
        >
          Flight systems
        </Link>
        <Link href="/vs/predictive-ai" className="text-slate-500 no-underline hover:text-slate-800">
          vs. predictive AI
        </Link>
      </nav>
      <p className="mt-6 font-mono text-[11px] text-slate-400">{FRESHNESS_LINE}</p>
    </footer>
  );
}
