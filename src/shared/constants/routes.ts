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
}

export interface SidebarNavGroup {
  label: string;
  icon: string;
  items: SidebarNavItem[];
}

export type SidebarNavEntry = SidebarNavGroup | SidebarNavItem;

function isGroup(entry: SidebarNavEntry): entry is SidebarNavGroup {
  return (entry as SidebarNavGroup).items !== undefined;
}

export { isGroup };

export const SIDEBAR_NAV: SidebarNavEntry[] = [
  { label: "Mission Console", href: ROUTES.dashboard, icon: "LayoutDashboard" },
  { label: "Decisions", href: "/decisions", icon: "Workflow" },
  { label: "Drawings", href: "/drawings", icon: "Layers" },
  { label: "Sentinel", href: "/sentinel", icon: "Activity" },
  { label: "Compliance", href: "/compliance", icon: "ShieldCheck" },
  { label: "Help", href: ROUTES.help, icon: "HelpCircle" },
];

export type RouteKey = keyof typeof ROUTES;
