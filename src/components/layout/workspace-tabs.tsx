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
import { usePathname, useRouter } from "next/navigation";

export type WorkspaceTabKind = "decision" | "sentinel" | "drawing" | "failure-graph" | "ledger";

export interface WorkspaceTab {
  id: string;
  kind: WorkspaceTabKind;
  ref: string;
  title: string;
  subtitle?: string;
  href: string;
  pinned: boolean;
  auto: boolean;
}

const TABS_KEY = "consecuencia.tabs.v1";
const SESSION_KEY = "consecuencia.tabs.session.v1";

export function tabIdFor(kind: WorkspaceTabKind, ref: string): string {
  return `${kind}:${ref}`;
}

export const HOME_TAB: WorkspaceTab = {
  id: tabIdFor("ledger", "/dashboard"),
  kind: "ledger",
  ref: "/dashboard",
  title: "Home",
  subtitle: "Workspace",
  href: "/dashboard",
  pinned: true,
  auto: true,
};

function isHomeTab(id: string): boolean {
  return id === HOME_TAB.id;
}

export function isWorkspaceRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/decisions" ||
    pathname.startsWith("/decisions/") ||
    pathname === "/sentinel" ||
    pathname.startsWith("/sentinel/") ||
    pathname === "/drawings" ||
    pathname.startsWith("/drawings/") ||
    pathname === "/failure-graph" ||
    pathname === "/executive-dashboard" ||
    pathname === "/precedents" ||
    pathname === "/certification" ||
    pathname === "/compliance" ||
    pathname === "/copilot" ||
    pathname.startsWith("/copilot/") ||
    pathname === "/suppliers" ||
    pathname.startsWith("/suppliers/") ||
    pathname === "/ingestion" ||
    pathname.startsWith("/ingestion/") ||
    pathname === "/knowledge-graph" ||
    pathname === "/rules" ||
    pathname.startsWith("/rules/") ||
    pathname === "/orchestrator" ||
    pathname.startsWith("/orchestrator/") ||
    pathname === "/reality" ||
    pathname.startsWith("/reality/") ||
    pathname === "/reports" ||
    pathname.startsWith("/reports/") ||
    pathname === "/entities" ||
    pathname.startsWith("/entities/") ||
    pathname === "/documents" ||
    pathname === "/contradictions" ||
    pathname.startsWith("/contradictions/")
  );
}

const LEDGER_TABS: Array<{ path: string; title: string }> = [
  { path: "/dashboard", title: "Mission Console" },
  { path: "/executive-dashboard", title: "Executive Dashboard" },
  { path: "/precedents", title: "Precedent Engine" },
  { path: "/certification", title: "Certification Readiness" },
  { path: "/decisions", title: "Decision Audit Trail" },
  { path: "/sentinel", title: "Decision Sentinel" },
  { path: "/drawings", title: "Drawing Intelligence" },
  { path: "/failure-graph", title: "Failure Graph & Contagion" },
  { path: "/compliance", title: "Compliance Dossier" },
  { path: "/copilot", title: "Engineering Copilot" },
  { path: "/suppliers", title: "Suppliers & Parts" },
  { path: "/ingestion", title: "Ingestion Pipeline" },
  { path: "/knowledge-graph", title: "Knowledge Graph" },
  { path: "/rules", title: "Rules Engine" },
  { path: "/orchestrator", title: "Orchestrator" },
  { path: "/reality", title: "Reality Assessments" },
  { path: "/reports", title: "Reports" },
  { path: "/entities", title: "Entities" },
  { path: "/documents", title: "Documents" },
  { path: "/contradictions", title: "Contradictions" },
];

/**
 * Derives the deterministic tab model for a given route. Returns null for
 * routes that should not surface in the workspace tab bar (auth, settings,
 * legacy comparison jobs, etc.).
 */
