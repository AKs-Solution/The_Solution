"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeInternalPath } from "@/shared/security/safe-internal-path";

export function LoginForm() {
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const postLoginDestination = () => {
    return safeInternalPath(searchParams.get("next"), "/dashboard");
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Login failed");
        return;
      }

      window.location.assign(postLoginDestination());
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isResetSuccess && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Password reset successfully. You can now sign in with your new credentials.</span>
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <div className="flex flex-col gap-1">
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Link
          href="/forgot-password"
          className="self-end text-xs text-slate-500 hover:text-blue-600"
        >
          Forgot password?
        </Link>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-500">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-slate-300 accent-blue-600"
        />
        Remember me
      </label>
      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
