"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type WorkspaceDensity = "compact" | "comfortable" | "spacious";

export type WorkspaceLayout = "studio" | "records" | "classic";

export interface LayoutOption {
  id: WorkspaceLayout;
  name: string;
  description: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "studio",
    name: "Engineering Studio",
    description:
      "Workspace shell with a tab bar for open records (decisions, drawings, sentinel alerts) and a clean sidebar. Best for working across several records.",
  },
  {
    id: "records",
    name: "Records First",
    description:
      "The tab bar appears only on decisions, sentinel, drawings, and failure-graph pages, keeping every other area clean.",
  },
  {
    id: "classic",
    name: "Classic",
    description:
      "The original layout without a workspace tab bar — just the sidebar, header, and page content.",
  },
];

export type WorkspaceViewIcon = "layout" | "shield" | "gauge" | "truck" | "brain";

export interface WorkspaceView {
  id: string;
  name: string;
  icon: WorkspaceViewIcon;
  density: WorkspaceDensity;
  widgetPrefs: WidgetPrefs;
  widgetOrder: string[];
  drawerSizes: Record<string, number>;
  createdAt: string;
}

export const DEFAULT_WIDGET_ORDER = [
  "kpi-row",
  "sentinel-alert-feed",
  "decision-velocity",
  "assessment-breakdown",
  "active-anomalies",
  "industry-failure-graph",
  "certification-readiness",
  "epistemic-matrix",
];

export type WidgetPrefs = Record<string, { visible: boolean; minimized: boolean }>;

export interface WorkspacePreferencesState {
  density: WorkspaceDensity;
  layout: WorkspaceLayout;
  activeViewId: string;
  views: WorkspaceView[];
  widgetPrefs: WidgetPrefs;
  widgetOrder: string[];
  drawerSizes: Record<string, number>;
  lastUpdated: string;
}

const STORAGE_KEY = "consecuencia.workspace.v1";

export const DENSITY_LABELS: Record<WorkspaceDensity, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
};

export const DEFAULT_WIDGET_PREFS: WidgetPrefs = {
  "sentinel-alert-feed": { visible: true, minimized: false },
  "decision-velocity": { visible: true, minimized: false },
  "industry-failure-graph": { visible: true, minimized: false },
  "certification-readiness": { visible: true, minimized: false },
  "epistemic-matrix": { visible: true, minimized: false },
  "kpi-row": { visible: true, minimized: false },
  "assessment-breakdown": { visible: true, minimized: false },
  "active-anomalies": { visible: true, minimized: false },
};

export const DEFAULT_DRAWER_SIZES: Record<string, number> = {
  copilot: 420,
  reasoning: 380,
  inspection: 460,
};

