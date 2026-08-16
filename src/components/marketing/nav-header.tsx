"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ContinueAsGuest } from "@/features/auth/components";
import { MarketingAnchor } from "./marketing-anchor";

const NAV = [
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#compliance", label: "Compliance" },
  { href: "/#use-cases", label: "Use Cases" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function NavHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <span className="flex size-7 items-center justify-center rounded-md bg-slate-900 font-mono text-[10px] font-semibold text-white">
          C
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-[0.16em] text-slate-900">
            CONSECUENCIA
          </span>
          <span className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-slate-500">
            BY AK
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-7 text-[13px] text-slate-500 md:flex">
        {NAV.map((item) => (
          <MarketingAnchor
            key={item.href}
            href={item.href}
            className="font-medium no-underline transition-colors hover:text-slate-900"
          >
            {item.label}
          </MarketingAnchor>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden text-sm font-medium text-slate-500 no-underline hover:text-slate-900 sm:inline"
        >
          Sign In
        </Link>
        <ContinueAsGuest
          compact
          variant="primary"
          label="Launch Console"
          next="/explore"
          className="inline-flex"
          buttonClassName="h-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        />
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="absolute top-16 right-0 left-0 border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <MarketingAnchor
                key={item.href}
                href={item.href}
                onNavigate={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
              >
                {item.label}
              </MarketingAnchor>
            ))}
            <Link
              href="/login"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
