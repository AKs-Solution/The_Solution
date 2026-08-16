"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-slate-500 uppercase">
        Workspace error
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        {error.message || "An unexpected error stopped this page from rendering."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-slate-50 hover:bg-slate-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 no-underline hover:bg-slate-100"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
