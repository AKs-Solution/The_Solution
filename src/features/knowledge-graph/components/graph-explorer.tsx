"use client";

import { useState, useEffect } from "react";
import { GraphViewer } from "./graph-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import { Select } from "@/components/ui/select";
import { ENTITY_TYPE_LABELS } from "@/server/engineering/constants";
import { ENTITY_TYPES } from "@/server/engineering/constants";

interface GraphNode {
  id: string;
  entityId: string;
  label: string;
  entityType: string;
  status: string;
}

interface GraphEdge {
  id: string;
  relationshipType: string;
  sourceNode: { id: string };
  targetNode: { id: string };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: { nodes: number; edges: number };
}

async function fetchGraphData(entityType: string): Promise<GraphData | null> {
  try {
    const params = new URLSearchParams({ limit: "200" });
    if (entityType) params.set("entityType", entityType);
    const res = await fetch(`/api/knowledge-graph/subgraph?${params}`);
    if (!res.ok) return null;
    const json = await res.json();

    const statsRes = await fetch("/api/knowledge-graph/nodes?pageSize=1");
    const statsJson = statsRes.ok ? await statsRes.json() : null;

    return {
      nodes: json.data.nodes,
      edges: json.data.edges,
      stats: { nodes: statsJson?.stats?.nodes ?? 0, edges: statsJson?.stats?.edges ?? 0 },
    };
  } catch {
    return null;
  }
}

export function GraphExplorer() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [entityType, setEntityType] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<
    { type: "node"; data: GraphNode } | { type: "edge"; data: GraphEdge } | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError("");
      const result = await fetchGraphData(entityType);
      if (cancelled) return;
      if (result) {
        setNodes(result.nodes);
        setEdges(result.edges);
        setStats(result.stats);
      } else {
        setError("Failed to load the knowledge graph. Please try again.");
      }
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [entityType]);

  async function refresh() {
    setIsLoading(true);
    setError("");
    const result = await fetchGraphData(entityType);
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      setStats(result.stats);
    } else {
      setError("Failed to load the knowledge graph. Please try again.");
    }
    setIsLoading(false);
  }

  const typeOptions = [
    { value: "", label: "All types" },
    ...ENTITY_TYPES.map((t) => ({ value: t, label: ENTITY_TYPE_LABELS[t] ?? t })),
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            options={typeOptions}
          />
          <button
            onClick={refresh}
            className="text-primary hover:text-primary/80 text-sm underline underline-offset-2"
          >
            Refresh
          </button>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span>{stats.nodes} nodes</span>
          <span>{stats.edges} edges</span>
        </div>
      </div>

      <div className="relative flex flex-1 gap-4">
        <div className="relative flex-1">
          {isLoading ? (
            <div className="flex size-full items-center justify-center rounded-lg border">
              <Skeleton className="size-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="flex size-full items-center justify-center rounded-lg border">
              <QueryError message={error} onRetry={() => void refresh()} />
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex size-full items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground mb-1 text-sm">No graph data</p>
                <p className="text-muted-foreground text-xs">
                  Sync engineering entities to build the graph
                </p>
              </div>
            </div>
          ) : (
            <GraphViewer
              nodes={nodes}
              edges={edges}
              onNodeClick={(node) => setSelectedInfo({ type: "node", data: node })}
              onEdgeClick={(edge) => setSelectedInfo({ type: "edge", data: edge })}
            />
          )}
        </div>

        {selectedInfo && (
          <div className="border-border bg-background w-72 shrink-0 rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{selectedInfo.type}</h3>
              <button
                onClick={() => setSelectedInfo(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>
            {selectedInfo.type === "node" && (
              <div className="flex flex-col gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Label</span>
                  <span className="font-medium">{selectedInfo.data.label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Type</span>
                  <span>
                    {ENTITY_TYPE_LABELS[selectedInfo.data.entityType] ??
                      selectedInfo.data.entityType}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Status</span>
                  <span>{selectedInfo.data.status}</span>
                </div>
              </div>
            )}
            {selectedInfo.type === "edge" && (
              <div className="flex flex-col gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Type</span>
                  <span className="font-medium">
                    {selectedInfo.data.relationshipType.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
