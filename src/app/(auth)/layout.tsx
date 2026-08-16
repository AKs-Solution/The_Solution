import Link from "next/link";
import { AerospaceLogo } from "@/components/ui/aerospace-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-center border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <AerospaceLogo className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wider text-slate-900 uppercase">
              Consecuencia by AK
            </span>
            <span className="font-mono text-[10px] font-medium text-slate-500">
              Aerospace Intelligence
            </span>
          </div>
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
