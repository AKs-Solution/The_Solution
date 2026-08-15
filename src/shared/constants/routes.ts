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
  {
    label: "Mission Console",
    href: ROUTES.dashboard,
    icon: "LayoutDashboard",
  },
  {
    label: "Core Decision Intelligence",
    icon: "Brain",
    items: [
      { label: "Executive Overview", href: "/executive-dashboard", icon: "BarChart3", badge: "HQ" },
      { label: "Decision Sentinel", href: "/sentinel", icon: "Activity", badge: "LIVE" },
      { label: "Historical Precedents", href: "/precedents", icon: "BookCheck", badge: "510+" },
      {
        label: "Failure Graph & Contagion",
        href: "/failure-graph",
        icon: "GitBranch",
        badge: "GRAPH",
      },
      { label: "Decision Ledger", href: "/decisions", icon: "Workflow" },
      {
        label: "Reasoning & Contradictions",
        href: "/contradictions",
        icon: "AlertTriangle",
        badge: "ALERTS",
      },
    ],
  },
  {
    label: "Engineering & Validation",
    icon: "Layers",
    items: [
      { label: "Drawings & Rules", href: "/drawings", icon: "Layers", badge: "CAD" },
      { label: "Compliance Dossier", href: "/compliance", icon: "ShieldCheck", badge: "AS9100" },
      { label: "Engineering Copilot", href: "/copilot", icon: "Brain" },
      { label: "Certification Readiness", href: "/certification", icon: "ShieldCheck" },
      { label: "Documents & Evidence", href: ROUTES.documents, icon: "FileText" },
      { label: "Suppliers & Parts", href: ROUTES.suppliers, icon: "Truck" },
    ],
  },
  {
    label: "Platform Governance",
    icon: "ShieldCheck",
    items: [
      { label: "Audit Log (SHA-256)", href: ROUTES.audit, icon: "ScrollText" },
      { label: "Program Health", href: "/programs", icon: "Activity" },
      { label: "Settings", href: ROUTES.settings, icon: "Settings" },
      { label: "Notifications", href: ROUTES.notifications, icon: "Bell" },
      { label: "Help & Documentation", href: ROUTES.help, icon: "HelpCircle" },
    ],
  },
];

export type RouteKey = keyof typeof ROUTES;