function createView(
  id: string,
  name: string,
  icon: WorkspaceViewIcon,
  overrides?: Partial<WorkspaceView>,
): WorkspaceView {
  return {
    id,
    name,
    icon,
    density: "comfortable",
    widgetPrefs: { ...DEFAULT_WIDGET_PREFS },
    widgetOrder: [...DEFAULT_WIDGET_ORDER],
    drawerSizes: { ...DEFAULT_DRAWER_SIZES },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const WORKSPACE_PRESETS: WorkspaceView[] = [
  createView("mission-control", "Mission Control", "layout"),
  createView("quality-audit", "Quality Audit View", "shield", {
    widgetPrefs: {
      ...DEFAULT_WIDGET_PREFS,
      "industry-failure-graph": { visible: false, minimized: false },
      "decision-velocity": { visible: false, minimized: false },
    },
    density: "compact",
  }),
  createView("executive-summary", "Executive Summary", "gauge", {
    widgetPrefs: {
      ...DEFAULT_WIDGET_PREFS,
      "active-anomalies": { visible: true, minimized: false },
      "sentinel-alert-feed": { visible: false, minimized: false },
      "industry-failure-graph": { visible: false, minimized: false },
    },
    density: "comfortable",
  }),
  createView("supplier-surveillance", "Supplier Surveillance View", "truck", {
    widgetPrefs: {
      ...DEFAULT_WIDGET_PREFS,
      "active-anomalies": { visible: false, minimized: false },
      "assessment-breakdown": { visible: false, minimized: false },
    },
    density: "compact",
  }),
];

function getDefaultState(): WorkspacePreferencesState {
  return {
    density: "comfortable",
    layout: "studio",
    activeViewId: "mission-control",
    views: WORKSPACE_PRESETS,
    widgetPrefs: { ...DEFAULT_WIDGET_PREFS },
    widgetOrder: [...DEFAULT_WIDGET_ORDER],
    drawerSizes: { ...DEFAULT_DRAWER_SIZES },
    lastUpdated: new Date().toISOString(),
  };
}

function isWorkspaceView(value: unknown): value is WorkspaceView {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.icon === "string" &&
    (v.density === "compact" || v.density === "comfortable" || v.density === "spacious") &&
    typeof v.widgetPrefs === "object" &&
    v.widgetPrefs !== null
  );
}

function sanitizeViews(views: unknown): WorkspaceView[] {
  if (!Array.isArray(views)) return WORKSPACE_PRESETS;
  const valid = views.filter(isWorkspaceView);
  return valid.length > 0 ? valid : WORKSPACE_PRESETS;
}

function sanitizeState(raw: unknown): WorkspacePreferencesState {
  const fallback = getDefaultState();
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const views = sanitizeViews(r.views);
  const activeView = views.find((v) => v.id === r.activeViewId) ?? views[0];
  return {
    density:
      r.density === "compact" || r.density === "comfortable" || r.density === "spacious"
        ? r.density
        : fallback.density,
    layout:
      r.layout === "studio" || r.layout === "records" || r.layout === "classic"
        ? r.layout
        : fallback.layout,
    activeViewId: activeView.id,
    views,
    widgetPrefs:
      r.widgetPrefs && typeof r.widgetPrefs === "object"
        ? { ...fallback.widgetPrefs, ...(r.widgetPrefs as WidgetPrefs) }
        : activeView.widgetPrefs,
    widgetOrder:
      Array.isArray(r.widgetOrder) && r.widgetOrder.length > 0
        ? (r.widgetOrder as string[])
        : activeView.widgetOrder,
    drawerSizes:
      r.drawerSizes && typeof r.drawerSizes === "object"
        ? { ...fallback.drawerSizes, ...(r.drawerSizes as Record<string, number>) }
        : activeView.drawerSizes,
    lastUpdated:
      typeof r.lastUpdated === "string" ? r.lastUpdated : new Date().toISOString(),
  };
}

function readLocal(): WorkspacePreferencesState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export interface WorkspacePreferencesValue extends WorkspacePreferencesState {
  activeView: WorkspaceView | null;
  setDensity: (density: WorkspaceDensity) => void;
  setLayout: (layout: WorkspaceLayout) => void;
  applyView: (viewId: string) => void;
  saveCurrentView: (name: string, icon?: WorkspaceViewIcon) => WorkspaceView | null;
  deleteView: (viewId: string) => void;
  resetWorkspace: () => void;
  setWidgetVisible: (widgetId: string, visible: boolean) => void;
  setWidgetMinimized: (widgetId: string, minimized: boolean) => void;
  moveWidget: (widgetId: string, direction: "up" | "down") => void;
  setDrawerSize: (drawerId: string, size: number) => void;
}

const WorkspacePreferencesContext = createContext<WorkspacePreferencesValue | null>(null);

export function WorkspacePreferencesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspacePreferencesState>(() =>
    sanitizeState(readLocal() ?? getDefaultState()),
  );
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply the density attribute to the document root so global CSS scales views.
  useEffect(() => {
    document.documentElement.setAttribute("data-density", state.density);
  }, [state.density]);

  // Hydrate from the server when no local snapshot exists yet.
  useEffect(() => {
    let cancelled = false;
    if (readLocal()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }
    fetch("/api/settings/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        const remote = sanitizeState(json.data);
        setState(remote);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist local changes to localStorage and, debounced, to the user profile.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — continue without local persistence.
    }
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace: state }),
      }).catch(() => {
        // Best-effort server persistence; local state remains the source of truth.
      });
    }, 800);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [state, hydrated]);

  const setDensity = useCallback((density: WorkspaceDensity) => {
    setState((prev) => ({ ...prev, density }));
  }, []);

  const setLayout = useCallback((layout: WorkspaceLayout) => {
    setState((prev) => ({ ...prev, layout }));
  }, []);

  const applyView = useCallback((viewId: string) => {
    setState((prev) => {
      const view = prev.views.find((v) => v.id === viewId);
      if (!view) return prev;
      return {
        ...prev,
        activeViewId: view.id,
        density: view.density,
        widgetPrefs: view.widgetPrefs,
        drawerSizes: view.drawerSizes,
      };
    });
  }, []);

  const saveCurrentView = useCallback(
    (name: string, icon: WorkspaceViewIcon = "layout"): WorkspaceView | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const view: WorkspaceView = {
        id: `custom-${Date.now().toString(36)}`,
        name: trimmed,
        icon,
        density: state.density,
        widgetPrefs: { ...state.widgetPrefs },
        widgetOrder: [...state.widgetOrder],
        drawerSizes: { ...state.drawerSizes },
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        views: [...prev.views, view],
        activeViewId: view.id,
      }));
      return view;
    },
    [state.density, state.widgetPrefs, state.drawerSizes],
  );

  const deleteView = useCallback((viewId: string) => {
    setState((prev) => {
      const remaining = prev.views.filter((v) => v.id !== viewId);
      if (remaining.length === 0) return prev;
      const activeView = remaining.find((v) => v.id === prev.activeViewId) ?? remaining[0];
      return {
        ...prev,
        views: remaining,
        activeViewId: activeView.id,
        widgetPrefs: activeView.widgetPrefs,
        density: activeView.density,
      };
    });
  }, []);

  const resetWorkspace = useCallback(() => {
    const fresh = getDefaultState();
    setState(fresh);
  }, []);

  const setWidgetVisible = useCallback((widgetId: string, visible: boolean) => {
    setState((prev) => ({
      ...prev,
      widgetPrefs: {
        ...prev.widgetPrefs,
        [widgetId]: { ...(prev.widgetPrefs[widgetId] ?? {}), visible },
      },
    }));
  }, []);

  const setWidgetMinimized = useCallback((widgetId: string, minimized: boolean) => {
    setState((prev) => ({
      ...prev,
      widgetPrefs: {
        ...prev.widgetPrefs,
        [widgetId]: { ...(prev.widgetPrefs[widgetId] ?? {}), minimized },
      },
    }));
  }, []);

  const moveWidget = useCallback((widgetId: string, direction: "up" | "down") => {
    setState((prev) => {
      const order = [...prev.widgetOrder];
      const index = order.indexOf(widgetId);
      if (index === -1) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= order.length) return prev;
      [order[index], order[target]] = [order[target], order[index]];
      return { ...prev, widgetOrder: order };
    });
  }, []);

  const setDrawerSize = useCallback((drawerId: string, size: number) => {
    setState((prev) => ({
      ...prev,
      drawerSizes: { ...prev.drawerSizes, [drawerId]: Math.round(Math.max(240, size)) },
    }));
  }, []);

  const value = useMemo<WorkspacePreferencesValue>(
    () => ({
      ...state,
      activeView: state.views.find((v) => v.id === state.activeViewId) ?? null,
      setDensity,
      setLayout,
      applyView,
      saveCurrentView,
      deleteView,
      resetWorkspace,
      setWidgetVisible,
      setWidgetMinimized,
      moveWidget,
      setDrawerSize,
    }),
    [
      state,
      setDensity,
      setLayout,
      applyView,
      saveCurrentView,
      deleteView,
      resetWorkspace,
      setWidgetVisible,
      setWidgetMinimized,
      moveWidget,
      setDrawerSize,
    ],
  );

  return (
    <WorkspacePreferencesContext.Provider value={value}>
      {children}
    </WorkspacePreferencesContext.Provider>
  );
}

export function useWorkspacePreferences(): WorkspacePreferencesValue {
  const ctx = useContext(WorkspacePreferencesContext);
  if (!ctx) {
    throw new Error("useWorkspacePreferences must be used within WorkspacePreferencesProvider");
  }
  return ctx;
}
