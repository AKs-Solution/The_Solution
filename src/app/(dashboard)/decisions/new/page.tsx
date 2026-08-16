"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  useScopedTabState,
  useWorkspaceTabs,
} from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toaster";

export default function ProposeDecisionPage() {
  const router = useRouter();
  const { openTab } = useWorkspaceTabs();
  const { toast } = useToast();
  const summaryInputRef = useRef<HTMLInputElement>(null);

  const [decisionType, setDecisionType] = useScopedTabState(
    "decisions.decisionType",
    "TOLERANCE_CHANGE",
  );
  const [description, setDescription] = useScopedTabState("decisions.description", "");
  const [rationale, setRationale] = useScopedTabState("decisions.rationale", "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCreateDecision = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!description.trim()) {
      setFormError("Decision summary is required.");
      summaryInputRef.current?.focus();
      return;
    }
    if (!rationale.trim()) {
      setFormError("Engineering rationale is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionType,
          description: description.trim(),
          rationale: rationale.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setDescription("");
        setRationale("");
        toast({
          title: "Decision recorded",
          description: "The decision was added to the workspace audit trail.",
          variant: "success",
        });
        if (json.data?.id) {
          openTab({
            kind: "decision",
            ref: json.data.id,
            title: json.data.description || "Decision",
            href: `/decisions/${json.data.id}`,
          });
        } else {
          router.push("/decisions");
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setFormError(errJson.error || "Failed to record decision.");
      }
    } catch {
      setFormError("A network error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Propose decision"
        subtitle="Record engineering intent with a summary and rationale."
        action={
          <Button as="a" href="/decisions" variant="secondary" className="h-9">
            Back to list
          </Button>
        }
      />

      <form
        onSubmit={handleCreateDecision}
        className="max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-xs"
      >
        {formError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Decision type</label>
          <select
            value={decisionType}
            onChange={(e) => setDecisionType(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
          >
            <option value="TOLERANCE_CHANGE">Tolerance change</option>
            <option value="MATERIAL_SUB">Material substitution</option>
            <option value="SUPPLIER_CHANGE">Supplier change</option>
            <option value="PROCESS_CHANGE">Process change</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Summary</label>
          <Input
            ref={summaryInputRef}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tighten bore tolerance ±0.015 → ±0.010"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Rationale</label>
          <Input
            required
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Improve fit margin for wing root bracket"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-900 text-slate-50 hover:bg-slate-800"
        >
          {isSubmitting ? "Saving..." : "Record decision"}
        </Button>
      </form>
    </PageContainer>
  );
}
