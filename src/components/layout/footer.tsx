import { APP_NAME } from "@/shared/constants";

/**
 * Minimal application footer.
 */
export function Footer() {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-4 text-[11px] text-slate-500 select-none">
      <span>
        &copy; {new Date().getFullYear()} AKSCI // {APP_NAME}
      </span>
      <span className="font-mono text-[10px] text-slate-400">AS9100 / FAR 25</span>
    </footer>
  );
}
