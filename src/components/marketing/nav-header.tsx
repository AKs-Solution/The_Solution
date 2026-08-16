"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContinueAsGuest } from "@/features/auth/components";

const NAV = [
  { href: "/#capabilities", hash: "#capabilities", label: "Capabilities" },
  { href: "/#workflow", hash: "#workflow", label: "Workflow" },
  { href: "/#compliance", hash: "#compliance", label: "Compliance" },
  { href: "/#use-cases", hash: "#use-cases", label: "Use Cases" },
  { href: "/pricing", hash: null, label: "Pricing" },
] as const;

export function NavHeader() {
  const pathname = usePathname();

  function onHashClick(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    if (pathname !== "/") return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/85 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <span className="flex size-7 items-center justify-center rounded-md bg-slate-950 font-mono text-[10px] font-semibold text-white">
          C
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-[0.14em] text-slate-950">
            CONSECUENCIA
          </span>
          <span className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-slate-400">
            BY AK
          </span>
        </span>
      </Link>
      <nav className="hidden items-center gap-8 text-[13px] text-slate-500 lg:flex">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.hash && pathname === "/" ? item.hash : item.href}
            onClick={item.hash ? (event) => onHashClick(event, item.hash) : undefined}
            className="font-medium no-underline transition-colors hover:text-slate-950"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="hidden text-[13px] font-medium text-slate-500 no-underline hover:text-slate-950 sm:inline"
        >
          Sign In
        </Link>
        <Link
          href="/demo"
          className="hidden rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-800 no-underline hover:bg-slate-50 sm:inline"
        >
          Request Demo
        </Link>
        <ContinueAsGuest
          compact
          variant="primary"
          label="Launch Console"
          next="/explore"
          className="inline-flex"
          buttonClassName="h-auto w-auto rounded-md bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
        />
      </div>
    </header>
  );
}
