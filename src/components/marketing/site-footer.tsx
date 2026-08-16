import { FRESHNESS_LINE } from "@/features/marketing/content";
import { MarketingAnchor } from "./marketing-anchor";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#capabilities", label: "Capabilities" },
      { href: "/#workflow", label: "Workflow" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Request demo" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { href: "/use-cases/as9100-compliance", label: "AS9100" },
      { href: "/use-cases/flight-systems", label: "Flight systems" },
      { href: "/vs/predictive-ai", label: "vs. predictive AI" },
      { href: "/#compliance", label: "Compliance" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/#faq", label: "FAQ" },
      { href: "/login", label: "Sign in" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.16em] text-slate-900">CONSECUENCIA</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-slate-400">BY AK</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Deterministic verification for mission-critical aerospace engineering.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {column.title}
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <MarketingAnchor
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 no-underline hover:text-slate-900"
                >
                  {link.label}
                </MarketingAnchor>
              ))}
            </nav>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-6xl font-mono text-[11px] text-slate-400">
        {FRESHNESS_LINE}
      </p>
    </footer>
  );
}
