"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Preview {
  organizationName: string;
  email: string | null;
  role: string;
  expiresAt: string;
  status: string;
}

function InviteAcceptInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setError("This invite link is missing a token.");
        return;
      }
      try {
        const [previewRes, meRes] = await Promise.all([
          fetch(`/api/invitations/preview?token=${encodeURIComponent(token)}`),
          fetch("/api/auth/me", { credentials: "include" }),
        ]);
        if (!cancelled) setSignedIn(meRes.ok);
        if (!previewRes.ok) {
          const body = await previewRes.json().catch(() => null);
          if (!cancelled) setError(body?.error || "This invitation is invalid or expired.");
          return;
        }
        const json = await previewRes.json();
        if (!cancelled) setPreview(json.data);
      } catch {
        if (!cancelled) setError("Could not load this invitation.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch("/api/invitations/accept-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Could not accept this invitation.");
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("Could not accept this invitation.");
    } finally {
      setAccepting(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(`/invite?token=${token}`)}`;
  const registerHref = `/register?token=${encodeURIComponent(token)}`;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Organization invitation</h1>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        {preview ? (
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              You are invited to join{" "}
              <span className="font-medium text-slate-900">{preview.organizationName}</span> as{" "}
              <span className="font-medium text-slate-900">{preview.role}</span>.
            </p>
            {preview.email ? (
              <p>
                This invite was sent to{" "}
                <span className="font-medium text-slate-900">{preview.email}</span>.
              </p>
            ) : null}
            <p className="text-xs text-slate-500">
              Expires {new Date(preview.expiresAt).toLocaleString()} · status {preview.status}
            </p>
          </div>
        ) : null}

        {preview?.status === "pending" && signedIn ? (
          <Button className="mt-6 w-full" onClick={() => void handleAccept()} disabled={accepting}>
            {accepting ? "Joining..." : "Join organization"}
          </Button>
        ) : null}

        {preview?.status === "pending" && !signedIn ? (
          <div className="mt-6 flex flex-col gap-2">
            <Link href={registerHref}>
              <Button className="w-full">Create account and join</Button>
            </Link>
            <Link href={loginHref}>
              <Button variant="secondary" className="w-full">
                Sign in to accept
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading invitation...</div>}>
      <InviteAcceptInner />
    </Suspense>
  );
}
