export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  documents: "/documents",
  "knowledge-graph": "/knowledge-graph",
  evidence: "/evidence",
  simulation: "/simulation",
  search: "/search",
  reports: "/reports",
  settings: "/settings",
  organizations: "/organizations",
  entities: "/entities",
  rules: "/rules",
  contradictions: "/contradictions",
  suppliers: "/suppliers",
  ai: "/ai",
  notifications: "/notifications",
  ingestion: "/ingestion",
  orchestrator: "/orchestrator",
  reality: "/reality",
  audit: "/audit",
  precedents: "/precedents",
  help: "/help",
} as const;

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  shortcut?: string;
}

export interface SidebarNavGroup {
  label: string;
  icon: string;
  items: SidebarNavItem[];
}

export type SidebarNavEntry = SidebarNavGroup | SidebarNavItem;

function isGroup(entry: SidebarNavEntry): entry is SidebarNavGroup {
  return "items" in entry && Array.isArray(entry.items);
}

function isNavItem(entry: SidebarNavEntry): entry is SidebarNavItem {
  return !isGroup(entry);
}

export { isGroup, isNavItem };

export const SIDEBAR_NAV: SidebarNavEntry[] = [
  { label: "Mission Console", href: ROUTES.dashboard, icon: "LayoutDashboard", shortcut: "1" },
  { label: "Decisions", href: "/decisions", icon: "Workflow", shortcut: "2" },
  { label: "Drawings", href: "/drawings", icon: "Layers", shortcut: "3" },
  { label: "Sentinel", href: "/sentinel", icon: "Activity", shortcut: "4" },
  { label: "Compliance", href: "/compliance", icon: "ShieldCheck", shortcut: "5" },
];

export type RouteKey = keyof typeof ROUTES;
