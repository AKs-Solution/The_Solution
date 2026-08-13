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
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/shared/utils";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ReactNode> = {
  info: <Info className="size-4 text-sky-600" aria-hidden="true" />,
  success: <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />,
  warning: <TriangleAlert className="size-4 text-amber-600" aria-hidden="true" />,
  error: <XCircle className="size-4 text-rose-600" aria-hidden="true" />,
};

const BORDER: Record<ToastVariant, string> = {
  info: "border-sky-200 bg-white text-zinc-900",
  success: "border-emerald-200 bg-white text-zinc-900",
  warning: "border-amber-200 bg-white text-zinc-900",
  error: "border-rose-200 bg-white text-zinc-900",
};

const VIEWPORT_ID = "consecuencia-toast-viewport";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...item, id }]);
      timers.current[id] = setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        id={VIEWPORT_ID}
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role="alert"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg",
                BORDER[t.variant] ?? BORDER.info,
              )}
            >
              <span className="mt-0.5 shrink-0">{ICONS[t.variant] ?? ICONS.info}</span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold tracking-tight text-zinc-900">
                  {t.title}
                </span>
                {t.description && (
                  <span className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    {t.description}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="cursor-pointer rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-900"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (item) => {
        if (typeof window !== "undefined") {
          console.log(`[Toast ${item.variant || "info"}]`, item.title, item.description);
        }
      },
    };
  }
  return ctx;
}
