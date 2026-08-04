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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100">Engineering Review Board Sign-Off</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-mono"
          >
            [X]
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Review Decision</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("APPROVED")}
                className={`py-2 px-3 rounded-lg font-semibold border transition ${
                  status === "APPROVED"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setStatus("CHALLENGED")}
                className={`py-2 px-3 rounded-lg font-semibold border transition ${
                  status === "CHALLENGED"
                    ? "bg-amber-950/80 border-amber-500 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Challenge
              </button>
              <button
                type="button"
                onClick={() => setStatus("REJECTED")}
                className={`py-2 px-3 rounded-lg font-semibold border transition ${
                  status === "REJECTED"
                    ? "bg-rose-950/80 border-rose-500 text-rose-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Review Rationale &amp; Comments
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide engineering rationale, challenge details, or additional test requirements..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
