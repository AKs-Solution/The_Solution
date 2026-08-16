/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Search,
  Sliders,
} from "lucide-react";
import { PageContainer, SplitLayout, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";
import DrawingViewer from "@/components/viewer/DrawingViewer";

export default function ComparisonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<any | null>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  // View modes
  const [activeTab, setActiveTab] = useState<"vector-canvas" | "raw-pdf">("vector-canvas");
  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay" | "heatmap">("side-by-side");
  const [opacity, setOpacity] = useState(0.5);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drawings/comparisons/${id}`);
      if (res.ok) {
        const json = await res.json();
        setJob(json.data);
        setChanges(json.data?.changes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Export CSV
  const handleExportCSV = () => {
    if (!job) return;
    const headers =
      "Change Type,Category,Description,Old Value,New Value,Manufacturing Considerations,Inspection Considerations\n";
    const rows = changes
      .map(
        (c) =>
          `"${c.changeType}","${c.category}","${c.description}","${c.oldValue || ""}","${c.newValue || ""}","${c.manufacturingImpact || ""}","${c.qualityImpact || ""}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Drawing_Comparison_${id.substring(0, 8)}_Changes.csv`;
    link.click();
  };

  // Filter logic
  const filteredChanges = changes.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      (c.oldValue && c.oldValue.toLowerCase().includes(query)) ||
      (c.newValue && c.newValue.toLowerCase().includes(query));

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p>Drawing Comparison job not found.</p>
      </div>
    );
  }

  const dimsCount = changes.filter((c) => c.changeType === "DIMENSION").length;

  return (
    <PageContainer className="bg-white">
      <Stack gap={6}>
        {/* HEADER BAR */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/drawings" className="flex items-center gap-1 hover:text-slate-300">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-600">Revision Comparison</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                  Revision Change Analysis
                </h1>
                <Badge variant="secondary" className="border-slate-700 bg-slate-100 text-slate-600">
                  Job ID: {job.id.substring(0, 8)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Comparing revision sheets:{" "}
                <span className="font-semibold text-slate-600">{job.revA?.revisionLabel}</span> vs{" "}
                <span className="font-semibold text-slate-600">{job.revB?.revisionLabel}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleExportCSV}
                variant="secondary"
                size="sm"
                className="border-slate-200 bg-slate-100 hover:bg-slate-100"
              >
                <FileSpreadsheet className="mr-2 size-4" /> Export CSV
              </Button>
              <Button
                onClick={() => window.print()}
                variant="secondary"
                size="sm"
                className="border-slate-200 bg-slate-100 hover:bg-slate-100"
              >
                <Printer className="mr-2 size-4" /> Print PDF Report
              </Button>
            </div>
          </div>
        </div>

        {/* ANALYTICS BANNER */}
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          <Card className="border-slate-200 bg-slate-100/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-500">
                <AlertTriangle className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Total Changes Detected
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {changes.length} Changes
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-100/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-600">
                <FileText className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Dimension Changes
                </span>
                <span className="text-2xl font-extrabold text-indigo-600">
                  {dimsCount} dimensions
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-100/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                <span className="text-2xl font-extrabold text-emerald-600">Ready</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Button
            onClick={() => setActiveTab("vector-canvas")}
            className={`h-9 px-4 text-xs font-semibold ${activeTab === "vector-canvas" ? "bg-indigo-600 text-slate-900 hover:bg-indigo-700" : "bg-slate-100 text-slate-600"}`}
          >
            Interactive Workspace
          </Button>
          <Button
            onClick={() => setActiveTab("raw-pdf")}
            className={`h-9 px-4 text-xs font-semibold ${activeTab === "raw-pdf" ? "bg-indigo-600 text-slate-900 hover:bg-indigo-700" : "bg-slate-100 text-slate-600"}`}
          >
            Raw PDF Sheets
          </Button>
        </div>

        {/* WORKSPACE LAYOUT */}
        {activeTab === "vector-canvas" ? (
          <SplitLayout ratio="2:1">
            {/* LEFT: INTERACTIVE VIEWER */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100/60 p-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setViewMode("side-by-side")}
                    className={`h-9 px-4 text-xs font-semibold ${viewMode === "side-by-side" ? "bg-indigo-600 text-slate-900 hover:bg-indigo-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    Side-by-Side
                  </Button>
                  <Button
                    onClick={() => setViewMode("overlay")}
                    className={`h-9 px-4 text-xs font-semibold ${viewMode === "overlay" ? "bg-indigo-600 text-slate-900 hover:bg-indigo-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    Overlay Blend
                  </Button>
                  <Button
                    onClick={() => setViewMode("heatmap")}
                    className={`h-9 px-4 text-xs font-semibold ${viewMode === "heatmap" ? "bg-indigo-600 text-slate-900 hover:bg-indigo-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    Diff Heatmap
                  </Button>
                </div>

                {viewMode === "overlay" && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Sliders className="size-4 text-slate-500" />
                    <span>Opacity:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-slate-700"
                    />
                    <span className="w-8 font-semibold text-slate-600">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <DrawingViewer
                fileA={job.revA?.fileUrl}
                fileB={job.revB?.fileUrl}
                changes={filteredChanges}
                selectedChangeId={selectedChangeId}
                onSelectChange={setSelectedChangeId}
                viewMode={viewMode}
                opacity={opacity}
              />
            </div>

            {/* RIGHT: SEARCH, FILTERS & CHANGE LEDGER */}
            <div className="flex flex-col gap-4">
              <span className="text-left text-xs font-bold tracking-wider text-slate-500 uppercase">
                Drawing Change Ledger
              </span>

              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dimensions, notes, materials..."
                  className="h-10 border-slate-200 bg-slate-100 pl-9 text-sm"
                />
              </div>

              {/* CHANGE DETAILS LIST */}
              <div className="flex max-h-[580px] flex-col gap-3 overflow-y-auto pr-1">
                {filteredChanges.length > 0 ? (
                  filteredChanges.map((c) => {
                    const isSelected = selectedChangeId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedChangeId(c.id)}
                        className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/[0.02]"
                            : "border-slate-200 bg-slate-100/40 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {c.changeType}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{c.category}</h4>
                          </div>
                          <Badge variant="destructive">{c.actionType}</Badge>
                        </div>

                        <p className="text-xs leading-normal text-slate-500">{c.description}</p>

                        <Divider className="border-slate-200" />

                        <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs">
                          <div>
                            <span className="mb-0.5 block text-[9px] text-slate-500 uppercase">
                              Revision A
                            </span>
                            <span className="text-slate-500 line-through">
                              {c.oldValue || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="mb-0.5 block text-[9px] text-slate-500 uppercase">
                              Revision B
                            </span>
                            <span className="font-bold text-indigo-600">{c.newValue || "N/A"}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="animate-in fade-in mt-1 flex flex-col gap-2 text-xs duration-200">
                            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                              <span className="mb-1 block font-bold text-indigo-600">
                                Potential Manufacturing Considerations:
                              </span>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                {c.manufacturingImpact || "Unable to determine."}
                              </p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                              <span className="mb-1 block font-bold text-emerald-600">
                                Potential Quality Considerations:
                              </span>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                {c.qualityImpact || "Unable to determine."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No drawing changes detected.
                  </div>
                )}
              </div>
            </div>
          </SplitLayout>
        ) : (
          /* RAW PDF SHEETS EMBEDS */
          <div className="grid h-[650px] w-full grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-slate-100 p-4 lg:grid-cols-2">
            <div className="flex h-full flex-col gap-2">
              <span className="text-left text-xs font-bold tracking-wider text-slate-500 uppercase">
                Revision {job.revA?.revisionLabel} File
              </span>
              <embed
                src={job.revA?.fileUrl}
                type="application/pdf"
                className="h-full w-full rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex h-full flex-col gap-2">
              <span className="text-left text-xs font-bold tracking-wider text-slate-500 uppercase">
                Revision {job.revB?.revisionLabel} File
              </span>
              <embed
                src={job.revB?.fileUrl}
                type="application/pdf"
                className="h-full w-full rounded-xl border border-slate-200"
              />
            </div>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
