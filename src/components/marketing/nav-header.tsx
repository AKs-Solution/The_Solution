"use client";

import Link from "next/link";
import { ContinueAsGuest } from "@/features/auth/components";

const NAV = [
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#compliance", label: "Compliance" },
  { href: "/#use-cases", label: "Use Cases" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function NavHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="flex size-7 items-center justify-center rounded-md border border-slate-800 bg-slate-900 font-mono text-[10px] font-semibold text-white">
          C
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-mono text-sm font-semibold tracking-tight text-slate-900">
            CONSECUENCIA
          </span>
          <span className="mt-0.5 font-mono text-[10px] tracking-wide text-slate-500">BY AK</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="no-underline hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="hidden text-sm font-medium text-slate-600 no-underline hover:text-slate-900 sm:inline"
        >
          Sign In
        </Link>
        <Link
          href="/demo"
          className="hidden rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-800 no-underline hover:bg-slate-50 sm:inline"
        >
          Request Demo
        </Link>
        <ContinueAsGuest
          compact
          variant="primary"
          label="Launch Console"
          className="inline-flex"
          buttonClassName="h-auto w-auto rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        />
      </div>
    </header>
  );
}
