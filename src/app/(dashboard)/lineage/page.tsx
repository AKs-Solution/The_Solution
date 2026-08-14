/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useState, useEffect, useCallback } from "react";
import { GitBranch, Search } from "lucide-react";
import { LineageGraph } from "@/components/LineageGraph";
import { GraphNode, GraphEdge } from "@/server/lineage/lineage-service";

export default function LineageExplorerPage() {
  const [recordId, setRecordId] = useState("proj-demo-001");
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLineage = useCallback(async (idToFetch: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lineage/record/${idToFetch}`);
      const json = await res.json();
      if (json.data) {
        setNodes(json.data.nodes || []);
        setEdges(json.data.edges || []);
      }
    } catch (err) {
      console.error("Failed to fetch lineage graph:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLineage(recordId);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (recordId) fetchLineage(recordId);
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900">
            <GitBranch className="h-6 w-6 text-indigo-600" /> Lineage & Dependency Graph Explorer
          </h1>
          <p className="text-sm text-zinc-500">
            Multi-hop graph visualization of parts, suppliers, decisions, and failure modes
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="Enter Record / Part / Assessment ID..."
            className="w-64 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Search className="h-3.5 w-3.5" /> Explore Lineage
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-sm text-zinc-500">
          Tracing dependency network...
        </div>
      ) : (
        <LineageGraph nodes={nodes} edges={edges} />
      )}
    </div>
  );
}
