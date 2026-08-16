"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

export function ContinueAsGuest({
  className,
  buttonClassName,
  label = "Continue as Guest",
  compact = false,
}: {
  className?: string;
  buttonClassName?: string;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleGuest() {
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) {
        setError("Unable to start a guest session.");
        return;
      }
      router.push("/explore");
      router.refresh();
    } catch {
      setError("Unable to start a guest session.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      {error && <p className="mb-2 text-center text-xs text-rose-600">{error}</p>}
      <Button
        type="button"
        variant="secondary"
        className={cn("w-full", buttonClassName)}
        disabled={pending}
        onClick={() => void handleGuest()}
      >
        {pending ? "Opening public corpus..." : label}
      </Button>
      {!compact && (
        <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
          Explore public NTSB, AD, and SDR records. No account. Session ends when you close the
          browser.
        </p>
      )}
    </div>
  );
}
