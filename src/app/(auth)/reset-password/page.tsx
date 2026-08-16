import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components";

function ResetPasswordPageInner() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your new password below</p>
        </div>
        <ResetPasswordForm />
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