export function deriveTabFromPathname(pathname: string): WorkspaceTab | null {
  if (pathname === "/") return null;

  // Drawing comparison jobs are inspected on their dedicated route but still
  // surface a workspace tab keyed to the job id.
  if (pathname.startsWith("/drawings/comparisons/")) {
    const ref = pathname.slice("/drawings/comparisons/".length).split("/")[0];
    if (!ref) return null;
    return {
      id: tabIdFor("drawing", ref),
      kind: "drawing",
      ref,
      title: `Drawing Comparison ${ref.slice(0, 12)}`,
      href: `/drawings/comparisons/${ref}`,
      pinned: false,
      auto: true,
    };
  }

  const detail = (
    prefix: string,
    kind: WorkspaceTabKind,
    titleFor: (ref: string) => string,
    hrefFor: (ref: string) => string,
  ): WorkspaceTab | null => {
    if (!pathname.startsWith(`${prefix}/`)) return null;
    const ref = pathname.slice(prefix.length + 1).split("/")[0];
    if (!ref) return null;
    return {
      id: tabIdFor(kind, ref),
      kind,
      ref,
      title: titleFor(ref),
      href: hrefFor(ref),
      pinned: false,
      auto: true,
    };
  };

  return (
    detail(
      "/decisions",
      "decision",
      (ref) => `Decision ${ref.slice(0, 12)}`,
      (ref) => `/decisions/${ref}`,
    ) ??
    detail(
      "/sentinel",
      "sentinel",
      (ref) => `Sentinel Alert ${ref.slice(0, 12)}`,
      (ref) => `/sentinel/${ref}`,
    ) ??
    detail(
      "/drawings",
      "drawing",
      (ref) => `Drawing ${ref.slice(0, 12)}`,
      (ref) => `/drawings/${ref}`,
    ) ??
    (() => {
      const match = LEDGER_TABS.find((t) => t.path === pathname);
      if (!match) return null;
      return {
        id: tabIdFor("ledger", match.path),
        kind: "ledger" as const,
        ref: match.path,
        title: match.title,
        href: match.path,
        pinned: false,
        auto: true,
      };
    })() ??
    null
  );
}

interface ScopedStore {
  [tabId: string]: Record<string, unknown>;
}

function readStoredTabs(): WorkspaceTab[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TABS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is WorkspaceTab =>
        t !== null &&
        typeof t === "object" &&
        typeof (t as WorkspaceTab).id === "string" &&
        typeof (t as WorkspaceTab).href === "string" &&
        typeof (t as WorkspaceTab).title === "string" &&
        typeof (t as WorkspaceTab).kind === "string",
    );
  } catch {
    return [];
  }
}

function readStoredSession(): {
  activeTabId?: string;
  scoped?: ScopedStore;
  scrollY?: Record<string, number>;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      activeTabId: typeof parsed.activeTabId === "string" ? parsed.activeTabId : undefined,
      scoped: parsed.scoped && typeof parsed.scoped === "object" ? parsed.scoped : undefined,
      scrollY: parsed.scrollY && typeof parsed.scrollY === "object" ? parsed.scrollY : undefined,
    };
  } catch {
    return null;
  }
}

export interface OpenTabOptions {
  kind: WorkspaceTabKind;
  ref: string;
  title: string;
  subtitle?: string;
  href: string;
  pinned?: boolean;
}

export interface WorkspaceTabsValue {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  activeTab: WorkspaceTab | null;
  openTab: (options: OpenTabOptions) => string;
  activateTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeTabs: (ids?: string[]) => void;
  togglePin: (id: string) => void;
  updateTab: (
    id: string,
    patch: Partial<Pick<WorkspaceTab, "title" | "subtitle" | "href" | "pinned">>,
  ) => void;
  getScopedValue: <T>(tabId: string, key: string) => T | undefined;
  setScopedValue: (tabId: string, key: string, value: unknown) => void;
  saveScrollPosition: (tabId: string) => void;
  restoreScrollPosition: (tabId: string) => void;
}

const WorkspaceTabsContext = createContext<WorkspaceTabsValue | null>(null);

function persistSession(activeTabId: string | null) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, activeTabId }));
  } catch {
    // Storage unavailable — workspace tabs remain in-memory only.
  }
}

