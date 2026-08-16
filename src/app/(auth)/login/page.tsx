import Link from "next/link";
import { LoginForm, ContinueAsGuest } from "@/features/auth/components";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your account</p>
        </div>
        <LoginForm />
        <div className="mt-4">
          <ContinueAsGuest />
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
