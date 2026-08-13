"use client";

import { DecisionTreeNode } from "@/server/reasoning/types";

interface Props {
  tree: DecisionTreeNode | null;
}

export function DecisionTreeViewer({ tree }: Props) {
  if (!tree) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 italic">
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
          : "border-zinc-200 bg-white text-zinc-500";

    return (
      <div key={node.id} className="space-y-3" style={{ marginLeft: `${depth * 20}px` }}>
        <div className={`rounded-xl border p-4 ${statusColor} space-y-1.5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-cyan-400 uppercase">
              {node.nodeType}
            </span>
            <span className="rounded border border-current px-2 py-0.5 text-[10px] font-bold uppercase">
              {node.status}
            </span>
          </div>
          <h5 className="text-xs font-bold text-zinc-900">{node.label}</h5>
          <p className="text-[11px] leading-relaxed text-zinc-700">{node.details}</p>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="space-y-3 border-l-2 border-zinc-200 pl-3">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          Hierarchical Engineering Decision Tree
        </h4>
        <span className="font-mono text-[11px] text-cyan-400">Interactive Tree View</span>
      </div>
      {renderNode(tree)}
    </div>
  );
}
