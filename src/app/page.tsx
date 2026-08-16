import Link from "next/link";
import { ContinueAsGuest } from "@/features/auth/components";
import { BookCheck, ShieldCheck, Hash } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="text-sm font-semibold tracking-tight text-slate-900">CONSECUENCIA</span>
          <span className="text-[11px] font-medium tracking-wide text-slate-500">BY AK</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#features" className="no-underline hover:text-slate-900">
            Features
          </a>
          <a href="#architecture" className="no-underline hover:text-slate-900">
            Architecture
          </a>
          <a href="#standards" className="no-underline hover:text-slate-900">
            Standards
          </a>
          <a href="#docs" className="no-underline hover:text-slate-900">
            Docs
          </a>
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

      <main id="main" className="px-6">
        <section className="mx-auto max-w-5xl pt-20 pb-4 text-center sm:pt-28">
          <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700">
            AS9100 Rev D & FAR Part 25 Deterministic Verification Engine
          </div>
          <h1 className="mx-auto max-w-3xl text-center text-4xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Aerospace Decision Intelligence, Grounded in Mathematical Truth.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:text-xl">
            Traditional AI hallucinates. Consecuencia mathematically verifies CAD tolerances,
            material substitutions, and engineering decisions with cryptographic certainty.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?next=/dashboard"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white no-underline shadow-sm hover:bg-blue-700"
            >
              Launch Mission Console
            </Link>
            <ContinueAsGuest
              label="Explore Live Demo"
              compact
              className="inline-flex"
              buttonClassName="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium w-auto shadow-none"
            />
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="size-2.5 rounded-full bg-slate-300" />
            <span className="ml-3 font-mono text-[11px] text-slate-500">
              consecuencia.app / drawings / TF-4412
            </span>
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Drawing inspection
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Turbine Flange Tolerance Check
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Rev C → Rev D · CFM56-7B fan case interface
                </p>
              </div>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs text-emerald-700">
                DERIVED
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Callout
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Requirement
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Measured
                    </th>
                    <th className="p-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 text-slate-800">
                    <td className="p-3.5 font-mono text-xs">Ø 412.00</td>
                    <td className="p-3.5">±0.05 mm true position</td>
                    <td className="p-3.5 font-mono">0.031 mm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                  <tr className="border-b border-slate-100 text-slate-800">
                    <td className="p-3.5 font-mono text-xs">⟂ A</td>
                    <td className="p-3.5">Perpendicularity 0.02</td>
                    <td className="p-3.5 font-mono">0.014 mm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="p-3.5 font-mono text-xs">Ra 1.6</td>
                    <td className="p-3.5">Flange face finish</td>
                    <td className="p-3.5 font-mono">1.2 µm</td>
                    <td className="p-3.5 text-emerald-700">GD&T pass</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-20 md:grid-cols-3"
        >
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <BookCheck className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Deterministic Rule Engine</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Evaluate GD&T tolerances and material specs against 15 strict physical invariants.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <ShieldCheck className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Decision Sentinel</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Continuous surveillance on aging assumptions and active flight deviations.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
            <Hash className="mb-4 size-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Cryptographic Proofs</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Mint SHA-256 evidence chains and generate instant AS9100 compliance packages.
            </p>
          </article>
        </section>

        <section id="architecture" className="mx-auto max-w-3xl pb-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Architecture</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Ingest recorded engineering artifacts, bind them in a knowledge graph, evaluate
            invariants, and emit an auditable evidence chain. No generative step sits between
            measurement and conclusion.
          </p>
        </section>

        <section id="standards" className="mx-auto max-w-3xl pb-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Standards</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Built for AS9100 Rev D quality systems and FAR Part 25 airworthiness evidence. Every
            pass/fail is tied to a recorded requirement identifier.
          </p>
        </section>

        <section id="docs" className="mx-auto max-w-3xl pb-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Docs</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Sign in to the workspace help center for ingestion, sentinel surveillance, and
            certification package workflows.
          </p>
          <Link
            href="/help"
            className="mt-4 inline-block text-sm font-medium text-blue-600 no-underline hover:text-blue-700"
          >
            Open documentation
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
        © 2026 Consecuencia by AK. Deterministic verification for mission-critical aerospace
        engineering.
      </footer>
    </div>
  );
}
