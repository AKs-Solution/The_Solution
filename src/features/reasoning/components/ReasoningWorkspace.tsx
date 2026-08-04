"use client";

import React, { useState } from "react";
import { ReasoningChainViewer } from "./ReasoningChainViewer";
import { ReasoningGraphVisualizer } from "./ReasoningGraphVisualizer";
import { EvidenceWeightingTable } from "./EvidenceWeightingTable";
import { EngineeringPrincipleExplorer } from "./EngineeringPrincipleExplorer";
import { TradeoffAlternativeComparator } from "./TradeoffAlternativeComparator";
import { ConflictAlertCenter } from "./ConflictAlertCenter";
import { ConclusionExplanationPanel } from "./ConclusionExplanationPanel";
import {
  EngineeringPrincipleData,
  ReasoningExplanationPayload,
  ReasoningGraphData,
  ReasoningStepData,
} from "@/server/reasoning/types";

interface SessionSummary {
  id: string;
  title: string;
  problemStatement: string;
  status: string;
  confidenceScore: number | null;
  createdAt: string;
}

interface Props {
  initialSessions: SessionSummary[];
  initialActiveSession?: ReasoningExplanationPayload | null;
  initialGraph?: ReasoningGraphData | null;
  principles: EngineeringPrincipleData[];
}

type TabType =
  "CONCLUSION" | "PIPELINE" | "GRAPH" | "EVIDENCE" | "PRINCIPLES" | "TRADEOFFS" | "CONFLICTS";

export function ReasoningWorkspace({
  initialSessions,
  initialActiveSession,
  initialGraph,
  principles,
}: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>(initialSessions);
  const [activeSession, setActiveSession] = useState<ReasoningExplanationPayload | null>(
    initialActiveSession || null,
  );
  const [activeGraph, setActiveGraph] = useState<ReasoningGraphData | null>(initialGraph || null);
  const [activeTab, setActiveTab] = useState<TabType>("CONCLUSION");

  // New Session Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProblem) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reasoning/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, problemStatement: newProblem }),
      });
      const json = await res.json();
      if (json.data) {
        // Fetch full explanation payload & graph for new session
        const expRes = await fetch(`/api/reasoning/sessions/${json.data.id}/explanations`);
        const expJson = await expRes.json();
        const graphRes = await fetch(`/api/reasoning/sessions/${json.data.id}/graph`);
        const graphJson = await graphRes.json();

        setActiveSession(expJson.data);
        setActiveGraph(graphJson.data);
        setSessions([
          {
            id: json.data.id,
            title: json.data.title,
            problemStatement: json.data.problemStatement,
            status: json.data.status,
            confidenceScore: json.data.confidenceScore,
            createdAt: new Date().toISOString(),
          },
          ...sessions,
        ]);
        setIsModalOpen(false);
        setNewTitle("");
        setNewProblem("");
      }
    } catch (err) {
      console.error("Failed to start reasoning session", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      const [expRes, graphRes] = await Promise.all([
        fetch(`/api/reasoning/sessions/${sessionId}/explanations`),
        fetch(`/api/reasoning/sessions/${sessionId}/graph`),
      ]);
      const expJson = await expRes.json();
      const graphJson = await graphRes.json();
      setActiveSession(expJson.data);
      setActiveGraph(graphJson.data);
    } catch (err) {
      console.error("Failed to select session", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-ping rounded-full bg-cyan-400"></span>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              Engineering Reasoning Engine
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            Multidisciplinary engineering review board executing transparent, evidence-backed
            reasoning chains, multi-factor evidence weighting, and conflict detection.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:from-cyan-400 hover:to-blue-500"
        >
          + Start Reasoning Session
        </button>
      </div>

      {/* Main Grid: Session Selector sidebar & Content Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md lg:col-span-1">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Reasoning Sessions
          </h3>

          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
            {sessions.map((s) => {
              const isSelected = activeSession?.sessionId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-950/40 text-slate-100 shadow-md shadow-cyan-950/30"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400">{s.status}</span>
                    {s.confidenceScore !== null && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.round(s.confidenceScore * 100)}%
                      </span>
                    )}
                  </div>
                  <h4 className="line-clamp-1 text-xs font-bold text-slate-200">{s.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Session Content */}
        <div className="space-y-6 lg:col-span-3">
          {activeSession ? (
            <>
              {/* Tab Navigation */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("CONCLUSION")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "CONCLUSION"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Conclusion & Citations
                </button>
                <button
                  onClick={() => setActiveTab("PIPELINE")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "PIPELINE"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  14-Stage Pipeline
                </button>
                <button
                  onClick={() => setActiveTab("GRAPH")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "GRAPH"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Reasoning Graph
                </button>
                <button
                  onClick={() => setActiveTab("EVIDENCE")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "EVIDENCE"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Evidence Weights
                </button>
                <button
                  onClick={() => setActiveTab("PRINCIPLES")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "PRINCIPLES"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Principles Library
                </button>
                <button
                  onClick={() => setActiveTab("TRADEOFFS")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "TRADEOFFS"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Tradeoffs & Alternatives
                </button>
                <button
                  onClick={() => setActiveTab("CONFLICTS")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === "CONFLICTS"
                      ? "bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Conflicts ({activeSession.conflictsDetected.length})
                </button>
              </div>

              {/* Tab Views */}
              <div className="min-h-[500px] rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
                {activeTab === "CONCLUSION" && (
                  <ConclusionExplanationPanel
                    conclusion={activeSession.conclusion}
                    confidenceScore={activeSession.confidenceScore}
                    isSupportedByEvidence={activeSession.isSupportedByEvidence}
                    citations={activeSession.evidenceUsed.map((w) => ({
                      evidenceId: w.evidenceId,
                      citationText: w.title,
                      relevanceWeight: w.finalWeight,
                    }))}
                  />
                )}

                {activeTab === "PIPELINE" && (
                  <ReasoningChainViewer
                    steps={activeSession.reasoningChainSteps as ReasoningStepData[]}
                  />
                )}

                {activeTab === "GRAPH" && activeGraph && (
                  <ReasoningGraphVisualizer graph={activeGraph} />
                )}

                {activeTab === "EVIDENCE" && (
                  <EvidenceWeightingTable weights={activeSession.evidenceUsed} />
                )}

                {activeTab === "PRINCIPLES" && (
                  <EngineeringPrincipleExplorer principles={principles} />
                )}

                {activeTab === "TRADEOFFS" && (
                  <TradeoffAlternativeComparator
                    tradeoffs={activeSession.tradeoffsConsidered}
                    alternatives={activeSession.rejectedAlternatives}
                  />
                )}

                {activeTab === "CONFLICTS" && (
                  <ConflictAlertCenter
                    conflicts={activeSession.conflictsDetected}
                    uncertainties={activeSession.remainingUncertainties}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center text-sm text-slate-500 italic">
              Select or start a reasoning session to launch the Engineering Reasoning Engine.
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Start New Reasoning Session</h3>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep-Water Pressure Hull Material Selection"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">
                  Engineering Problem Statement
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the engineering challenge, operational parameters, and load constraints..."
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Running Reasoning Engine..." : "Execute Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