export function WorkspaceTabsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const initialSession = useMemo(() => readStoredSession(), []);
  const scopedRef = useRef<ScopedStore>(initialSession?.scoped ?? {});
  const scrollYRef = useRef<Record<string, number>>(initialSession?.scrollY ?? {});

  const [tabs, setTabs] = useState<WorkspaceTab[]>(() => readStoredTabs());
  const [activeTabId, setActiveTabId] = useState<string | null>(
    initialSession?.activeTabId ?? null,
  );

  const activeTabIdRef = useRef<string | null>(activeTabId);
  const tabsRef = useRef<WorkspaceTab[]>(tabs);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  // Persist the tab list across reloads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch {
      // Storage unavailable — workspace tabs remain in-memory only.
    }
  }, [tabs]);

  // Persist session shape (active tab) when it changes.
  useEffect(() => {
    persistSession(activeTabId);
  }, [activeTabId]);

  // Keep the active tab synchronized with the current route so opening a
  // record from a ledger automatically surfaces it in the workspace bar.
  useEffect(() => {
    const derived = deriveTabFromPathname(pathname);
    if (derived) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- route is the source of truth for the tab model
      setTabs((prev) => (prev.some((t) => t.id === derived.id) ? prev : [...prev, derived]));
      setActiveTabId(derived.id);
      return;
    }

    const matchingTab = tabsRef.current.find(
      (tab) => tab.href === pathname || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)),
    );
    if (matchingTab) {
      setActiveTabId(matchingTab.id);
      return;
    }

    if (pathname === "/dashboard") {
      setTabs((prev) => (prev.some((t) => t.id === HOME_TAB.id) ? prev : [HOME_TAB, ...prev]));
      setActiveTabId(HOME_TAB.id);
      return;
    }

    setActiveTabId(null);
  }, [pathname]);

  // Capture scroll depth continuously so switching tabs can restore it.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const id = activeTabIdRef.current;
        if (id && typeof window !== "undefined") scrollYRef.current[id] = window.scrollY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const saveScrollPosition = useCallback((tabId: string) => {
    if (typeof window === "undefined") return;
    scrollYRef.current[tabId] = window.scrollY;
  }, []);

  const restoreScrollPosition = useCallback((tabId: string) => {
    if (typeof window === "undefined") return;
    const y = scrollYRef.current[tabId] ?? 0;
    window.setTimeout(() => window.scrollTo(0, y), 60);
  }, []);

  const getScopedValue = useCallback(<T,>(tabId: string, key: string): T | undefined => {
    return scopedRef.current[tabId]?.[key] as T | undefined;
  }, []);

  const setScopedValue = useCallback((tabId: string, key: string, value: unknown) => {
    scopedRef.current[tabId] = { ...scopedRef.current[tabId], [key]: value };
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...parsed, scoped: scopedRef.current, scrollY: scrollYRef.current }),
      );
    } catch {
      // Storage unavailable — scoped state remains in-memory only.
    }
  }, []);

  const openTab = useCallback(
    (options: OpenTabOptions): string => {
      const id = tabIdFor(options.kind, options.ref);
      setTabs((prev) => {
        const existing = prev.find((t) => t.id === id);
        if (existing) {
          if (isHomeTab(id)) return prev;
          return prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title: options.title,
                  subtitle: options.subtitle,
                  href: options.href,
                  pinned: t.pinned || options.pinned === true,
                }
              : t,
          );
        }
        return [
          ...prev,
          {
            id,
            kind: options.kind,
            ref: options.ref,
            title: options.title,
            subtitle: options.subtitle,
            href: options.href,
            pinned: options.pinned === true,
            auto: false,
          },
        ];
      });
      setActiveTabId(id);
      const outgoing = activeTabIdRef.current;
      if (outgoing && typeof window !== "undefined") scrollYRef.current[outgoing] = window.scrollY;
      const current =
        typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
      if (current !== options.href) router.push(options.href, { scroll: false });
      return id;
    },
    [router],
  );

  const activateTab = useCallback(
    (id: string) => {
      const tab = tabsRef.current.find((t) => t.id === id);
      if (!tab) return;
      const outgoing = activeTabIdRef.current;
      if (outgoing && typeof window !== "undefined") scrollYRef.current[outgoing] = window.scrollY;
      setActiveTabId(id);
      const current =
        typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
      if (current !== tab.href) router.push(tab.href, { scroll: false });
      restoreScrollPosition(id);
    },
    [router, restoreScrollPosition],
  );

  const closeTab = useCallback(
    (id: string) => {
      if (isHomeTab(id)) return;
      const index = tabsRef.current.findIndex((t) => t.id === id);
      if (index === -1) return;
      const wasActive = activeTabIdRef.current === id;
      const remaining = tabsRef.current.filter((t) => t.id !== id);
      setTabs((prev) => prev.filter((t) => t.id !== id));
      if (!wasActive) return;
      const neighbor = remaining[Math.min(index, remaining.length - 1)];
      if (neighbor) {
        setActiveTabId(neighbor.id);
        router.push(neighbor.href, { scroll: false });
      } else {
        setActiveTabId(null);
      }
    },
    [router],
  );

  const closeTabs = useCallback(
    (ids?: string[]) => {
      const target = new Set(
        (ids ?? tabsRef.current.map((t) => t.id)).filter((id) => !isHomeTab(id)),
      );
      const remaining = tabsRef.current.filter((t) => !target.has(t.id));
      setTabs((prev) => prev.filter((t) => !target.has(t.id)));
      const active = activeTabIdRef.current;
      if (!active || !target.has(active)) return;
      const index = tabsRef.current.findIndex((t) => t.id === active);
      const neighbor = remaining[Math.min(index, remaining.length - 1)];
      if (neighbor) {
        setActiveTabId(neighbor.id);
        router.push(neighbor.href, { scroll: false });
      } else {
        setActiveTabId(null);
      }
    },
    [router],
  );

  const togglePin = useCallback((id: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }, []);

  const updateTab = useCallback(
    (id: string, patch: Partial<Pick<WorkspaceTab, "title" | "subtitle" | "href" | "pinned">>) => {
      setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [],
  );

  const value = useMemo<WorkspaceTabsValue>(
    () => ({
      tabs,
      activeTabId,
      activeTab: tabs.find((t) => t.id === activeTabId) ?? null,
      openTab,
      activateTab,
      closeTab,
      closeTabs,
      togglePin,
      updateTab,
      getScopedValue,
      setScopedValue,
      saveScrollPosition,
      restoreScrollPosition,
    }),
    [
      tabs,
      activeTabId,
      openTab,
      activateTab,
      closeTab,
      closeTabs,
      togglePin,
      updateTab,
      getScopedValue,
      setScopedValue,
      saveScrollPosition,
      restoreScrollPosition,
    ],
  );

  return <WorkspaceTabsContext.Provider value={value}>{children}</WorkspaceTabsContext.Provider>;
}

