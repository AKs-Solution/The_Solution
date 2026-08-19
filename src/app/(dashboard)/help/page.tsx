"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  BadgeCheck,
  LifeBuoy,
  Phone,
  ClipboardCopy,
  CheckCircle2,
  Wifi,
  Database,
  XCircle,
} from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { EpistemicBadge, type EpistemicStatus } from "@/components/ui/epistemic-badge";
import { cn } from "@/shared/utils";

import { CustomerCareForm } from "@/components/marketing";
import { searchHelpTopics } from "@/features/help";

const GLOSSARY: { term: string; status: EpistemicStatus; definition: string }[] = [
  {
    term: "RECORDED",
    status: "RECORDED",
    definition:
      "Directly observed or measured — sensor telemetry, inspection records, and as-built data. Highest epistemic standing.",
  },
  {
    term: "DERIVED",
    status: "DERIVED",
    definition:
      "Computed from recorded inputs through a deterministic model or calculation. Trust depends on the model's fidelity.",
  },
  {
    term: "INFERRED",
    status: "INFERRED",
    definition:
      "Reasoned from context, precedent, or analogy rather than direct measurement. Useful for triage, requires verification before action.",
  },
  {
    term: "ASSERTED",
    status: "ASSERTED",
    definition:
      "Stated by an engineer without a recorded measurement yet. Visible, auditable, and not treated as observed fact.",
  },
  {
    term: "UNKNOWN / GAP",
    status: "GAP",
    definition:
      "No supporting evidence exists. The claim is unsupported and must not be used for sign-off without closing the evidence gap.",
  },
];

interface HealthResult {
  api: "checking" | "ok" | "down";
  database: "checking" | "connected" | "unreachable" | "skipped";
  timestamp?: string;
  version?: string;
}

const initialHealth: HealthResult = { api: "checking", database: "checking" };

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<HealthResult>(initialHealth);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function runDiagnostics() {
      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        if (cancelled) return;
        setHealth({
          api: res.ok ? "ok" : "down",
          database: (json.database as HealthResult["database"]) ?? "unreachable",
          timestamp: json.timestamp,
          version: json.version,
        });
      } catch {
        if (!cancelled) setHealth({ api: "down", database: "unreachable" });
      }
    }
    async function loadAccount() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setAccountName(typeof json.data?.name === "string" ? json.data.name : "");
        setAccountEmail(typeof json.data?.email === "string" ? json.data.email : "");
      } catch {
        // Form still works without a prefilled account.
      }
    }
    void runDiagnostics();
    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGuides = useMemo(() => searchHelpTopics(query), [query]);

  const diagnosticsText = useMemo(() => {
    return [
      `Consecuencia System Diagnostics`,
      `Generated: ${new Date().toISOString()}`,
      `API connectivity: ${health.api === "ok" ? "Connected" : "Unreachable"}`,
      `Database: ${health.database === "connected" ? "Connected" : health.database === "skipped" ? "Not configured" : "Unreachable"}`,
      `Version: ${health.version ?? "n/a"}`,
      `User agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "n/a"}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : "n/a"}`,
    ].join("\n");
  }, [health]);

  const handleCopyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticsText);
      setCopyStatus("Diagnostics copied to clipboard");
    } catch {
      setCopyStatus("Clipboard unavailable — copy manually from the report below");
    }
  };

  return (
    <PageContainer>
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="size-6 text-emerald-600" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Help & Documentation
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Quick-start guides, reference material, system diagnostics, and a channel to report
            issues to the platform team.
          </p>

          {/* SEARCH */}
          <div className="relative mt-2 max-w-xl">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              aria-label="Search documentation"
              placeholder="Search guides, keywords, topics..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="h-10 border-slate-200 bg-white pl-9"
            />
          </div>
        </div>

        {/* QUICK-START GUIDES */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Quick-Start Guides
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredGuides.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="text-muted-foreground flex items-center gap-3 p-6 text-sm">
                  <Search className="size-4" />
                  No guides matched &ldquo;{query}&rdquo;. Try a different term.
                </CardContent>
              </Card>
            ) : (
              filteredGuides.map((guide) => (
                <Card key={guide.id}>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center gap-2">
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-700">
                        {guide.category.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{guide.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{guide.summary}</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600">
                      {guide.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* EPISTEMIC GLOSSARY */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Epistemic Glossary
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {GLOSSARY.map((entry) => (
              <div key={entry.term} className="rounded-lg border border-slate-200 bg-white p-4">
                <EpistemicBadge status={entry.status} label={entry.term} size="sm" />
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.definition}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* DIAGNOSTICS */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <Wifi className="size-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">System Status</h3>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-xs font-medium text-slate-600">API connectivity</span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-mono text-[10px] font-semibold",
                      health.api === "ok"
                        ? "text-emerald-700"
                        : health.api === "down"
                          ? "text-rose-700"
                          : "text-slate-500",
                    )}
                  >
                    {health.api === "ok" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : health.api === "down" ? (
                      <XCircle className="size-3.5" />
                    ) : (
                      <Wifi className="size-3.5 animate-pulse" />
                    )}
                    {health.api === "ok"
                      ? "CONNECTED"
                      : health.api === "down"
                        ? "UNREACHABLE"
                        : "CHECKING..."}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Database className="size-3.5" /> Database
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      health.database === "connected"
                        ? "text-emerald-700"
                        : health.database === "checking"
                          ? "text-slate-500"
                          : "text-amber-700",
                    )}
                  >
                    {health.database === "connected"
                      ? "CONNECTED"
                      : health.database === "checking"
                        ? "CHECKING..."
                        : health.database === "skipped"
                          ? "NOT CONFIGURED"
                          : "UNREACHABLE"}
                  </span>
                </div>

                {health.timestamp && (
                  <p className="text-muted-foreground font-mono text-[10px]">
                    Checked at {new Date(health.timestamp).toLocaleString()} · v
                    {health.version ?? "0.1.0"}
                  </p>
                )}
              </div>

              <Button type="button" variant="secondary" onClick={handleCopyDiagnostics}>
                <ClipboardCopy className="mr-2 size-3.5" /> Copy diagnostics
              </Button>
              {copyStatus && <p className="text-xs text-emerald-700">{copyStatus}</p>}
            </CardContent>
          </Card>

          {/* BUG REPORT */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Contact Support / Report a Bug</h3>
              </div>
              <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <a
                  href="tel:+917019844552"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-900 no-underline hover:text-blue-700"
                >
                  <Phone className="size-4 text-blue-600" />
                  <span className="font-mono">+91 7019844552</span>
                </a>
                <p className="text-xs text-slate-500">
                  Call for immediate assistance — response and callback within 12 hours.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={includeDiagnostics}
                  onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                  className="accent-blue-600"
                />
                Include system diagnostics in the report
              </label>
              <CustomerCareForm
                defaultName={accountName}
                defaultEmail={accountEmail}
                defaultSubject="Help center report"
                includeDiagnostics={includeDiagnostics ? diagnosticsText : undefined}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <BadgeCheck className="size-4 text-emerald-600" />
          <p className="text-xs text-slate-600">
            Need deeper help? Reach out to your organization administrator for role-specific
            onboarding.
          </p>
        </div>
      </Stack>
    </PageContainer>
  );
}
