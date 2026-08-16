/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";
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

export default function DrawingsDashboardPage() {
  const { openTab } = useWorkspaceTabs();
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const pRes = await fetch("/api/drawings/projects");
      const projects = pRes.ok ? ((await pRes.json()).data ?? []) : [];
      const comparisons: any[] = [];
      for (const project of projects) {
        const cRes = await fetch(`/api/drawings/comparisons?projectId=${project.id}`);
        const comps = cRes.ok ? ((await cRes.json()).data ?? []) : [];
        for (const comparison of comps) {
          comparisons.push({
            ...comparison,
            projectName: project.name,
          });
        }
      }
      setRows(comparisons);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial list fetch
    void fetchData();
  }, [fetchData]);

  return (
    <PageContainer>
      <PageHeader
        title="Drawings"
        subtitle="Revision comparisons for this workspace."
        action={
          <Button as="a" href="/drawings/new" className={PAGE_PRIMARY_ACTION_CLASS}>
            <Plus className="mr-1.5 size-3.5" />
            New drawing
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Layers className="size-5" />}
          title="No drawings yet"
          description="This workspace has no drawing projects. Start here by creating a project and comparing revisions."
          action={
            <Button as="a" href="/drawings/new" className={PAGE_PRIMARY_ACTION_CLASS}>
              <Plus className="mr-1.5 size-3.5" />
              Upload first drawing
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
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const href = `/drawings/${row.id}`;
              const name =
                row.name ||
                [row.revA?.drawingNumber, row.revB?.revisionLabel].filter(Boolean).join(" → ") ||
                `Comparison ${String(row.id).slice(0, 8)}`;
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-900">{name}</TableCell>
                  <TableCell className="text-slate-500">{row.projectName || "Drawing"}</TableCell>
                  <TableCell>
                    <StatusPill status={row.status || "RECORDED"} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {formatWhen(row.createdAt || row.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={href}
                      onClick={() =>
                        openTab({
                          kind: "drawing",
                          ref: row.id,
                          title: name,
                          href,
                        })
                      }
                      className="text-sm font-medium text-slate-900 no-underline hover:underline"
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
