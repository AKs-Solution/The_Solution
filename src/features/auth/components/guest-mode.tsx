"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const GUEST_RESTRICTED_CODE = "GUEST_RESTRICTED";

const GUEST_ALLOWED_PREFIXES = [
  "/explore",
  "/search",
  "/knowledge-graph",
  "/evidence",
  "/reasoning",
  "/help",
  "/dashboard",
];

function isGuestAllowedPath(pathname: string): boolean {
  return GUEST_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

interface GuestModeValue {
  isGuest: boolean;
  ready: boolean;
  requestUpgrade: () => void;
}

const GuestModeContext = createContext<GuestModeValue>({
  isGuest: false,
  ready: false,
  requestUpgrade: () => undefined,
});

export function useGuestMode(): GuestModeValue {
  return useContext(GuestModeContext);
}

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isGuest, setIsGuest] = useState(false);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const requestUpgrade = useCallback(() => setModalOpen(true), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (!cancelled) {
            setIsGuest(false);
            setReady(true);
          }
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setIsGuest(json.data?.guest === true);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsGuest(false);
          setReady(true);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !isGuest) return;
    if (pathname === "/dashboard") {
      router.replace("/explore");
    }
  }, [ready, isGuest, pathname, router]);

  useEffect(() => {
    if (!isGuest) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await originalFetch(...args);
      if (res.status === 403) {
        try {
          const body = await res.clone().json();
          if (body?.code === GUEST_RESTRICTED_CODE) {
            setModalOpen(true);
          }
        } catch {
          // ignore non-JSON
        }
      }
      return res;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isGuest]);

  useEffect(() => {
    if (!isGuest) return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      const path = href.split("?")[0];
      if (
        !isGuestAllowedPath(path) &&
        path !== "/" &&
        !path.startsWith("/login") &&
        !path.startsWith("/register")
      ) {
        event.preventDefault();
        event.stopPropagation();
        setModalOpen(true);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isGuest]);

  const value = useMemo(
    () => ({ isGuest, ready, requestUpgrade }),
    [isGuest, ready, requestUpgrade],
  );

  return (
    <GuestModeContext.Provider value={value}>
      {children}
      {isGuest && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Unlock Your Organization's Memory"
          description="Upload your engineering history, supplier records, manufacturing decisions, and quality data to build your organization's permanent decision memory."
        >
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Continue Exploring
            </Button>
            <Button variant="secondary" as="a" href="/login">
              Sign In
            </Button>
            <Button as="a" href="/register">
              Create Account
            </Button>
          </div>
        </Modal>
      )}
    </GuestModeContext.Provider>
  );
}

export const GUEST_SIDEBAR_NAV = [
  { label: "Public explorer", href: "/explore", icon: "LayoutDashboard" },
  { label: "Deterministic search", href: "/search", icon: "Search" },
  { label: "Knowledge graph", href: "/knowledge-graph", icon: "GitBranch" },
  { label: "Evidence chains", href: "/evidence", icon: "FileText" },
  { label: "Reasoning traces", href: "/reasoning", icon: "Brain" },
  { label: "Help", href: "/help", icon: "HelpCircle" },
] as const;
