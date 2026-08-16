"use client";

import { useState } from "react";
import { GraphNode, GraphEdge } from "@/server/lineage/lineage-service";

interface LineageGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function LineageGraph({ nodes, edges }: LineageGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0] || null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredEdges = edges.filter((e) => filterType === "ALL" || e.relationship === filterType);

  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "part":
        return "bg-blue-500/20 border-blue-500 text-blue-600";
      case "supplier":
        return "bg-rose-500/20 border-rose-500 text-rose-600";
      case "failure":
        return "bg-amber-500/20 border-amber-500 text-amber-600";
      case "decision":
        return "bg-emerald-500/20 border-emerald-500 text-emerald-600";
      case "assessment":
        return "bg-purple-500/20 border-purple-500 text-purple-600";
      default:
        return "bg-slate-100 border-slate-300 text-slate-600";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Dependency & Provenance Lineage Graph
          </h3>
          <p className="text-xs text-slate-500">
            Traceable evidence relationships from records to downstream assessments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Relationship:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Relationships</option>
            <option value="supplied_by">Supplied By</option>
            <option value="caused_by">Caused By</option>
            <option value="informs">Informs</option>
            <option value="assesses">Assesses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Node Matrix Canvas */}
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-100 p-6 lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-all hover:scale-[1.02] ${getNodeColor(
                    node.type,
                  )} ${isSelected ? "shadow-lg ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                      {node.type}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{node.label}</span>
                  <span className="font-mono text-[10px] text-slate-500">{node.id}</span>
                </button>
              );
            })}
          </div>

          {/* Edge Connector Summary */}
          <div className="mt-4 flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs font-semibold text-slate-600">
              Edge Relationships ({filteredEdges.length})
            </span>
            <div className="flex flex-col gap-1 font-mono text-xs text-slate-500">
              {filteredEdges.map((edge, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-indigo-600">{edge.source}</span>
                  <span>──────({edge.relationship})──────►</span>
                  <span className="text-emerald-600">{edge.target}</span>
                  <span className="ml-auto font-sans text-[10px] text-amber-600">
                    Confidence: {(edge.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Node Details Inspector */}
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-100 p-6">
          <h4 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
            Node Inspector
          </h4>
          {selectedNode ? (
            <div className="flex flex-col gap-3 text-xs text-slate-600">
              <div>
                <span className="block text-slate-500">ID:</span>
                <span className="font-mono text-indigo-600">{selectedNode.id}</span>
              </div>
              <div>
                <span className="block text-slate-500">Type:</span>
                <span className="font-bold tracking-wide text-slate-700 uppercase">
                  {selectedNode.type}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Label:</span>
                <span className="text-sm font-semibold text-slate-900">{selectedNode.label}</span>
              </div>
              {selectedNode.metadata && (
                <div>
                  <span className="mb-1 block text-slate-500">Metadata:</span>
                  <pre className="overflow-x-auto rounded border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-600">
                    {JSON.stringify(selectedNode.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Select any node on the graph to inspect metadata
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
