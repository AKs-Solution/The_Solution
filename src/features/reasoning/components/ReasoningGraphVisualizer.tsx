"use client";

import { useState } from "react";
import { ReasoningGraphData, ReasoningNodeType } from "@/server/reasoning/types";

interface Props {
  graph: ReasoningGraphData;
}

const nodeTypeColors: Record<ReasoningNodeType, { bg: string; border: string; text: string }> = {
  EVIDENCE: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  PRINCIPLE: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  CONSTRAINT: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700" },
  ASSUMPTION: { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-700" },
  TRADEOFF: { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-700" },
  ALTERNATIVE: { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-700" },
  RISK: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700" },
  RECOMMENDATION: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
  CONCLUSION: { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-800" },
  STEP: { bg: "bg-white", border: "border-slate-200", text: "text-slate-700" },
  MISSING_EVIDENCE: { bg: "bg-rose-50", border: "border-rose-400", text: "text-rose-800" },
  DECISION_BRANCH: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-800" },
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Filter Nodes:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
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

        <div className="font-mono text-xs text-slate-500">
          Nodes: {filteredNodes.length} | Relationships (Edges): {graph.edges.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Node Matrix Canvas */}
        <div className="min-h-[400px] rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <h4 className="mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
                      ? "scale-[1.02] shadow-lg ring-2 shadow-cyan-100 ring-cyan-500"
                      : "hover:border-slate-300"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${colors.text} border border-slate-200 bg-white`}
                    >
                      {node.nodeType}
                    </span>
                    {node.confidence !== undefined && node.confidence !== null && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {Math.round(node.confidence * 100)}% Conf
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-slate-900">{node.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Details & Justification Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Relationship &amp; Justification Inspector
          </h4>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="font-mono text-[10px] text-cyan-600 uppercase">
                  {selectedNode.nodeType}
                </span>
                <h5 className="mt-1 text-sm font-bold text-slate-900">{selectedNode.label}</h5>
              </div>

              <div>
                <h6 className="mb-2 text-xs font-semibold text-slate-700">
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
                          className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
                        >
                          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-cyan-700">
                            <span>{isSource ? "OUTGOING ->" : "<- INCOMING"}</span>
                            <span className="rounded border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 text-cyan-700">
                              {edge.edgeType}
                            </span>
                            <span className="text-slate-500">
                              to {otherNode?.label || otherNodeId}
                            </span>
                          </div>
                          <p className="mt-1.5 border-l-2 border-cyan-400 pl-2 text-[11px] leading-relaxed text-slate-700 italic">
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
