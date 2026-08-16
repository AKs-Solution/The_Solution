import Link from "next/link";
import { AerospaceLogo } from "@/components/ui/aerospace-logo";
import {
  GitBranch,
  BookCheck,
  AlertTriangle,
  ArrowRight,
  Workflow,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Cpu,
} from "lucide-react";

export default function Home() {
  const pillars = [
    {
      title: "Truth Pipeline",
      description:
        "Deterministic document ingestion, metadata classification, and provenance parsing.",
      icon: Database,
      color: "text-sky-700 border-sky-200 bg-sky-50",
    },
    {
      title: "Knowledge Graph",
      description:
        "Traceable relationships, dependency networks, and subgraphs of engineering specs.",
      icon: GitBranch,
      color: "text-indigo-700 border-indigo-200 bg-indigo-50",
    },
    {
      title: "Rule Engine",
      description: "Cycle detection, condition DSL evaluation, and batch topological sorting.",
      icon: BookCheck,
      color: "text-violet-700 border-violet-200 bg-violet-50",
    },
    {
      title: "Contradiction Engine",
      description: "Deterministic evidence conflicts and missing evidence detection.",
      icon: AlertTriangle,
      color: "text-rose-700 border-rose-200 bg-rose-50",
    },
    {
      title: "Reality Engine",
      description: "Reinterprets rules, contradiction lifecycles, and ingestion completeness.",
      icon: Cpu,
      color: "text-emerald-700 border-emerald-200 bg-emerald-50",
    },
    {
      title: "Orchestrator",
      description: "Sequences calls to rule, evidence, and contradiction engines synchronously.",
      icon: Workflow,
      color: "text-cyan-700 border-cyan-200 bg-cyan-50",
    },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-zinc-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      {/* Light Aerospace Background Meshes */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] bg-[size:3.5rem_3.5rem] opacity-40" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-200/40 via-indigo-200/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[600px] rounded-full bg-sky-100/50 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-200 bg-white/80 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-50">
              <AerospaceLogo className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-zinc-900 uppercase">
                CONSECUENCIA
              </span>
              <span className="font-mono text-[10px] font-medium tracking-tight text-zinc-500">
                AEROSPACE TRUTH PLATFORM
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-medium text-zinc-600 no-underline transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-semibold text-zinc-50 no-underline hover:bg-zinc-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main
        id="main"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-16 text-center lg:py-24"
      >
        {/* Banner Announcement */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>AS9100 Rev D & FAR Part 25 Deterministic Verification Engine</span>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl leading-tight font-black tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
          Aerospace Decision Intelligence
        </h1>

        <h2 className="mt-4 max-w-2xl font-mono text-xl font-medium text-zinc-600 sm:text-2xl">
          Deterministic Verification // Grounded Epistemic Truth
        </h2>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
          Consecuencia empowers flight systems engineers and chief architects to validate materials,
          structural tolerances, and multi-hop dependency networks with mathematical certainty.
          <span className="mt-2 block font-semibold text-zinc-800">
            Traditional AI predicts. We verify.
          </span>
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-8 text-sm font-semibold text-zinc-50 no-underline hover:bg-zinc-800"
          >
            Create workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 no-underline hover:bg-zinc-100 hover:text-zinc-900"
          >
            Sign In
          </Link>
          <a
            href="https://github.com/AKSCI/Consecuencia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 font-mono text-xs font-medium text-zinc-700 no-underline hover:bg-zinc-100 hover:text-zinc-900"
          >
            Repository
          </a>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-24 w-full">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] tracking-widest text-zinc-500 uppercase shadow-sm">
              <Layers className="size-3 text-zinc-700" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              The Six Deterministic Verification Pillars
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
              Every assertion is anchored to SHA-256 evidence hashes and topological knowledge
              graphs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl border ${pillar.color} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all group-hover:border-zinc-400 group-hover:text-zinc-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 transition-colors group-hover:text-zinc-700">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Cryptographic Integrity Callout */}
        <div className="mt-20 flex w-full max-w-4xl flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-8 text-left shadow-sm md:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-700">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-900">
                Immutable Cryptographic Audit Trail
              </h3>
              <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-700">
                SHA-256
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Every decision, rule condition evaluation, simulation run, and drawing revision
              generates an immutable SHA-256 verification hash and epistemic reasoning chain. No
              hallucinated predictions. No ungrounded conclusions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-zinc-200 bg-white py-8 text-center font-mono text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} AKSCI // CONSECUENCIA AEROSPACE. ALL RIGHTS RESERVED.
          </span>
          <div className="flex gap-4 text-[11px]">
            <a
              href="https://github.com/AKSCI/Consecuencia"
              className="text-zinc-500 transition-colors hover:text-zinc-900"
            >
              REPOSITORY
            </a>
            <span>&middot;</span>
            <span className="font-semibold text-emerald-700">AS9100 CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
