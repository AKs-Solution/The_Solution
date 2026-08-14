"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDemoLogin() {
    setError("");
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Demo login failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during demo login");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          className="text-muted-foreground hover:text-foreground self-end text-xs"
        >
          Forgot password?
        </Link>
      </div>
      <label className="text-muted-foreground flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="border-border accent-foreground size-4 rounded"
        />
        Remember me
      </label>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-[10px] tracking-wider uppercase">
          <span className="bg-white px-2 text-zinc-500 font-mono">Or Instant Access</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={handleDemoLogin}
        className="w-full border border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:text-zinc-900"
      >
        Continue as Guest (Demo Mode)
      </Button>
    </form>
  );
}
