"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportTypeBadge } from "./report-type-badge";

interface ReportPayload {
  summary: Record<string, number | string>;
  columns: string[];
  rows: Record<string, unknown>[];
  generatedAt: string;
}

interface ReportDetail {
  id: string;
  type: string;
  title: string;
  isFavorite: boolean;
  data: ReportPayload;
  createdAt: string;
}

const EXPORT_FORMATS = ["CSV", "JSON", "EXCEL", "PDF"] as const;

export function ReportViewer({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState("");
  const [exportNote, setExportNote] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/reporting/reports/${reportId}`);
        const json = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? "Failed to load report");
          return;
        }
        if (!cancelled) setReport(json.data);
      } catch {
        if (!cancelled) setError("Failed to load report");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  async function handleToggleFavorite() {
    const res = await fetch(`/api/reporting/reports/${reportId}/favorite`, { method: "POST" });
    if (res.ok) setReport(await res.json().then((j) => j.data));
  }

  async function handleDelete() {
    setIsDeleting(true);
    const res = await fetch(`/api/reporting/reports/${reportId}`, { method: "DELETE" });
    if (res.ok) router.push("/reports");
    else setIsDeleting(false);
  }

  async function handleExport(format: (typeof EXPORT_FORMATS)[number]) {
    setExportNote("");
    const res = await fetch(`/api/reporting/reports/${reportId}/export?format=${format}`);
    const contentType = res.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json") && format !== "JSON") {
      const json = await res.json();
      setExportNote(json.data?.architectureNote ?? "This export format is not yet implemented.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${reportId}.${format.toLowerCase() === "excel" ? "xls" : format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-16" />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = report;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">{report.title}</h1>
            <ReportTypeBadge type={report.type} />
          </div>
          <p className="text-muted-foreground text-xs">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToggleFavorite}>
            <Star
              className={`mr-1.5 size-4 ${report.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
            />
            {report.isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button variant="secondary" size="sm" disabled={isDeleting} onClick={handleDelete}>
            <Trash2 className="mr-1.5 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(data.summary).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">{key}</span>
              <span className="text-foreground text-lg font-semibold tabular-nums">
                {String(value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data ({data.rows.length} rows)</CardTitle>
            <div className="flex items-center gap-2">
              {EXPORT_FORMATS.map((format) => (
                <Button
                  key={format}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport(format)}
                >
                  <Download className="mr-1.5 size-3.5" />
                  {format}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exportNote && <p className="text-muted-foreground mb-3 text-xs">{exportNote}</p>}
          {data.rows.length === 0 ? (
            <EmptyState
              title="No rows"
              description="This report has no data for the given filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {data.columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => (
                  <TableRow key={`row-${index}`}>
                    {data.columns.map((col) => (
                      <TableCell key={col} className="text-foreground text-sm">
                        {String(row[col] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
