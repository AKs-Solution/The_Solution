"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QueryError } from "@/components/ui/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { TypeBadge } from "./type-badge";

interface RelatedEntity {
  id: string;
  identifier: string;
  name: string;
  entityType: string;
}

interface Relationship {
  id: string;
  relationshipType: string;
  sourceEntity: RelatedEntity;
  targetEntity: RelatedEntity;
  createdAt: string;
  createdBy: { id: string; name: string | null } | null;
}

interface RelationshipOverviewProps {
  entityId: string;
}

async function fetchRelationships(
  entityId: string,
): Promise<{ incoming: Relationship[]; outgoing: Relationship[] } | null> {
  try {
    const res = await fetch(`/api/engineering/entities/${entityId}`);
    if (!res.ok) return null;
    const json = await res.json();
    const entity = json.data;
    return {
      incoming: entity.targetRelationships ?? [],
      outgoing: entity.sourceRelationships ?? [],
    };
  } catch {
    return null;
  }
}

const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  DEPENDS_ON: "Depends On",
  CONTAINS: "Contains",
  IMPLEMENTS: "Implements",
  VERIFIES: "Verifies",
  REFERENCES: "References",
  MANUFACTURED_BY: "Manufactured By",
  SUPPLIED_BY: "Supplied By",
  TESTED_BY: "Tested By",
  CERTIFIED_BY: "Certified By",
  DERIVED_FROM: "Derived From",
  SUPERSEDES: "Supersedes",
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  DEPENDS_ON: "border-l-amber-400",
  CONTAINS: "border-l-blue-400",
  IMPLEMENTS: "border-l-green-400",
  VERIFIES: "border-l-cyan-400",
  REFERENCES: "border-l-gray-400",
  MANUFACTURED_BY: "border-l-purple-400",
  SUPPLIED_BY: "border-l-pink-400",
  TESTED_BY: "border-l-orange-400",
  CERTIFIED_BY: "border-l-teal-400",
  DERIVED_FROM: "border-l-indigo-400",
  SUPERSEDES: "border-l-red-400",
};

export function RelationshipOverview({ entityId }: RelationshipOverviewProps) {
  const [incoming, setIncoming] = useState<Relationship[]>([]);
  const [outgoing, setOutgoing] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [relType, setRelType] = useState("REFERENCES");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      const result = await fetchRelationships(entityId);
      if (cancelled) return;
      if (!result) {
        setLoadError("Failed to load relationships for this entity.");
        setIsLoading(false);
        return;
      }
      setIncoming(result.incoming);
      setOutgoing(result.outgoing);
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [entityId, reloadKey]);

  async function refresh() {
    const result = await fetchRelationships(entityId);
    if (result) {
      setIncoming(result.incoming);
      setOutgoing(result.outgoing);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/engineering/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceEntityId: entityId,
          targetEntityId: targetId,
          relationshipType: relType,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to create relationship");
        return;
      }
      setShowCreate(false);
      setTargetId("");
      await refresh();
    } catch {
      setError("An unexpected error occurred");
    }
  }

  async function handleDelete(relId: string) {
    if (!confirm("Remove this relationship?")) return;
    try {
      await fetch(`/api/engineering/relationships/${relId}`, { method: "DELETE" });
      await refresh();
    } catch {
      // silently fail
    }
  }

  function RelationshipRow({
    rel,
    direction,
  }: {
    rel: Relationship;
    direction: "incoming" | "outgoing";
  }) {
    const related = direction === "incoming" ? rel.sourceEntity : rel.targetEntity;
    const colorClass = RELATIONSHIP_COLORS[rel.relationshipType] ?? "border-l-gray-400";

    return (
      <div className={`border-l-4 ${colorClass} flex items-center justify-between px-4 py-3`}>
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded text-xs font-medium">
            {related.identifier.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-medium">{related.name}</span>
              <span className="text-muted-foreground text-xs">{related.identifier}</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeBadge type={related.entityType} />
              <span className="text-muted-foreground text-xs">
                {RELATIONSHIP_TYPE_LABELS[rel.relationshipType] ?? rel.relationshipType}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleDelete(rel.id)}
          className="text-muted-foreground hover:text-destructive p-1"
          title="Remove relationship"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {loadError ? (
        <QueryError
          title="Couldn't load relationships"
          message={loadError}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              Relationships ({incoming.length + outgoing.length})
            </h2>
            <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="mr-1.5 size-4" />
              Add relationship
            </Button>
          </div>

          {showCreate && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleCreate} className="flex flex-col gap-3">
                  {error && (
                    <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-muted-foreground text-xs font-medium">
                        Target entity ID
                      </label>
                      <input
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder="Entity ID..."
                        className="border-border rounded-md border px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-muted-foreground text-xs font-medium">
                        Relationship type
                      </label>
                      <select
                        value={relType}
                        onChange={(e) => setRelType(e.target.value)}
                        className="border-border rounded-md border px-3 py-2 text-sm"
                      >
                        {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" size="sm" className="mt-5">
                      Create
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : incoming.length === 0 && outgoing.length === 0 ? (
            <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Share2 className="text-muted-foreground mb-3 size-10" />
              <p className="text-muted-foreground text-sm">No relationships yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {outgoing.length > 0 && (
                <div>
                  <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                    Outgoing ({outgoing.length})
                  </h3>
                  <div className="divide-border divide-y rounded-lg border">
                    {outgoing.map((rel) => (
                      <RelationshipRow key={rel.id} rel={rel} direction="outgoing" />
                    ))}
                  </div>
                </div>
              )}

              {incoming.length > 0 && (
                <div>
                  <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                    Incoming ({incoming.length})
                  </h3>
                  <div className="divide-border divide-y rounded-lg border">
                    {incoming.map((rel) => (
                      <RelationshipRow key={rel.id} rel={rel} direction="incoming" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Share2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
