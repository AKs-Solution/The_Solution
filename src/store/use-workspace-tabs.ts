"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface WorkspaceTabItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  isActive: boolean;
  isPinned?: boolean;
}

export interface WorkspaceTabsState {
  tabs: WorkspaceTabItem[];
  openTab: (tab: Omit<WorkspaceTabItem, "isActive"> & { isActive?: boolean }) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  pinTab: (id: string) => void;
}

const STORAGE_KEY = "consecuencia.workspace.tabs.v2";

const DEFAULT_TABS: WorkspaceTabItem[] = [
  {
    id: "dashboard",
    title: "Executive Mission Console",
    path: "/dashboard",
    icon: "LayoutDashboard",
    isActive: true,
    isPinned: true,
  },
  {
    id: "decisions",
    title: "Decision Intelligence",
    path: "/decisions",
    icon: "GitBranch",
    isActive: false,
  },
  {
    id: "sentinel",
    title: "Sentinel Surveillance",
    path: "/sentinel",
    icon: "Activity",
    isActive: false,
  },
];

let globalTabs: WorkspaceTabItem[] = DEFAULT_TABS;
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalTabs));
    } catch {
      // Ignore quota errors
    }
  }
  for (const listener of listeners) {
    listener();
  }
}

// Initialize from localStorage in browser
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalTabs = parsed;
      }
    }
  } catch {
    globalTabs = DEFAULT_TABS;
  }
}

export function useWorkspaceTabs(): WorkspaceTabsState {
  const tabs = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => globalTabs,
    () => DEFAULT_TABS,
  );

  const openTab = useCallback((newTab: Omit<WorkspaceTabItem, "isActive"> & { isActive?: boolean }) => {
    const existing = globalTabs.find((t) => t.id === newTab.id || t.path === newTab.path);
    if (existing) {
      globalTabs = globalTabs.map((t) => ({
        ...t,
        isActive: t.id === existing.id,
      }));
    } else {
      globalTabs = [
        ...globalTabs.map((t) => ({ ...t, isActive: false })),
        {
          ...newTab,
          isActive: true,
          isPinned: newTab.isPinned ?? false,
        },
      ];
    }
    emitChange();
  }, []);

  const closeTab = useCallback((id: string) => {
    const tabToClose = globalTabs.find((t) => t.id === id);
    if (tabToClose?.isPinned) return;

    const remaining = globalTabs.filter((t) => t.id !== id);
    if (remaining.length === 0) {
      globalTabs = DEFAULT_TABS;
    } else {
      const wasActive = tabToClose?.isActive;
      if (wasActive) {
        remaining[remaining.length - 1].isActive = true;
      }
      globalTabs = remaining;
    }
    emitChange();
  }, []);

  const setActiveTab = useCallback((id: string) => {
    globalTabs = globalTabs.map((t) => ({
      ...t,
      isActive: t.id === id,
    }));
    emitChange();
  }, []);

  const pinTab = useCallback((id: string) => {
    globalTabs = globalTabs.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    emitChange();
  }, []);

  return {
    tabs,
    openTab,
    closeTab,
    setActiveTab,
    pinTab,
  };
}
