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
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600">
            <AlertOctagon className="size-5" />
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold text-zinc-900">
              {this.props.name ? `${this.props.name} Failed to Load` : "Telemetry Component Error"}
            </p>
            <p className="mt-1 font-mono text-xs text-rose-600">
              {this.state.error?.message || "An unexpected error occurred in this workspace view."}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={this.reset}
            className="mt-1 border border-zinc-200 bg-white text-xs text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
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
