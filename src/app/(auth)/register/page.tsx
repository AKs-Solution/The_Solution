import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm, ContinueAsGuest } from "@/features/auth/components";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500">Get started with Consecuencia by AK</p>
        </div>
        <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
          <RegisterForm />
        </Suspense>
        <div className="mt-4">
          <ContinueAsGuest />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
