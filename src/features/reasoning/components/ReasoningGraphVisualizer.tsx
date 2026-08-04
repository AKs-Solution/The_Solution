"use client";

import { useState } from "react";
import { ReasoningGraphData, ReasoningNodeType } from "@/server/reasoning/types";

interface Props {
  graph: ReasoningGraphData;
}

const nodeTypeColors: Record<ReasoningNodeType, { bg: string; border: string; text: string }> = {
  EVIDENCE: { bg: "bg-blue-950/60", border: "border-blue-500/40", text: "text-blue-300" },
  PRINCIPLE: { bg: "bg-purple-950/60", border: "border-purple-500/40", text: "text-purple-300" },
  CONSTRAINT: { bg: "bg-amber-950/60", border: "border-amber-500/40", text: "text-amber-300" },
  ASSUMPTION: { bg: "bg-cyan-950/60", border: "border-cyan-500/40", text: "text-cyan-300" },
  TRADEOFF: { bg: "bg-teal-950/60", border: "border-teal-500/40", text: "text-teal-300" },
  ALTERNATIVE: { bg: "bg-indigo-950/60", border: "border-indigo-500/40", text: "text-indigo-300" },
  RISK: { bg: "bg-rose-950/60", border: "border-rose-500/40", text: "text-rose-300" },
  RECOMMENDATION: {
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
  },
  CONCLUSION: { bg: "bg-emerald-900/80", border: "border-emerald-400", text: "text-emerald-200" },
  STEP: { bg: "bg-slate-900/60", border: "border-slate-700", text: "text-slate-300" },
  MISSING_EVIDENCE: { bg: "bg-rose-950/80", border: "border-rose-600", text: "text-rose-200" },
  DECISION_BRANCH: { bg: "bg-amber-900/70", border: "border-amber-500", text: "text-amber-200" },
};

export function ReasoningGraphVisualizer({ graph }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filteredNodes = graph.nodes.filter(
    (n) => typeFilter === "ALL" || n.nodeType === typeFilter,
  );

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);
  const connectedEdges = graph.edges.filter(
    (e) => e.sourceNodeId === selectedNodeId || e.targetNodeId === selectedNodeId,
  );

  return (
    <div className="space-y-6">
      {/* Controls & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">Filter Nodes:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Nodes ({graph.nodes.length})</option>
            <option value="EVIDENCE">Evidence</option>
            <option value="PRINCIPLE">Engineering Principles</option>
            <option value="CONSTRAINT">Constraints</option>
            <option value="TRADEOFF">Tradeoffs</option>
            <option value="ALTERNATIVE">Alternatives</option>
            <option value="RISK">Conflicts & Risks</option>
            <option value="CONCLUSION">Conclusion</option>
          </select>
        </div>

        <div className="font-mono text-xs text-slate-400">
          Nodes: {filteredNodes.length} | Relationships (Edges): {graph.edges.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Node Matrix Canvas */}
        <div className="min-h-[400px] rounded-xl border border-slate-800 bg-slate-950/80 p-4 lg:col-span-2">
          <h4 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Reasoning Graph Topology
          </h4>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredNodes.map((node) => {
              const colors = nodeTypeColors[node.nodeType] || nodeTypeColors.STEP;
              const isSelected = node.id === selectedNodeId;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${colors.bg} ${colors.border} ${
                    isSelected
                      ? "scale-[1.02] shadow-lg ring-2 shadow-cyan-950/40 ring-cyan-400"
                      : "hover:border-slate-600"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${colors.text} border border-slate-800 bg-slate-900/60`}
                    >
                      {node.nodeType}
                    </span>
                    {node.confidence !== undefined && node.confidence !== null && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.round(node.confidence * 100)}% Conf
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-slate-100">{node.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Details & Justification Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Relationship &amp; Justification Inspector
          </h4>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <span className="font-mono text-[10px] text-cyan-400 uppercase">
                  {selectedNode.nodeType}
                </span>
                <h5 className="mt-1 text-sm font-bold text-slate-100">{selectedNode.label}</h5>
              </div>

              <div>
                <h6 className="mb-2 text-xs font-semibold text-slate-300">
                  Connected Relationships (&quot;WHY&quot;):
                </h6>
                {connectedEdges.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No direct edges connected to this node.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {connectedEdges.map((edge) => {
                      const isSource = edge.sourceNodeId === selectedNodeId;
                      const otherNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
                      const otherNode = graph.nodes.find((n) => n.id === otherNodeId);

                      return (
                        <div
                          key={edge.id}
                          className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs"
                        >
                          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
                            <span>{isSource ? "OUTGOING ->" : "<- INCOMING"}</span>
                            <span className="rounded border border-cyan-800 bg-cyan-950 px-1.5 py-0.5 text-cyan-200">
                              {edge.edgeType}
                            </span>
                            <span className="text-slate-400">
                              to {otherNode?.label || otherNodeId}
                            </span>
                          </div>
                          <p className="mt-1.5 border-l-2 border-cyan-500 pl-2 text-[11px] leading-relaxed text-slate-300 italic">
                            &quot;{edge.justification}&quot;
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              Select any node in the graph topology canvas to inspect connected relationships and
              explicit &quot;WHY&quot; justifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
