import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        404 — Route not found
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900">
        This console path does not exist
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600">
        The page you requested is not part of the Consecuencia workspace. Return to the landing page
        or sign in to the mission console.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 no-underline hover:bg-zinc-100"
        >
          Home
        </Link>
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 no-underline hover:bg-zinc-800"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
