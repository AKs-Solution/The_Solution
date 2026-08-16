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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        Workspace error
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600">
        {error.message || "An unexpected error stopped this page from rendering."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 no-underline hover:bg-zinc-100"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
