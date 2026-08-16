export interface HelpTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  href?: string;
  keywords: string[];
  routes?: string[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "empty-workspace",
    title: "Start in an empty workspace",
    category: "Getting started",
    summary:
      "A new account starts with Mission Console only. Open Drawings or Decisions from the left rail to begin real work — nothing is pre-seeded.",
    steps: [
      "Confirm you are signed in (not Guest Mode).",
      "Use the left rail to open Drawings or Decisions.",
      "Invite teammates from Settings or the header so they join the same organization.",
    ],
    href: "/dashboard",
    keywords: ["empty", "new", "workspace", "start", "onboard"],
    routes: ["/dashboard"],
  },
  {
    id: "upload-drawings",
    title: "Upload drawings",
    category: "How-to",
    summary:
      "Add CAD or drawing files from the Drawings workspace so the program can parse revisions and compare changes.",
    steps: [
      "Open Drawings from the left rail.",
      "Choose New drawing or the upload action on that page.",
      "Select the file and wait for ingestion to finish before reviewing findings.",
    ],
    href: "/drawings/new",
    keywords: ["cad", "drawing", "upload", "ingest", "revision"],
    routes: ["/drawings"],
  },
  {
    id: "decisions",
    title: "Record an engineering decision",
    category: "How-to",
    summary:
      "Decisions live on your organization. Create one from the Decisions list so the audit trail stays attached to this workspace.",
    steps: [
      "Open Decisions from the left rail.",
      "Start a new decision and capture rationale plus evidence.",
      "Use workspace tabs to keep the decision open while you inspect drawings.",
    ],
    href: "/decisions/new",
    keywords: ["decision", "audit", "rationale", "signoff"],
    routes: ["/decisions"],
  },
  {
    id: "invite-teammates",
    title: "Invite teammates to the same organization",
    category: "How-to",
    summary:
      "Owners and admins can invite by email. Invitees accept the link after signup or login and then share org-scoped drawings and decisions.",
    steps: [
      "Open Settings or click Invite in the header.",
      "Enter a work email and optional role, then send.",
      "If email is not configured, copy the invite link and share it directly.",
      "The invitee must use the invited email when possible.",
    ],
    href: "/settings",
    keywords: ["invite", "member", "teammate", "organization", "email"],
    routes: ["/settings", "/organizations"],
  },
  {
    id: "sentinel",
    title: "Use Decision Sentinel",
    category: "How-to",
    summary: "Monitor active engineering decisions and alerts from the Sentinel workspace.",
    steps: [
      "Open Sentinel from the left rail.",
      "Review alerts and open a record to inspect evidence.",
    ],
    href: "/sentinel",
    keywords: ["sentinel", "alert", "surveillance"],
    routes: ["/sentinel"],
  },
  {
    id: "compliance",
    title: "Compliance dossier",
    category: "How-to",
    summary: "Build certification packages from evidence already stored in this organization.",
    steps: [
      "Open Compliance from the left rail.",
      "Generate or review the dossier for the program.",
    ],
    href: "/compliance",
    keywords: ["compliance", "as9100", "certification", "audit"],
    routes: ["/compliance"],
  },
];

export function topicsForPath(pathname: string): HelpTopic[] {
  const contextual = HELP_TOPICS.filter((topic) =>
    topic.routes?.some((route) => pathname === route || pathname.startsWith(`${route}/`)),
  );
  if (contextual.length > 0) return contextual;
  return HELP_TOPICS.filter((topic) => topic.id === "empty-workspace");
}

export function searchHelpTopics(query: string): HelpTopic[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_TOPICS;
  return HELP_TOPICS.filter((topic) =>
    [topic.title, topic.category, topic.summary, ...topic.keywords, ...topic.steps]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
