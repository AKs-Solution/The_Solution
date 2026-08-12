import { APP_NAME } from "@/shared/constants";
import { ShieldCheck, Lock, Cpu } from "lucide-react";

/**
 * High-density aerospace application footer.
 */
export function Footer() {
  return (
    <footer className="border-border/80 bg-surface/50 text-muted-foreground/80 flex h-10 shrink-0 items-center justify-between border-t px-6 text-[11px] backdrop-blur-md select-none font-mono">
      <div className="flex items-center gap-4">
        <span>&copy; {new Date().getFullYear()} AKSCI // {APP_NAME}</span>
        <span className="hidden items-center gap-1 text-emerald-400/90 sm:flex">
          <ShieldCheck className="size-3" />
          <span>AS9100 Rev D / FAR 25</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1 text-sky-400/90 sm:flex">
          <Lock className="size-3" />
          <span>SHA-256 PROVENANCE</span>
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Cpu className="size-3" />
          <span>LATENCY: 12ms</span>
        </span>
      </div>
    </footer>
  );
}

