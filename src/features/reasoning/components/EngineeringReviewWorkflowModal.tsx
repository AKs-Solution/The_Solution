"use client";

import { useState } from "react";

interface Props {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function EngineeringReviewWorkflowModal({ sessionId, isOpen, onClose, onSubmitted }: Props) {
  const [status, setStatus] = useState<"APPROVED" | "REJECTED" | "CHALLENGED">("APPROVED");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reasoning/sessions/${sessionId}/signoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comments }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to submit review sign-off");
      }

      onSubmitted();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 className="text-base font-bold text-zinc-900">Engineering Review Board Sign-Off</h3>
          <button onClick={onClose} className="font-mono text-sm text-zinc-500 hover:text-zinc-900">
            [X]
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-800 bg-rose-950/60 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mb-1.5 block font-semibold text-zinc-700">Review Decision</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("APPROVED")}
                className={`rounded-lg border px-3 py-2 font-semibold transition ${
                  status === "APPROVED"
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-300"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setStatus("CHALLENGED")}
                className={`rounded-lg border px-3 py-2 font-semibold transition ${
                  status === "CHALLENGED"
                    ? "border-amber-500 bg-amber-950/80 text-amber-300"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Challenge
              </button>
              <button
                type="button"
                onClick={() => setStatus("REJECTED")}
                className={`rounded-lg border px-3 py-2 font-semibold transition ${
                  status === "REJECTED"
                    ? "border-rose-500 bg-rose-950/80 text-rose-300"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-semibold text-zinc-700">
              Review Rationale &amp; Comments
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide engineering rationale, challenge details, or additional test requirements..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
