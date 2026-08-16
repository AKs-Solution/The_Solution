"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { ENGINEERING_ROLES } from "@/features/marketing/content";

const ROLE_OPTIONS = ENGINEERING_ROLES.map((role) => ({ value: role.value, label: role.label }));

export function DemoInquiryForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      workEmail: String(form.get("workEmail") ?? ""),
      organization: String(form.get("organization") ?? ""),
      role: String(form.get("role") ?? ""),
      useCase: String(form.get("useCase") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        error?: string;
        details?: Record<string, string[]>;
      };
      if (!res.ok) {
        const nextErrors: Record<string, string> = {};
        if (json.details) {
          for (const [key, messages] of Object.entries(json.details)) {
            if (messages[0]) nextErrors[key] = messages[0];
          }
        }
        setFieldErrors(nextErrors);
        setError(json.error ?? "Unable to submit the evaluation request.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to submit the evaluation request.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="text-base font-semibold text-slate-900">Request received</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          An aerospace engineer will follow up to schedule a 20-minute technical evaluation. Check
          your work inbox for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <Input
        name="fullName"
        label="Full Name"
        required
        autoComplete="name"
        error={fieldErrors.fullName}
      />
      <Input
        name="workEmail"
        type="email"
        label="Work Email"
        required
        autoComplete="email"
        error={fieldErrors.workEmail}
      />
      <Input
        name="organization"
        label="Organization / Defense Agency"
        required
        autoComplete="organization"
        error={fieldErrors.organization}
      />
      <Select
        name="role"
        label="Engineering Role"
        required
        placeholder="Select a role"
        options={ROLE_OPTIONS}
        error={fieldErrors.role}
      />
      <Textarea
        name="useCase"
        label="Primary Program / Use Case"
        required
        rows={5}
        error={fieldErrors.useCase}
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-blue-600 hover:bg-blue-700"
      >
        {pending ? "Submitting..." : "Schedule Technical Evaluation →"}
      </Button>
    </form>
  );
}
