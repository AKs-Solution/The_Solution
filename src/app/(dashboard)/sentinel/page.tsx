"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Activity } from "lucide-react";
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
  TableSkeleton,
} from "@/components/ui";

interface SentinelAlert {
  id: string;
  title: string;
  type: string;
  reason: string;
  timestamp: string;
}

interface SentinelDashboard {
  realtimeAlerts?: SentinelAlert[];
}

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function SentinelPage() {
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openTab } = useWorkspaceTabs();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sentinel/executive-dashboard");
      if (res.ok) {
        const json = await res.json();
        const dashboard = (json.dashboard ?? json.data ?? null) as SentinelDashboard | null;
        setAlerts(dashboard?.realtimeAlerts ?? []);
      } else {
        setAlerts([]);
      }
    } catch {
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial list fetch
    void loadData();
  }, [loadData]);

  return (
    <PageContainer>
      <PageHeader
        title="Sentinel"
        subtitle="Active alerts for this workspace."
        action={
          <Button
            variant="secondary"
            className="h-9"
            onClick={() => void loadData()}
            disabled={isLoading}
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<Activity className="size-5" />}
          title="No alerts"
          description="When surveillance finds a deviation, it will appear here."
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
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium text-slate-900">{alert.title}</TableCell>
                <TableCell className="text-slate-500">{alert.type.replaceAll("_", " ")}</TableCell>
                <TableCell>
                  <StatusPill status="INFERRED" />
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {formatWhen(alert.timestamp)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/sentinel/${alert.id}`}
                    onClick={() =>
                      openTab({
                        kind: "sentinel",
                        ref: alert.id,
                        title: alert.title,
                        href: `/sentinel/${alert.id}`,
                      })
                    }
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
