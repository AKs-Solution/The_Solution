import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components";

function ResetPasswordPageInner() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set new password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your new password below</p>
        </div>
        <ResetPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
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
