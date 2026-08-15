"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to process password reset request");
        setIsPending(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-900">Reset link dispatched</h3>
          <p className="text-xs text-zinc-600">
            If an account exists for <span className="font-semibold text-zinc-900">{email}</span>,
            a secure password recovery link has been dispatched to your inbox.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}
      <Input
        label="Email address"
        type="email"
        placeholder="engineer@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Dispatching reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
