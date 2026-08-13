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
import { DemoLoginButton } from "@/components/DemoLoginButton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const pillars = [
    {
      title: "Truth Pipeline",
      description:
        "Deterministic document ingestion, metadata classification, and provenance parsing.",
      icon: Database,
      color: "text-sky-400 border-sky-500/20 bg-sky-500/5",
    },
    {
      title: "Knowledge Graph",
      description:
        "Traceable relationships, dependency networks, and subgraphs of engineering specs.",
      icon: GitBranch,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Rule Engine",
      description: "Cycle detection, condition DSL evaluation, and batch topological sorting.",
      icon: BookCheck,
      color: "text-violet-400 border-violet-500/20 bg-violet-500/5",
    },
    {
      title: "Contradiction Engine",
      description: "Deterministic evidence conflicts and missing evidence detection.",
      icon: AlertTriangle,
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    },
    {
      title: "Reality Engine",
      description: "Reinterprets rules, contradiction lifecycles, and ingestion completeness.",
      icon: Cpu,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      title: "Orchestrator",
      description: "Sequences calls to rule, evidence, and contradiction engines synchronously.",
      icon: Workflow,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-[#06090e] font-sans text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Dynamic Aerospace Background Meshes */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0e1626_1px,transparent_1px),linear-gradient(to_bottom,#0e1626_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] bg-[size:3.5rem_3.5rem] opacity-70" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-500/15 via-indigo-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-sky-500/5 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#06090e]/80 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <AerospaceLogo className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-white uppercase">
                CONSECUENCIA
              </span>
              <span className="text-[10px] font-medium tracking-tight text-slate-400 font-mono">
                AEROSPACE TRUTH PLATFORM
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <DemoLoginButton
              variant="secondary"
              className="border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              Guest Demo Access
            </DemoLoginButton>
            <Link href="/login" className="no-underline">
              <Button variant="ghost" className="text-slate-300 transition-colors hover:text-white text-xs font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="no-underline">
              <Button className="bg-slate-900 hover:bg-slate-800 font-semibold text-white text-xs border border-slate-700">
                Register
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-16 text-center lg:py-24">
        {/* Banner Announcement */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>AS9100 Rev D & FAR Part 25 Deterministic Verification Engine</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl leading-tight font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Aerospace Decision Intelligence
        </h1>

        <h2 className="mt-4 max-w-2xl text-xl font-medium text-slate-300 sm:text-2xl font-mono">
          Deterministic Verification // Grounded Epistemic Truth
        </h2>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Consecuencia empowers flight systems engineers and chief architects to validate materials,
          structural tolerances, and multi-hop dependency networks with mathematical certainty.
          <span className="mt-2 block font-semibold text-slate-200">
            Traditional AI predicts. We verify.
          </span>
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <DemoLoginButton
            variant="primary"
            className="flex items-center gap-2 border border-slate-700 bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Enter Mission Console <ArrowRight className="h-4 w-4" />
          </DemoLoginButton>
          <Link href="/login" className="no-underline">
            <Button
              variant="secondary"
              size="lg"
              className="border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              Sign In
            </Button>
          </Link>
          <a
            href="https://github.com/AKSCI/Consecuencia"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
            <Button
              variant="secondary"
              size="lg"
              className="border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white font-mono text-xs"
            >
              API Spec
            </Button>
          </a>
        </div>

        {/* Core Pillars Grid */}
        <div className="mt-24 w-full">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-3">
              <Layers className="size-3 text-sky-400" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              The Six Deterministic Verification Pillars
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
              Every assertion is anchored to SHA-256 evidence hashes and topological knowledge graphs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl border ${pillar.color} p-6 backdrop-blur-md transition-all duration-200 hover:border-sky-500/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_-4px_rgba(0,240,255,0.1)]`}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 transition-all group-hover:border-sky-500/40 group-hover:bg-slate-800 group-hover:text-white shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white transition-colors group-hover:text-sky-300">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Cryptographic Integrity Callout */}
        <div className="mt-20 flex w-full max-w-4xl flex-col items-center gap-6 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 p-8 text-left md:flex-row shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Immutable Cryptographic Audit Trail</h3>
              <span className="rounded bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300 border border-sky-500/30">
                SHA-256
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Every decision, rule condition evaluation, simulation run, and drawing revision generates
              an immutable SHA-256 verification hash and epistemic reasoning chain. No hallucinated
              predictions. No ungrounded conclusions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-800/80 bg-[#06090e] py-8 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} AKSCI // CONSECUENCIA AEROSPACE. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-4 text-[11px]">
            <a
              href="https://github.com/AKSCI/Consecuencia"
              className="text-slate-400 hover:text-sky-400 transition-colors"
            >
              REPOSITORY
            </a>
            <span>&middot;</span>
            <span className="text-emerald-400 font-semibold">AS9100 CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

