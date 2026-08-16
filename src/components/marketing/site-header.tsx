import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-baseline gap-2 no-underline">
        <span className="text-sm font-semibold tracking-tight text-slate-900">CONSECUENCIA</span>
        <span className="text-[11px] font-medium tracking-wide text-slate-500">BY AK</span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
        <Link href="/#features" className="no-underline hover:text-slate-900">
          Features
        </Link>
        <Link href="/#architecture" className="no-underline hover:text-slate-900">
          Architecture
        </Link>
        <Link href="/#standards" className="no-underline hover:text-slate-900">
          Standards
        </Link>
        <Link href="/pricing" className="no-underline hover:text-slate-900">
          Pricing
        </Link>
        <Link href="/#docs" className="no-underline hover:text-slate-900">
          Docs
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden text-sm font-medium text-slate-600 no-underline hover:text-slate-900 sm:inline"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
