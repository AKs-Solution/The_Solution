"use client";

import { useState } from "react";
import { Search, ShieldCheck, Hash, User, ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { AuditExplorerView, AuditLineageNode } from "@/server/compliance/audit-explorer-engine";

interface AuditExplorerViewProps {
  auditView: AuditExplorerView;
}

export function AuditExplorerViewComponent({ auditView }: AuditExplorerViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [auditView.lineageTree.id]: true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: AuditLineageNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-2" style={{ paddingLeft: `${depth * 16}px` }}>
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-100 p-3 transition-all hover:border-zinc-200">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-0.5 text-zinc-500 hover:text-zinc-900"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-400">
              {node.type}
            </span>
            <span className="text-sm font-semibold text-zinc-900">{node.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-xs text-zinc-500">
              <User className="h-3 w-3" /> {node.author}
            </span>
            <span className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-xs text-emerald-400">
              <Hash className="h-3 w-3" /> {node.evidenceHash.slice(0, 12)}...
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4 space-y-2 border-l border-zinc-200 pl-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 rounded-xl border border-zinc-200 bg-white p-6 font-sans text-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Dedicated Auditor Explorer Mode
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Navigate evidence lineage tree, inspect decision replay, and verify SHA-256 evidence
            integrity proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-500">
            <FileCode className="h-3.5 w-3.5 text-indigo-400" /> Session:{" "}
            {auditView.auditSessionId.slice(0, 16)}...
          </span>
        </div>
      </div>

      {/* Target Entity Summary */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-100 p-4">
        <div>
          <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Audited Target Component
          </div>
          <div className="mt-0.5 text-base font-bold text-zinc-900">
            {auditView.targetEntityName}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div>
            <strong className="text-zinc-900">{auditView.decisionReplayCount}</strong> Decisions
            Replayed
          </div>
          <div>
            <strong className="text-zinc-900">{auditView.assumptionsEvaluated}</strong> Assumptions
            Evaluated
          </div>
          <div className="flex items-center gap-1 font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Proof Verified
          </div>
        </div>
      </div>

      {/* Lineage Tree Explorer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-500 uppercase">
            <Search className="h-3.5 w-3.5 text-indigo-400" /> End-to-End Evidence Lineage Tree
          </h3>
        </div>

        {renderNode(auditView.lineageTree)}
      </div>
    </div>
  );
}
