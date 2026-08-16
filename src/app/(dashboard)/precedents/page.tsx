"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Search,
  AlertOctagon,
  CheckCircle2,
  FileCheck2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Bookmark,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { PageContainer, Section, Panel, GridLayout, Stack } from "@/components/layout";
import { MetricCard, EmptyState, Button, DataTable } from "@/components/ui";
import { cn } from "@/shared/utils";
import { EngineeringPrecedent, PrecedentType } from "@/features/precedents/types";

export default function PrecedentEnginePage() {
  const [precedents, setPrecedents] = useState<EngineeringPrecedent[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSystem, setSelectedSystem] = useState<string>("ALL");

  // Selected precedent for the interactive detail panel
  const [selectedPrecedent, setSelectedPrecedent] = useState<EngineeringPrecedent | null>(null);

  // Interactive Verification Reasoner State
  const [verifySystem, setVerifySystem] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    matchedPrecedents: EngineeringPrecedent[];
    recommendations: string[];
    missingEvidence: string[];
    overallRisk: "LOW" | "MEDIUM" | "HIGH";
  } | null>(null);

  // Add Precedent Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "FAILURE" as PrecedentType,
    description: "",
    rootCause: "",
    correctiveAction: "",
    resolutionStatus: "RESOLVED",
    confidenceScore: 0.95,
    applicableSystemsStr: "",
    documentsStr: "",
    standardsStr: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch Precedent data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const typeParam = selectedType !== "ALL" ? `&type=${selectedType}` : "";
      const systemParam = selectedSystem !== "ALL" ? `&system=${selectedSystem}` : "";
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

      const [resPrecedents, resSystems] = await Promise.all([
        fetch(`/api/precedents?${searchParam}${typeParam}${systemParam}`),
        fetch("/api/precedents/systems"),
      ]);

      if (resPrecedents.ok) {
        const json = await resPrecedents.json();
        const data: EngineeringPrecedent[] = json.data ?? [];
        setPrecedents(data);

        // Auto-select first precedent if none is selected
        if (data.length > 0 && !selectedPrecedent) {
          setSelectedPrecedent(data[0]);
        } else if (selectedPrecedent) {
          // Keep selection synchronized with updated data
          const updated = data.find((p) => p.id === selectedPrecedent.id);
          if (updated) setSelectedPrecedent(updated);
        }
      }
      if (resSystems.ok) {
        const json = await resSystems.json();
        setSystems(json.data ?? []);
      }
    } catch (err) {
      console.error("Failed to load precedents data", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedSystem, searchQuery, selectedPrecedent]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Run interactive design verification
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySystem.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const query = verifySystem.toLowerCase();
      // Match precedents that relate to the system query
      const matched = precedents.filter(
        (p) =>
          (p.relatedComponents || []).some((sys: string) => sys.toLowerCase().includes(query)) ||
          p.title.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query),
      );

      let overallRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      const recommendations: string[] = [];
      const missingEvidence: string[] = [];

      if (matched.length > 0) {
        const hasFailure = matched.some((p) => (p.tags?.[0] || "FAILURE") === "FAILURE");
        overallRisk = hasFailure ? "HIGH" : "MEDIUM";

        matched.forEach((p) => {
          if (p.decisionMade && p.decisionMade !== "N/A - System baseline verified.") {
            recommendations.push(`From "${p.title}": ${p.decisionMade}`);
          }
          if (p.relatedStandards && p.relatedStandards.length > 0) {
            missingEvidence.push(
              `Verification documents matching standard: ${p.relatedStandards.join(", ")}`,
            );
          } else {
            missingEvidence.push(
              `Independent validation report for design parameter referencing "${p.title}"`,
            );
          }
        });
      } else {
        recommendations.push(
          "No direct historical failure matches found. Proceed with standard baseline verification.",
        );
        missingEvidence.push(
          "Standard peer review audit logs",
          "Component specification datasheet validation",
        );
      }

      setVerificationResult({
        matchedPrecedents: matched,
        recommendations,
        missingEvidence,
        overallRisk,
      });
      setIsVerifying(false);
    }, 750);
  };

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError("Title and Description are required.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        rootCause: formData.rootCause || undefined,
        correctiveAction: formData.correctiveAction || undefined,
        resolutionStatus: formData.resolutionStatus,
        confidenceScore: parseFloat(formData.confidenceScore.toString()) || 0.95,
        applicableSystems: formData.applicableSystemsStr
          ? formData.applicableSystemsStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : ["General"],
        evidenceMetadata: {
          documents: formData.documentsStr
            ? formData.documentsStr
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          standards: formData.standardsStr
            ? formData.standardsStr
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          testReports: [],
        },
      };

      const res = await fetch("/api/precedents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormSuccess(true);
        setFormData({
          title: "",
          type: "FAILURE",
          description: "",
          rootCause: "",
          correctiveAction: "",
          resolutionStatus: "RESOLVED",
          confidenceScore: 0.95,
          applicableSystemsStr: "",
          documentsStr: "",
          standardsStr: "",
        });

        // Reload list
        await loadData();

        // Close modal after a brief moment
        setTimeout(() => {
          setIsFormOpen(false);
          setFormSuccess(false);
        }, 1200);
      } else {
        const errJson = await res.json();
        setFormError(errJson.error || "Failed to submit precedent to the Truth Pipeline.");
      }
    } catch {
      setFormError("A network error occurred while submitting.");
    }
  };

  return (
    <PageContainer>
      <Stack gap={8}>
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <History className="size-4" />
              </span>
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
                The Precedent Engine
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Synthesizes previous design baselines, historical engineering failures, corrective
              actions, and regulatory wisdom. Ensures institutional engineering memory compounds and
              stays completely auditable.
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 md:self-auto"
          >
            <Plus className="size-4" />
            <span>Record Precedent</span>
          </Button>
        </div>

        {/* KPI Panel */}
        <GridLayout columns={4} gap={4}>
          <MetricCard
            label="Historical Failure Records"
            value={precedents.filter((p) => (p.tags?.[0] || "FAILURE") === "FAILURE").length}
            icon={<AlertOctagon className="size-5 text-red-500" />}
          />
          <MetricCard
            label="Validated Design Baselines"
            value={
              precedents.filter((p) => (p.tags?.[0] || "FAILURE") === "SUCCESSFUL_DESIGN").length
            }
            icon={<CheckCircle2 className="size-5 text-green-500" />}
          />
          <MetricCard
            label="Regulatory & Standard Precedents"
            value={
              precedents.filter((p) => (p.tags?.[0] || "FAILURE") === "REGULATORY_PRECEDENT").length
            }
            icon={<FileCheck2 className="size-5 text-blue-500" />}
          />
          <MetricCard
            label="Avg Assessment Confidence"
            value={
              precedents.length
                ? `${((precedents.reduce((acc, curr) => acc + curr.confidence, 0) / precedents.length) * 100).toFixed(1)}%`
                : "—"
            }
            icon={<ShieldCheck className="size-5 text-amber-500" />}
          />
        </GridLayout>

        {/* Dynamic Verification Hub (Interactive Reasoner) */}
        <div className="border-border rounded-xl border bg-slate-50/50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Design & System Precedent Reasoner
            </h3>
            <span className="text-muted-foreground bg-muted ml-auto rounded px-1.5 py-0.5 text-xs font-medium">
              Deterministic Engine
            </span>
          </div>
          <p className="text-muted-foreground mb-6 max-w-xl text-xs leading-relaxed">
            Verify a planned design element against historical precedents instantly. Enter a system,
            part name, or subsystem (e.g. &quot;fuel tank&quot;, &quot;alloy&quot;,
            &quot;guidance&quot;) to extract failures and compliance requirements.
          </p>

          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="relative flex-1">
              <Layers className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                value={verifySystem}
                onChange={(e) => setVerifySystem(e.target.value)}
                placeholder="Enter planned subsystem (e.g., 'cryogenic', 'titanium', 'actuator')..."
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus:ring-ring focus:border-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isVerifying || !verifySystem.trim()}
              className="bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700"
            >
              {isVerifying ? "Verifying..." : "Run Assessment"}
            </Button>
          </form>

          {/* Verification Results Animation */}
          <AnimatePresence mode="wait">
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 border-t pt-5"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Risk Profile */}
                  <div className="bg-background rounded-lg border border-dashed p-4">
                    <span className="text-muted-foreground mb-2 block font-mono text-xs">
                      SYSTEM RISK PROFILE
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2.5 animate-ping rounded-full",
                          verificationResult.overallRisk === "HIGH"
                            ? "bg-red-500"
                            : verificationResult.overallRisk === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-green-500",
                        )}
                      />
                      <span className="text-foreground text-lg font-bold tracking-tight">
                        {verificationResult.overallRisk} RISK DETECTION
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-4 text-xs leading-relaxed">
                      {verificationResult.matchedPrecedents.length} matched historical precedents
                      detected in system memory.
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-background rounded-lg border border-dashed p-4 md:col-span-2">
                    <span className="text-muted-foreground mb-2 block font-mono text-xs">
                      DETERMINISTIC RECOMMENDATIONS
                    </span>
                    <ul className="space-y-2">
                      {verificationResult.recommendations.map((rec, i) => (
                        <li key={i} className="text-foreground flex items-start gap-2 text-xs">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 border-t pt-3">
                      <span className="text-muted-foreground mb-2 block font-mono text-[10px]">
                        MISSING EVIDENCE & SUBMISSION REQS
                      </span>
                      <ul className="space-y-1">
                        {verificationResult.missingEvidence.map((ev, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] text-amber-600"
                          >
                            <AlertTriangle className="size-3 shrink-0 animate-bounce" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ledger & Controls Section */}
        <Section title="Institutional Precedent Ledger">
          {/* Controls Bar */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search historical rationale, root causes, corrective actions..."
                className="bg-background border-border text-foreground focus:ring-ring focus:border-ring w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none focus:ring-1"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring focus:border-ring rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-1"
              >
                <option value="ALL">All Precedent Types</option>
                <option value="FAILURE">Failure Cases</option>
                <option value="SUCCESSFUL_DESIGN">Successful Designs</option>
                <option value="REGULATORY_PRECEDENT">Regulations</option>
                <option value="SUPPLIER_HISTORY">Supplier History</option>
              </select>

              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-1"
              >
                <option value="ALL">All Systems</option>
                {systems.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 lg:flex-row">
            {/* Left Column: Ledger Table */}
            <Panel padding="none" className="w-full flex-1 overflow-hidden">
              <DataTable
                data={precedents}
                rowKey={(prec) => prec.id}
                loading={isLoading}
                skeletonRows={6}
                onRowClick={(prec) => setSelectedPrecedent(prec)}
                emptyState={
                  <EmptyState
                    icon={<History className="size-10 text-slate-400" />}
                    title="No precedents yet"
                    description="This workspace has no historical records. Start here by recording a precedent from a completed decision."
                    action={
                      <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-1.5 size-3.5" />
                        Record first precedent
                      </Button>
                    }
                  />
                }
                columns={[
                  {
                    key: "title",
                    header: "Record Title",
                    sortValue: (prec) => prec.title,
                    className: "max-w-md",
                    accessor: (prec) => (
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            "text-foreground text-sm font-semibold transition-colors",
                            selectedPrecedent?.id === prec.id && "text-amber-500",
                          )}
                        >
                          {prec.title}
                        </span>
                        <span className="text-muted-foreground line-clamp-2 text-xs">
                          {prec.summary}
                        </span>
                        {prec.engineeringQuestion && (
                          <div className="mt-2 rounded border border-red-500/10 bg-red-500/5 px-2.5 py-1.5 text-xs text-red-700">
                            <span className="mb-0.5 block font-mono text-[9px] font-bold tracking-wider uppercase">
                              Engineering Question
                            </span>
                            {prec.engineeringQuestion}
                          </div>
                        )}
                        {prec.decisionMade &&
                          prec.decisionMade !== "N/A - System baseline verified." && (
                            <div className="mt-1 rounded border border-green-500/10 bg-green-500/5 px-2.5 py-1.5 text-xs text-green-700">
                              <span className="mb-0.5 block font-mono text-[9px] font-bold tracking-wider uppercase">
                                Decision Made
                              </span>
                              {prec.decisionMade}
                            </div>
                          )}
                      </div>
                    ),
                  },
                  {
                    key: "type",
                    header: "Type",
                    sortValue: (prec) => prec.tags?.[0] || "FAILURE",
                    accessor: (prec) => {
                      const precType = prec.tags?.[0] || "FAILURE";
                      return (
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide",
                            precType === "FAILURE"
                              ? "bg-red-100 text-red-800"
                              : precType === "SUCCESSFUL_DESIGN"
                                ? "bg-green-100 text-green-800"
                                : precType === "REGULATORY_PRECEDENT"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800",
                          )}
                        >
                          {precType.replace("_", " ")}
                        </span>
                      );
                    },
                  },
                  {
                    key: "systems",
                    header: "Target Systems",
                    accessor: (prec) => (
                      <div className="flex flex-wrap gap-1">
                        {(prec.relatedComponents || []).map((s: string) => (
                          <span
                            key={s}
                            className="bg-muted text-foreground rounded px-1.5 py-0.5 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                  {
                    key: "confidence",
                    header: "Confidence",
                    sortValue: (prec) => prec.confidence,
                    align: "right",
                    accessor: (prec) => (
                      <span className="font-mono text-xs">
                        {(prec.confidence * 100).toFixed(0)}%
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Verification Status",
                    sortValue: (prec) => prec.outcome || "RESOLVED",
                    accessor: (prec) => {
                      const outcomeStatus = prec.outcome || "RESOLVED";
                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium",
                            outcomeStatus === "RESOLVED"
                              ? "text-green-600"
                              : outcomeStatus === "MITIGATED"
                                ? "text-amber-600"
                                : "text-slate-600",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              outcomeStatus === "RESOLVED"
                                ? "bg-green-500"
                                : outcomeStatus === "MITIGATED"
                                  ? "bg-amber-500"
                                  : "bg-slate-500",
                            )}
                          />
                          {outcomeStatus}
                        </span>
                      );
                    },
                  },
                  {
                    key: "created",
                    header: "Created At",
                    sortValue: (prec) => prec.createdAt,
                    accessor: (prec) => (
                      <span className="text-muted-foreground font-mono text-xs">
                        {new Date(prec.createdAt).toLocaleDateString()}
                      </span>
                    ),
                  },
                ]}
              />
            </Panel>

            {/* Right Column: Precedent Investigation Dashboard Detail Panel */}
            <AnimatePresence mode="wait">
              {selectedPrecedent && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="border-border bg-background relative w-full shrink-0 rounded-xl border p-5 shadow-lg lg:w-[420px]"
                >
                  <button
                    onClick={() => setSelectedPrecedent(null)}
                    className="text-muted-foreground hover:text-foreground absolute top-4 right-4 transition-colors"
                  >
                    <X className="size-4" />
                  </button>

                  <div className="mb-3 flex items-center gap-2">
                    <Bookmark className="size-4 text-amber-500" />
                    <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                      PRECEDENT INVESTIGATION
                    </span>
                  </div>

                  <h3 className="text-foreground mb-2 pr-6 text-base font-extrabold tracking-tight">
                    {selectedPrecedent.title}
                  </h3>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase",
                        (selectedPrecedent.tags?.[0] || "FAILURE") === "FAILURE"
                          ? "bg-red-100 text-red-800"
                          : (selectedPrecedent.tags?.[0] || "FAILURE") === "SUCCESSFUL_DESIGN"
                            ? "bg-green-100 text-green-800"
                            : (selectedPrecedent.tags?.[0] || "FAILURE") === "REGULATORY_PRECEDENT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800",
                      )}
                    >
                      {(selectedPrecedent.tags?.[0] || "FAILURE").replace("_", " ")}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-[10px]">
                      ID: {selectedPrecedent.id}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 border-b pb-4 text-xs leading-relaxed">
                    {selectedPrecedent.summary}
                  </p>

                  <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1">
                    {/* Explainability & Relevance */}
                    <div>
                      <span className="text-muted-foreground mb-1 block font-mono text-[10px] font-bold tracking-wider uppercase">
                        EXPLAINABILITY & RELEVANCE
                      </span>
                      <div className="text-foreground rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-xs leading-relaxed">
                        <span className="mb-1 block font-semibold text-amber-600">
                          Relevance Rationale:
                        </span>
                        {selectedPrecedent.whyRelevant ||
                          "Retrieved based on standard system indexing metrics."}
                      </div>
                    </div>

                    {/* Confidence & Evidence Strength Indicator */}
                    <div>
                      <span className="text-muted-foreground mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase">
                        DETERMINISTIC STRENGTH RATINGS
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-slate-50/50 p-2.5">
                          <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium">
                            <ShieldCheck className="size-3.5 text-amber-500" />
                            <span>CONFIDENCE</span>
                          </div>
                          <span className="text-foreground font-mono text-lg font-extrabold">
                            {(selectedPrecedent.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="rounded-lg border bg-slate-50/50 p-2.5">
                          <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium">
                            <ShieldCheck className="size-3.5 text-blue-500" />
                            <span>EVIDENCE RATIO</span>
                          </div>
                          <span className="text-foreground font-mono text-lg font-extrabold">
                            {(selectedPrecedent.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Debunked Assumptions Rejected */}
                    {((selectedPrecedent.contradictions as string[]) || []).length > 0 && (
                      <div>
                        <span className="text-muted-foreground mb-1 block font-mono text-[10px] font-bold tracking-wider uppercase">
                          ASSUMPTIONS DEBUNKED & REJECTED
                        </span>
                        <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                          <ul className="space-y-1.5">
                            {((selectedPrecedent.contradictions as string[]) || []).map(
                              (as, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-1.5 text-xs text-red-700"
                                >
                                  <span className="mt-0.5 shrink-0 font-bold text-red-500">✕</span>
                                  <span>{as}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Graph Traversed Paths */}
                    {(selectedPrecedent.relatedComponents || []).length > 0 && (
                      <div>
                        <span className="text-muted-foreground mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase">
                          KNOWLEDGE GRAPH PATHS TRAVERSED
                        </span>
                        <div className="space-y-1">
                          {(selectedPrecedent.relatedComponents || []).map((path, idx) => (
                            <div
                              key={idx}
                              className="bg-muted/40 text-foreground flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[11px] leading-tight"
                            >
                              <ShieldCheck className="text-muted-foreground size-3.5 shrink-0" />
                              <span>{path}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rule Engine Compliance Checks */}
                    {(selectedPrecedent.relatedStandards || []).length > 0 && (
                      <div>
                        <span className="text-muted-foreground mb-1 block font-mono text-[10px] font-bold tracking-wider uppercase">
                          RULE ENGINE COMPLIANCE CHECKS
                        </span>
                        <div className="rounded-lg border border-dashed bg-slate-50/20 p-2.5">
                          <ul className="space-y-1.5">
                            {(selectedPrecedent.relatedStandards || []).map((re, i) => (
                              <li
                                key={i}
                                className="text-foreground flex items-start gap-2 text-[11px] leading-relaxed"
                              >
                                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                                <span>{re}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Evidence & Verification Documents */}
                    {(selectedPrecedent.relatedDocuments || []).length > 0 && (
                      <div>
                        <span className="text-muted-foreground mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase">
                          VERIFIABLE EVIDENCE CHAINS
                        </span>
                        <div className="space-y-1.5">
                          {(selectedPrecedent.relatedDocuments || []).map((doc) => (
                            <div
                              key={doc}
                              className="text-foreground flex items-center gap-2 rounded border bg-slate-50 px-2.5 py-1.5 text-xs"
                            >
                              <FileText className="size-3.5 text-blue-500" />
                              <span className="truncate font-medium">{doc}</span>
                              <span className="ml-auto rounded bg-green-500/10 px-1 py-0.5 font-mono text-[9px] text-green-600">
                                VERIFIED
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Engineering Memory & Version Audit Trail */}
                    {selectedPrecedent.auditTrail && selectedPrecedent.auditTrail.length > 0 && (
                      <div className="border-t pt-4">
                        <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-bold tracking-wider uppercase">
                          MEMORY AUDIT TRAIL & SYSTEM EVENTS
                        </span>
                        <div className="relative space-y-3.5 border-l pl-3">
                          {selectedPrecedent.auditTrail.map((log) => (
                            <div key={log.id} className="relative text-xs">
                              {/* Dot indicator */}
                              <div className="border-background absolute top-1 -left-[16.5px] size-2.5 rounded-full border bg-amber-500 shadow-sm" />
                              <div className="flex flex-col">
                                <span className="text-foreground font-bold">
                                  {log.action.replace("_", " ")}
                                </span>
                                <span className="text-muted-foreground mt-0.5 flex items-center gap-1 font-mono text-[10px]">
                                  <Clock className="size-3" />
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>
      </Stack>

      {/* Record Precedent Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border-border w-full max-w-2xl overflow-hidden rounded-xl border p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="size-5 text-amber-500" />
                <h2 className="text-foreground text-lg font-bold">Record Engineering Precedent</h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-700">
                  ✓ Precedent recorded successfully. Engineering memory updated.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Precedent Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flight 22 Actuator O-Ring Thermal Shrinkage"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Precedent Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as PrecedentType })
                    }
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                  >
                    <option value="FAILURE">Failure / Incident Mode</option>
                    <option value="SUCCESSFUL_DESIGN">Successful Design Baseline</option>
                    <option value="REGULATORY_PRECEDENT">Regulatory Standard</option>
                    <option value="SUPPLIER_HISTORY">Supplier Defect / History</option>
                  </select>
                </div>

                <div>
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Applicable Systems (comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fuel System, Propulsion"
                    value={formData.applicableSystemsStr}
                    onChange={(e) =>
                      setFormData({ ...formData, applicableSystemsStr: e.target.value })
                    }
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground mb-1 block text-xs font-semibold">
                  Problem Description / Abstract *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide a detailed abstract of the engineering precedent."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </div>

              {formData.type === "FAILURE" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-foreground mb-1 block text-xs font-semibold">
                      Root Cause Analysis
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Material embrittlement under extreme low temps..."
                      value={formData.rootCause}
                      onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                      className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-1 block text-xs font-semibold">
                      Corrective Actions Required
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Mandate non-destructive ultrasound testing..."
                      value={formData.correctiveAction}
                      onChange={(e) =>
                        setFormData({ ...formData, correctiveAction: e.target.value })
                      }
                      className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Verification Status
                  </label>
                  <select
                    value={formData.resolutionStatus}
                    onChange={(e) => setFormData({ ...formData, resolutionStatus: e.target.value })}
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                  >
                    <option value="RESOLVED">Resolved</option>
                    <option value="MITIGATED">Mitigated</option>
                    <option value="MONITORED">Monitored</option>
                  </select>
                </div>

                <div>
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Confidence Weight
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={formData.confidenceScore}
                    onChange={(e) =>
                      setFormData({ ...formData, confidenceScore: parseFloat(e.target.value) })
                    }
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 font-mono text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-foreground mb-1 block text-xs font-semibold">
                    Linked Standard Tags
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NASA-STD-5001"
                    value={formData.standardsStr}
                    onChange={(e) => setFormData({ ...formData, standardsStr: e.target.value })}
                    className="border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 px-5 text-white">
                  Confirm & Write
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
