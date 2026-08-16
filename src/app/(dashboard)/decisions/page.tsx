/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, useWorkspaceTabs } from "@/components/layout";
import {
  Button,
  EmptyState,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

function formatWhen(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function DecisionAuditTrailPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openTab } = useWorkspaceTabs();

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const json = await res.json();
        setDecisions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial list fetch
    void fetchDecisions();
  }, [fetchDecisions]);

  return (
    <PageContainer>
      <PageHeader
        title="Decisions"
        subtitle="Engineering intent, approvals, and outcomes for this workspace."
        action={
          <Button
            as="a"
            href="/decisions/new"
            className="h-9 bg-zinc-900 px-4 text-sm text-zinc-50 hover:bg-zinc-800"
          >
            <Plus className="mr-1.5 size-3.5" />
            Propose decision
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
          Loading decisions...
        </div>
      ) : decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          description="Propose a decision to start the audit trail for this workspace."
          action={
            <Button
              as="a"
              href="/decisions/new"
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
            >
              Propose decision
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {decisions.map((d) => {
              const name = d.description || d.question || "Untitled decision";
              const system = d.decisionType || d.status || "Engineering";
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-zinc-900">{name}</TableCell>
                  <TableCell className="text-zinc-500">
                    {String(system).replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={d.epistemicStatus || "RECORDED"} />
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {formatWhen(d.createdAt || d.proposedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/decisions/${d.id}`}
                      onClick={() =>
                        openTab({
                          kind: "decision",
                          ref: d.id,
                          title: name,
                          href: `/decisions/${d.id}`,
                        })
                      }
                      className="text-sm font-medium text-zinc-900 no-underline hover:underline"
                    >
                      View details
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