/**
 * Restores this record's saved scroll depth when its inspector mounts and
 * captures it again when the inspector unmounts (e.g. switching tabs).
 */
export function useRecordScroll(kind: WorkspaceTabKind, refId: string): void {
  const { saveScrollPosition, restoreScrollPosition } = useWorkspaceTabs();
  const id = tabIdFor(kind, refId);
  useEffect(() => {
    restoreScrollPosition(id);
    return () => saveScrollPosition(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

export function useWorkspaceTabs(): WorkspaceTabsValue {
  const ctx = useContext(WorkspaceTabsContext);
  if (!ctx) {
    throw new Error("useWorkspaceTabs must be used within WorkspaceTabsProvider");
  }
  return ctx;
}

/**
 * Scopes a piece of component state to the currently active workspace tab.
 * When the user switches away and back, the value (filter, form input, etc.)
 * is restored from the tab-scoped store.
 */
export function useScopedTabState<T>(
  key: string,
  fallback: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const ctx = useWorkspaceTabs();
  const tabId = ctx.activeTabId ?? "root";

  const [value, setValue] = useState<T>(() => {
    const stored = ctx.getScopedValue<T>(tabId, key);
    return stored === undefined ? fallback : stored;
  });

  // Re-sync when the active tab changes so each tab keeps its own snapshot.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(() => {
      const stored = ctx.getScopedValue<T>(tabId, key);
      return stored === undefined ? fallback : stored;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, key]);

  const set = useCallback(
    (valueOrFn: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof valueOrFn === "function" ? (valueOrFn as (p: T) => T)(prev) : valueOrFn;
        ctx.setScopedValue(tabId, key, next);
        return next;
      });
    },
    [tabId, key, ctx],
  );

  return [value, set];
}
