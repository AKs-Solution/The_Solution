"use client";

import { DecisionTreeNode } from "@/server/reasoning/types";

interface Props {
  tree: DecisionTreeNode | null;
}

export function DecisionTreeViewer({ tree }: Props) {
  if (!tree) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 italic">
        No decision tree data available for this reasoning session.
      </div>
    );
  }

  const renderNode = (node: DecisionTreeNode, depth = 0) => {
    const statusColor =
      node.status === "PASSED" || node.status === "SELECTED"
        ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
        : node.status === "FAILED"
          ? "border-rose-500/50 bg-rose-950/30 text-rose-300"
          : "border-slate-800 bg-slate-900/60 text-slate-400";

    return (
      <div key={node.id} className="space-y-3" style={{ marginLeft: `${depth * 20}px` }}>
        <div className={`p-4 rounded-xl border ${statusColor} space-y-1.5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              {node.nodeType}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-current">
              {node.status}
            </span>
          </div>
          <h5 className="text-xs font-bold text-slate-100">{node.label}</h5>
          <p className="text-[11px] text-slate-300 leading-relaxed">{node.details}</p>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-slate-800 pl-3 space-y-3">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Hierarchical Engineering Decision Tree
        </h4>
        <span className="text-[11px] font-mono text-cyan-400">Interactive Tree View</span>
      </div>
      {renderNode(tree)}
    </div>
  );
}
