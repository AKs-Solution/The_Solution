"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DemoLoginButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  className?: string;
  children?: React.ReactNode;
}

export function DemoLoginButton({
  variant = "primary",
  className,
  children,
}: DemoLoginButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDemoLogin() {
    setIsPending(true);
    try {
      await fetch("/api/auth/demo", { method: "POST" }).catch(() => null);
      router.push("/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);
      router.push("/dashboard");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button variant={variant} disabled={isPending} onClick={handleDemoLogin} className={className}>
      {isPending ? "Entering Demo..." : children || "Guest Demo Mode"}
    </Button>
  );
}
