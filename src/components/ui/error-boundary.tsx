"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.name || "Widget"}]`, error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertOctagon className="size-5" />
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold text-slate-200">
              {this.props.name ? `${this.props.name} Failed to Load` : "Telemetry Component Error"}
            </p>
            <p className="mt-1 font-mono text-xs text-rose-400/80 truncate">
              {this.state.error?.message || "An unexpected error occurred in this workspace view."}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={this.reset}
            className="mt-1 border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
