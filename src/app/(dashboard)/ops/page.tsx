"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  MessageSquare,
  Mail,
  ShieldCheck,
  RefreshCw,
  Send,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  MetricCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";
import { cn } from "@/shared/utils";

interface Summary {
  totals: {
    totalUsers: number;
    activeUsers: number;
    totalOrganizations: number;
    totalInbox: number;
    openInbox: number;
  };
  usersPerOrganization: { id: string; name: string; slug: string; memberCount: number }[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  organizations: { id: string; name: string; role: string }[];
}

interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  ownerEmail: string;
  ownerName: string | null;
  memberCount: number;
}

interface InboxReply {
  body: string;
  createdAt: string;
}

interface InboxSubmission {
  id: string;
  kind: string;
  email: string;
  name: string | null;
  organization: string | null;
  subject: string | null;
  message: string;
  delivered: boolean;
  category: string | null;
  replies: InboxReply[];
  createdAt: string;
}

type LoadStatus = "loading" | "denied" | "ready";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OpsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [inbox, setInbox] = useState<InboxSubmission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
    setNotice("");
    try {
      const summaryRes = await fetch("/api/admin/summary", { credentials: "include" });
      if (summaryRes.status === 401) {
        router.replace("/login");
        return;
      }
      if (summaryRes.status === 403 || !summaryRes.ok) {
        setStatus("denied");
        return;
      }
      const summaryJson = await summaryRes.json();
      setSummary(summaryJson.data as Summary);

      const [usersRes, organizationsRes, inboxRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/organizations", { credentials: "include" }),
        fetch("/api/admin/inbox", { credentials: "include" }),
      ]);
      if (usersRes.ok) {
        setUsers(((await usersRes.json()).data as AdminUser[]) ?? []);
      }
      if (organizationsRes.ok) {
        setOrganizations(((await organizationsRes.json()).data as OrganizationRow[]) ?? []);
      }
      if (inboxRes.ok) {
        setInbox(((await inboxRes.json()).data as InboxSubmission[]) ?? []);
      }
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the console loads its data on mount
    void load();
  }, [load, refreshKey]);

  const activeUsers = useMemo(() => users.filter((user) => user.status === "active"), [users]);

  const toggleUserStatus = useCallback(async (user: AdminUser) => {
    const nextStatus = user.status === "active" ? "deactivated" : "active";
    setBusy((prev) => ({ ...prev, [`user:${user.id}`]: true }));
    const res = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusy((prev) => ({ ...prev, [`user:${user.id}`]: false }));
    if (res.ok) {
      setNotice(`Updated ${user.email} to ${nextStatus}.`);
      setRefreshKey((key) => key + 1);
    } else {
      const json = await res.json().catch(() => ({ error: "Request failed" }));
      setNotice(json.error ?? "Update failed");
    }
  }, []);

  const sendReply = useCallback(
    async (submission: InboxSubmission) => {
      const body = drafts[submission.id]?.trim();
      if (!body) return;
      setBusy((prev) => ({ ...prev, [`reply:${submission.id}`]: true }));
      const res = await fetch(`/api/admin/inbox/${submission.id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setBusy((prev) => ({ ...prev, [`reply:${submission.id}`]: false }));
      if (res.ok) {
        setDrafts((prev) => ({ ...prev, [submission.id]: "" }));
        setNotice("Reply sent to the submitter.");
        setRefreshKey((key) => key + 1);
      } else {
        const json = await res.json().catch(() => ({ error: "Reply failed" }));
        setNotice(json.error ?? "Reply failed");
      }
    },
    [drafts],
  );

  if (status === "loading") {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          Loading operations console…
        </div>
      </PageContainer>
    );
  }

  if (status === "denied") {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ShieldCheck className="size-8 text-rose-600" />
            <h1 className="text-lg font-semibold text-slate-900">Access denied</h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              This console is restricted. Sign in with an admin account, or check with the platform
              owner for access.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <Stack gap={8} className="px-6 py-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-blue-600" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Operations Console
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-slate-500">
            Inbound inquiries, account access, and organization overview. Restricted to the platform
            owner — this route is not linked anywhere in the product.
          </p>
          {notice && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="size-3.5" /> {notice}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Overview
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw className="mr-2 size-3.5" /> Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <MetricCard
              label="Total users"
              value={summary?.totals.activeUsers ?? 0}
              hint={`${summary?.totals.totalUsers ?? 0} including deactivated`}
              icon={<Users className="size-4" />}
            />
            <MetricCard
              label="Organizations"
              value={summary?.totals.totalOrganizations ?? 0}
              icon={<Building2 className="size-4" />}
            />
            <MetricCard
              label="Open inquiries"
              value={summary?.totals.openInbox ?? 0}
              hint={`${summary?.totals.totalInbox ?? 0} total received`}
              icon={<MessageSquare className="size-4" />}
            />
            <MetricCard
              label="Active teams"
              value={summary?.usersPerOrganization.filter((org) => org.memberCount > 1).length ?? 0}
              hint="Organizations with 2+ members"
              icon={<Users className="size-4" />}
            />
            <MetricCard
              label="Assistance line"
              value="+91 7019844552"
              hint="Response & callback within 12 hours"
              icon={<PhoneCall className="size-4" />}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Inbound inquiries ({inbox.length})
          </span>
          {inbox.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">
                No inquiries received yet.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {inbox.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            submission.kind === "customer_care"
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-700"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-700",
                          )}
                        >
                          {submission.kind === "customer_care" ? "Support" : "Evaluation request"}
                        </Badge>
                        {submission.category && <Badge>{submission.category}</Badge>}
                        {submission.replies.length === 0 ? (
                          <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-700">
                            Unreplied
                          </Badge>
                        ) : (
                          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                            Replied ×{submission.replies.length}
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-semibold text-slate-900">
                        {submission.name ?? submission.email}
                        <span className="ml-2 font-normal text-slate-500">
                          {submission.email}
                          {submission.organization ? ` · ${submission.organization}` : ""}
                        </span>
                      </p>
                      {submission.subject && (
                        <p className="text-xs font-medium text-slate-600">
                          Subject: {submission.subject}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                        {submission.message}
                      </p>
                    </div>

                    {submission.replies.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                          Previous replies
                        </p>
                        {submission.replies.map((reply, index) => (
                          <div key={index} className="flex items-start justify-between gap-3 py-1">
                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-600">
                              {reply.body}
                            </p>
                            <span className="shrink-0 font-mono text-[10px] text-slate-400">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Write a reply… (emailed to the submitter when email is configured)"
                        value={drafts[submission.id] ?? ""}
                        onChange={(event) =>
                          setDrafts((prev) => ({ ...prev, [submission.id]: event.target.value }))
                        }
                        className="min-h-20"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={
                            !drafts[submission.id]?.trim() ||
                            Boolean(busy[`reply:${submission.id}`])
                          }
                          onClick={() => void sendReply(submission)}
                        >
                          <Send className="mr-2 size-3.5" />
                          {busy[`reply:${submission.id}`] ? "Sending…" : "Send reply"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Users ({activeUsers.length} active)
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Organizations</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900">{user.email}</TableCell>
                  <TableCell>{user.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        user.status === "active"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-700",
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.isEmailVerified ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {user.organizations.length > 0
                      ? user.organizations.map((org) => (
                          <span
                            key={org.id}
                            className="mr-1 inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600"
                          >
                            {org.name} · {org.role}
                          </span>
                        ))
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={Boolean(busy[`user:${user.id}`])}
                      onClick={() => void toggleUserStatus(user)}
                    >
                      {busy[`user:${user.id}`]
                        ? "Updating…"
                        : user.status === "active"
                          ? "Deactivate"
                          : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Companies
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium text-slate-900">{org.name}</TableCell>
                  <TableCell className="font-mono text-xs">{org.slug}</TableCell>
                  <TableCell>
                    {org.ownerName ?? org.ownerEmail}
                    <span className="ml-1 text-xs text-slate-400">{org.ownerEmail}</span>
                  </TableCell>
                  <TableCell>{org.memberCount}</TableCell>
                  <TableCell className="font-mono text-xs">{formatDate(org.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {summary && summary.usersPerOrganization.length > 0 && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {summary.usersPerOrganization.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-800">{org.name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900">
                    <Users className="size-3.5 text-slate-400" />
                    {org.memberCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <Mail className="size-4 text-slate-500" />
          <p className="text-xs text-slate-600">
            Admin access is keyed to the{" "}
            <code className="font-mono text-[11px] text-slate-800">ADMIN_EMAILS</code> environment
            variable. The /ops route and all{" "}
            <code className="font-mono text-[11px] text-slate-800">/api/admin</code> endpoints
            refuse non-admin sessions server-side.
          </p>
        </div>
      </Stack>
    </PageContainer>
  );
}
