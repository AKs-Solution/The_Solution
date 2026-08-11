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
} as const;

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
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
    label: "Workspace",
    href: ROUTES.dashboard,
    icon: "LayoutDashboard",
  },
  {
    label: "Engineering Data",
    icon: "Layers",
    items: [
      { label: "Documents", href: ROUTES.documents, icon: "FileText" },
      { label: "Suppliers", href: ROUTES.suppliers, icon: "Truck" },
      { label: "Drawings Compare", href: "/drawings", icon: "Layers" },
      { label: "Evidence Search", href: "/copilot", icon: "Brain" },
      { label: "IP & ZK Sourcing", href: "/marketplace", icon: "Tags" },
      { label: "Metrology Registry", href: "/telemetry", icon: "Cog" },
      { label: "Attest Compliance", href: "/compliance", icon: "ShieldCheck" },
      { label: "Program Risks", href: "/reports/risk", icon: "BarChart3" },
    ],
  },
  {
    label: "Intelligence & Platform",
    icon: "Brain",
    items: [
      { label: "Executive Dashboard", href: "/executive-dashboard", icon: "BarChart3" },
      { label: "Decision Sentinel", href: "/sentinel", icon: "Activity" },
      { label: "Certification Readiness", href: "/certification", icon: "ShieldCheck" },
      { label: "Approval Queue", href: "/reviews", icon: "UserCheck" },
      { label: "Lineage Explorer", href: "/lineage", icon: "GitBranch" },
      { label: "Program Health", href: "/programs", icon: "Activity" },
      { label: "Decision Audit Trail", href: "/decisions", icon: "GitCommit" },
      {
        label: "Supplier Risk Predictor",
        href: "/intelligence/supplier-risk",
        icon: "AlertTriangle",
      },
      { label: "Design Pattern Library", href: "/patterns", icon: "Layers" },
      { label: "Cross-Program Insights", href: "/intelligence/cross-program", icon: "TrendingUp" },
      {
        label: "Certification Predictor",
        href: "/intelligence/certification-risk",
        icon: "ShieldCheck",
      },
    ],
  },
  {
    label: "Evidence & Governance",
    icon: "ShieldCheck",
    items: [
      { label: "Validation Timeline", href: "/worldmodel", icon: "ScrollText" },
      { label: "Expertise Ledger", href: "/tribal", icon: "FileText" },
      { label: "Supplier Attestation", href: "/negotiation", icon: "Workflow" },
      { label: "Lifecycle Twin", href: "/twin", icon: "Layers" },
      { label: "Recovery Router", href: "/selfheal", icon: "Cog" },
    ],
  },
  {
    label: "Administration",
    icon: "Settings",
    items: [
      { label: "Settings", href: ROUTES.settings, icon: "Settings" },
      { label: "Audit Log", href: ROUTES.audit, icon: "ScrollText" },
      { label: "Notifications", href: ROUTES.notifications, icon: "Bell" },
    ],
  },
];

export type RouteKey = keyof typeof ROUTES;
