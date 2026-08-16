/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewQueuePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [approvalReason, setApprovalReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assessments/reviews/pending");
      const json = await res.json();
      setReviews(json.data || []);
      if (json.data && json.data.length > 0) {
        setSelectedReview(json.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch pending reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleApprove() {
    if (!selectedReview) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/assessments/${selectedReview.assessmentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalReason: approvalReason || "Approved after structural review",
        }),
      });
      setApprovalReason("");
      fetchReviews();
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestChanges() {
    if (!selectedReview) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/assessments/${selectedReview.assessmentId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: approvalReason || "Requested changes for evidence verification",
        }),
      });
      setApprovalReason("");
      fetchReviews();
    } catch (err) {
      console.error("Request changes error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <UserCheck className="h-6 w-6 text-indigo-600" /> Assessment Approval Queue
          </h1>
          <p className="text-sm text-slate-500">
            Governance review portal for pending engineering assessments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            Pending: {reviews.length} Assessments
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-sm text-slate-500">
          Loading review queue...
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-slate-200 bg-slate-100 p-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Review Queue Clear</h3>
            <p className="text-sm text-slate-500">
              All submitted engineering assessments have been reviewed and approved.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Review List */}
          <div className="flex flex-col gap-3">
            {reviews.map((rev) => {
              const isSelected = selectedReview?.id === rev.id;
              const a = rev.assessment;
              return (
                <button
                  key={rev.id}
                  onClick={() => setSelectedReview(rev)}
                  className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                      {a.severity}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-amber-600">
                      <Clock className="h-3 w-3" /> Submitted
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                  <span className="line-clamp-1 text-xs text-slate-500">{a.description}</span>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
                    <span>By: {a.submittedBy?.name || "Engineer"}</span>
                    <span>v{a.version}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Review Panel */}
          {selectedReview && (
            <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedReview.assessment.title}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Project: {selectedReview.assessment.project?.name || "General Engineering"}{" "}
                    &middot; Version {selectedReview.assessment.version}
                  </span>
                </div>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  Awaiting Review
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Assessment Description
                </h4>
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {selectedReview.assessment.description}
                </p>
              </div>

              {/* Edit History Timeline */}
              <div>
                <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Edit Audit History
                </h4>
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                  {selectedReview.assessment.editHistory?.length > 0 ? (
                    selectedReview.assessment.editHistory.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600"
                      >
                        <span>
                          Modified <strong className="text-indigo-600">{item.fieldName}</strong> by{" "}
                          {item.editedBy?.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.editedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      No edits recorded prior to submission.
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Input & Decision Actions */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Reviewer Rationale / Feedback
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Provide explicit approval reason or modification details..."
                  className="min-h-[80px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={handleRequestChanges}
                    className="border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20"
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Request Changes
                  </Button>
                  <Button
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={handleApprove}
                    className="bg-emerald-600 px-6 text-xs font-semibold text-slate-900 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Approve Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
