/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  PAGE_PRIMARY_ACTION_CLASS,
  useWorkspaceTabs,
} from "@/components/layout";
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
  TableSkeleton,
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
          <Button as="a" href="/decisions/new" className={PAGE_PRIMARY_ACTION_CLASS}>
            <Plus className="mr-1.5 size-3.5" />
            Propose decision
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : decisions.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No decisions yet"
          description="Propose a decision to start the audit trail for this workspace."
          action={
            <Button as="a" href="/decisions/new" className={PAGE_PRIMARY_ACTION_CLASS}>
              + Create First Record
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
                  <TableCell className="font-medium text-slate-900">{name}</TableCell>
                  <TableCell className="text-slate-500">
                    {String(system).replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={d.epistemicStatus || "RECORDED"} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
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
