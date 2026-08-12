import { APP_NAME } from "@/shared/constants";
import { FileCheck, Lock, Cpu } from "lucide-react";

/**
 * High-density aerospace application footer.
 */
export function Footer() {
  return (
    <footer className="border-slate-800/80 bg-[#080c14] text-slate-400 flex h-7.5 shrink-0 items-center justify-between border-t px-4 text-[10px] select-none font-mono mt-auto">
      <div className="flex items-center gap-4">
        <span>&copy; {new Date().getFullYear()} AKSCI // {APP_NAME}</span>
        <span className="hidden items-center gap-1 text-slate-400 sm:flex">
          <FileCheck className="size-3 text-emerald-400" />
          <span>AS9100 Rev D / FAR 25</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1 text-slate-400 sm:flex">
          <Lock className="size-3 text-sky-400" />
          <span>SHA-256 PROVENANCE</span>
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Cpu className="size-3 text-slate-400" />
          <span>LATENCY: 12ms</span>
        </span>
      </div>
    </footer>
  );
}


