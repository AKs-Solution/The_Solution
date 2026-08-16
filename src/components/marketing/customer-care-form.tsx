"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";

const CATEGORY_OPTIONS = [
  { value: "complaint", label: "Complaint" },
  { value: "support", label: "Support" },
  { value: "feedback", label: "Feedback" },
];

export function CustomerCareForm({
  defaultName = "",
  defaultEmail = "",
  defaultSubject = "",
  includeDiagnostics,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultSubject?: string;
  includeDiagnostics?: string;
}) {
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
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      category: String(form.get("category") ?? "support"),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
      companyUrl: String(form.get("companyUrl") ?? ""),
      diagnostics: includeDiagnostics,
    };

    try {
      const res = await fetch("/api/support", {
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
        setError(json.error ?? "Unable to submit this request.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to submit this request.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-base font-semibold text-slate-900">Request received</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Customer care will follow up at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="relative space-y-4">
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company-url-care">Company URL</label>
        <input id="company-url-care" name="companyUrl" tabIndex={-1} autoComplete="off" />
      </div>
      <Input
        name="name"
        label="Name"
        required
        defaultValue={defaultName}
        autoComplete="name"
        error={fieldErrors.name}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        required
        defaultValue={defaultEmail}
        autoComplete="email"
        error={fieldErrors.email}
      />
      <Select
        name="category"
        label="Category"
        required
        defaultValue="support"
        options={CATEGORY_OPTIONS}
        error={fieldErrors.category}
      />
      <Input
        name="subject"
        label="Subject"
        required
        defaultValue={defaultSubject}
        error={fieldErrors.subject}
      />
      <Textarea name="message" label="Message" required rows={5} error={fieldErrors.message} />
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-blue-600 hover:bg-blue-700"
      >
        {pending ? "Submitting..." : "Send to customer care"}
      </Button>
    </form>
  );
}
