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
          <Button
            as="a"
            href="/drawings/new"
            className="h-9 bg-zinc-900 px-4 text-sm text-zinc-50 hover:bg-zinc-800"
          >
            <Plus className="mr-1.5 size-3.5" />
            New drawing
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
          Loading drawings...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No drawings yet"
          description="Create a project to start comparing revisions."
          action={
            <Button
              as="a"
              href="/drawings/new"
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
            >
              New drawing
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
                  <TableCell className="font-medium text-zinc-900">{name}</TableCell>
                  <TableCell className="text-zinc-500">{row.projectName || "Drawing"}</TableCell>
                  <TableCell>
                    <StatusPill status={row.status || "RECORDED"} />
                  </TableCell>
                  <TableCell className="text-zinc-500">
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
