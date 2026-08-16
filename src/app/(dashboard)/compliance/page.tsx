/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
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

export default function CompliancePage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const entRes = await fetch("/api/engineering/entities?pageSize=50");
      if (entRes.ok) {
        const entJson = await entRes.json();
        setEntities(entJson.data || []);
      } else {
        setEntities([]);
      }
    } catch (err) {
      console.error(err);
      setEntities([]);
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
        title="Compliance"
        subtitle="Components in this workspace and their certification posture."
        action={
          <Button
            variant="secondary"
            className="h-9"
            onClick={() => void fetchData()}
            disabled={isLoading}
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : entities.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-5" />}
          title="No components yet"
          description="Entities ingested into this workspace will appear here for certification review."
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
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell className="font-medium text-slate-900">{entity.name}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {entity.entityType || entity.identifier || "—"}
                </TableCell>
                <TableCell>
                  <StatusPill status="RECORDED" />
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {formatWhen(entity.updatedAt || entity.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/entities/${entity.id}`}
                    className="text-sm font-medium text-zinc-900 no-underline hover:underline"
                  >
                    View details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
