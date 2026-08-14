/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  FileText,
  ChevronRight,
  Layers,
  Folder,
  AlertTriangle,
  Cpu,
  Upload,
} from "lucide-react";
import {
  PageContainer,
  Stack,
  SubTabInspector,
  useScopedTabState,
  useWorkspaceTabs,
} from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";
import { DrawingRiskDashboard } from "@/features/drawings/components/drawing-risk-dashboard";
import { FusedDrawingRiskResult } from "@/server/drawings/rules/types";

export default function DrawingsDashboardPage() {
  const { openTab } = useWorkspaceTabs();
  const [activeTab, setActiveTab] = useScopedTabState<"RISK_ASSESSMENT" | "REVISION_COMPARE">(
    "drawings.activeTab",
    "RISK_ASSESSMENT",
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Risk Assessment state
  const [liveAssessment, setLiveAssessment] = useState<FusedDrawingRiskResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessFile, setAssessFile] = useState<File | null>(null);

  // New Project form state
  const [newProjectName, setNewProjectName] = useScopedTabState("drawings.newProjectName", "");
  const [newProjectDesc, setNewProjectDesc] = useScopedTabState("drawings.newProjectDesc", "");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // New Comparison form state
  const [drawingName, setDrawingName] = useScopedTabState("drawings.drawingName", "");
  const [revALabel, setRevALabel] = useScopedTabState("drawings.revALabel", "Rev A");
  const [revBLabel, setRevBLabel] = useScopedTabState("drawings.revBLabel", "Rev B");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const runDefaultAssessment = useCallback(async () => {
    setIsAssessing(true);
    try {
      const res = await fetch("/api/drawings/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: "AFT_BRACKET_1032_REV_B.pdf" }),
      });
      if (res.ok) {
        const json = await res.json();
        setLiveAssessment(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const fetchComparisons = useCallback(async (projId: string) => {
    try {
      const cRes = await fetch(`/api/drawings/comparisons?projectId=${projId}`);
      if (cRes.ok) {
        const cJson = await cRes.json();
        setComparisons(cJson.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const pRes = await fetch("/api/drawings/projects");
      if (pRes.ok) {
        const pJson = await pRes.json();
        setProjects(pJson.data || []);

        if (pJson.data && pJson.data.length > 0) {
          const defaultProjId = pJson.data[0].id;
          setSelectedProjectId(defaultProjId);
          await fetchComparisons(defaultProjId);
        }
      }
      await runDefaultAssessment();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load drawings data.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchComparisons, runDefaultAssessment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssessFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessFile) {
      setErrorMessage("Please select a technical drawing file to assess.");
      return;
    }
    setIsAssessing(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", assessFile);
      const res = await fetch("/api/drawings/assess", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        setLiveAssessment(json.data);
      } else {
        const errJson = await res.json();
        setErrorMessage(errJson.error || "Drawing risk assessment failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error uploading drawing for assessment.");
    } finally {
      setIsAssessing(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/drawings/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
      });
      if (res.ok) {
        setNewProjectName("");
        setNewProjectDesc("");
        await fetchData();
      } else {
        const errJson = await res.json();
        setErrorMessage(errJson.error || "Failed to create project.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error creating project.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingName || !fileA || !fileB || !selectedProjectId) {
      setErrorMessage("All fields and both files are required.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("projectId", selectedProjectId);
    formData.append("drawingName", drawingName);
    formData.append("revALabel", revALabel);
    formData.append("revBLabel", revBLabel);
    formData.append("fileA", fileA);
    formData.append("fileB", fileB);

    try {
      const res = await fetch("/api/drawings/comparisons", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDrawingName("");
        setFileA(null);
        setFileB(null);
        await fetchData();
        if (data.data?.id) {
          openTab({
            kind: "drawing",
            ref: data.data.id,
            title: drawingName || "Drawing Comparison",
            subtitle: "Revision Compare",
            href: `/drawings/comparisons/${data.data.id}`,
          });
        }
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Upload failed due to network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* BRANDING HEADER */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="size-7 text-indigo-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                    Engineering Drawing Intelligence
                  </h1>
                  <Badge className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[10px] text-indigo-700">
                    3-LAYER RISK ENGINE
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Multi-layered GD&T assessment, manufacturing rule engine, and historical precedent
                  risk fusion.
                </p>
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="border-border bg-background flex items-center gap-1 rounded-xl border p-1">
              <button
                type="button"
                onClick={() => setActiveTab("RISK_ASSESSMENT")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === "RISK_ASSESSMENT"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu className="size-4" /> 3-Layer Risk Engine
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("REVISION_COMPARE")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === "REVISION_COMPARE"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="size-4" /> CAD Revision Compare
              </button>
            </div>
          </div>
        </div>

        <SubTabInspector activeTab="overview" className="rounded-xl border border-zinc-200" />

        {/* ERROR BOX */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: 3-LAYER ENGINEERING RISK ASSESSMENT */}
        {activeTab === "RISK_ASSESSMENT" && (
          <div className="flex flex-col gap-6">
            {/* UPLOAD CUSTOM DRAWING BAR */}
            <Card className="border-zinc-200 bg-zinc-100">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <form
                  onSubmit={handleAssessFileUpload}
                  className="flex w-full items-center gap-3 sm:w-auto"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="size-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-zinc-600">
                      Upload Drawing PDF/STEP/DXF:
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setAssessFile(e.target.files?.[0] || null)}
                    className="rounded border border-zinc-200 bg-zinc-50 p-1 text-xs text-zinc-500"
                  />
                  <Button
                    type="submit"
                    disabled={isAssessing || !assessFile}
                    className="h-8 bg-indigo-600 px-3 text-xs font-bold text-zinc-900 hover:bg-indigo-700"
                  >
                    {isAssessing ? "Analyzing..." : "Analyze Drawing Risk"}
                  </Button>
                </form>

                <Button
                  onClick={runDefaultAssessment}
                  disabled={isAssessing}
                  variant="secondary"
                  size="sm"
                  className="h-8 border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-600"
                >
                  <RefreshCw className="mr-1.5 size-3" /> Re-run Sample Drawing (AFT_BRACKET_1032)
                </Button>
              </CardContent>
            </Card>

            {/* LIVE RISK DASHBOARD */}
            {isAssessing ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw className="mb-3 size-8 animate-spin text-indigo-500" />
                <p className="text-sm font-bold text-zinc-700">
                  Evaluating 3-Layer Manufacturing Risk Engine...
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Parsing GD&T controls, material heuristics, and historical precedents.
                </p>
              </div>
            ) : liveAssessment ? (
              <DrawingRiskDashboard assessment={liveAssessment} />
            ) : (
              <div className="py-20 text-center text-zinc-500">
                No active drawing assessment loaded.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REVISION COMPARISON */}
        {activeTab === "REVISION_COMPARE" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    Select Project
                  </span>
                  {projects.length > 0 && (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        fetchComparisons(e.target.value);
                      }}
                      className="rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {selectedProjectId && (
                  <Button
                    onClick={() => fetchComparisons(selectedProjectId)}
                    variant="secondary"
                    size="sm"
                    className="h-8 border-zinc-200 bg-zinc-100"
                  >
                    <RefreshCw className="mr-1.5 size-3" /> Refresh List
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <RefreshCw className="size-6 animate-spin text-zinc-500" />
                </div>
              ) : comparisons.length === 0 ? (
                <Card className="border-dashed border-zinc-200 bg-zinc-100 py-16 text-center">
                  <CardContent className="p-6">
                    <Folder className="mx-auto mb-3 size-8 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-500">
                      No revision comparison jobs yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {comparisons.map((c) => (
                    <Link
                      key={c.id}
                      href={`/drawings/${c.id}`}
                      onClick={() =>
                        openTab({
                          kind: "drawing",
                          ref: c.id,
                          title: `Drawing Inspection ${c.id.substring(0, 8)}`,
                          subtitle: c.status ?? "READY",
                          href: `/drawings/${c.id}`,
                        })
                      }
                      className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-100 p-5 text-left transition-all hover:border-zinc-400 hover:bg-zinc-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 text-zinc-500">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-indigo-600">
                            Comparison ID: {c.id.substring(0, 8)}
                          </h4>
                          <span className="mt-1 text-[10px] text-zinc-500">
                            Status:{" "}
                            <span
                              className={
                                c.status === "COMPLETED"
                                  ? "font-bold text-emerald-600"
                                  : "text-amber-600"
                              }
                            >
                              {c.status}
                            </span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-zinc-500 group-hover:text-indigo-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR FOR PROJECT CREATION & UPLOAD */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <Card className="border-zinc-200 bg-zinc-100">
                <CardContent className="p-6">
                  <form onSubmit={handleCreateProject}>
                    <Stack gap={4}>
                      <h3 className="text-sm font-extrabold text-zinc-900">Create New Project</h3>
                      <Divider className="border-zinc-200" />
                      <Input
                        required
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Project Name"
                        className="h-10 border-zinc-200 bg-zinc-50 text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={isCreatingProject}
                        className="h-10 bg-indigo-600 text-xs font-semibold text-zinc-900 uppercase"
                      >
                        {isCreatingProject ? "Creating..." : "Create Project"}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>

              {projects.length > 0 && (
                <Card className="border-zinc-200 bg-zinc-100">
                  <CardContent className="p-6">
                    <form onSubmit={handleUploadSubmit}>
                      <Stack gap={4}>
                        <h3 className="text-sm font-extrabold text-zinc-900">
                          Compare Blueprint Sheets
                        </h3>
                        <Divider className="border-zinc-200" />
                        <Input
                          required
                          value={drawingName}
                          onChange={(e) => setDrawingName(e.target.value)}
                          placeholder="Drawing Name"
                          className="h-10 border-zinc-200 bg-zinc-50 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={revALabel}
                            onChange={(e) => setRevALabel(e.target.value)}
                            placeholder="Rev A Label"
                            className="h-8 border-zinc-200 bg-zinc-50 text-xs"
                          />
                          <Input
                            value={revBLabel}
                            onChange={(e) => setRevBLabel(e.target.value)}
                            placeholder="Rev B Label"
                            className="h-8 border-zinc-200 bg-zinc-50 text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-zinc-500">Upload Revision A</label>
                          <input
                            type="file"
                            required
                            onChange={(e) => setFileA(e.target.files?.[0] || null)}
                            className="text-xs text-zinc-500"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-zinc-500">Upload Revision B</label>
                          <input
                            type="file"
                            required
                            onChange={(e) => setFileB(e.target.files?.[0] || null)}
                            className="text-xs text-zinc-500"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-10 bg-indigo-600 text-xs font-semibold text-zinc-900 uppercase"
                        >
                          {isSubmitting ? "Comparing..." : "Initialize Analysis"}
                        </Button>
                      </Stack>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
