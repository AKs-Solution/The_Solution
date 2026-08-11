import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  WorkspacePreferencesProvider,
  useWorkspacePreferences,
} from "@/components/layout/workspace-preferences";

function Probe() {
  const ctx = useWorkspacePreferences();
  return (
    <div>
      <span data-testid="density">{ctx.density}</span>
      <span data-testid="layout">{ctx.layout}</span>
      <span data-testid="active-view">{ctx.activeView?.name ?? "none"}</span>
      <span data-testid="visible-count">
        {Object.values(ctx.widgetPrefs).filter((w) => w.visible).length}
      </span>
      <span data-testid="minimized-kpi">{ctx.widgetPrefs["kpi-row"]?.minimized ? "yes" : "no"}</span>
      <span data-testid="order">{ctx.widgetOrder.join(",")}</span>
      <span data-testid="views-count">{ctx.views.length}</span>
      <button type="button" onClick={() => ctx.setDensity("compact")}>
        set-compact
      </button>
      <button type="button" onClick={() => ctx.setLayout("classic")}>
        set-classic-layout
      </button>
      <button type="button" onClick={() => ctx.setWidgetVisible("kpi-row", false)}>
        hide-kpi
      </button>
      <button type="button" onClick={() => ctx.setWidgetMinimized("kpi-row", true)}>
        minimize-kpi
      </button>
      <button type="button" onClick={() => ctx.moveWidget("kpi-row", "down")}>
        move-down
      </button>
      <button type="button" onClick={() => ctx.applyView("quality-audit")}>
        apply-quality
      </button>
      <button type="button" onClick={() => ctx.saveCurrentView("My Custom View")}>
        save-view
      </button>
      <button type="button" onClick={() => ctx.resetWorkspace()}>
        reset
      </button>
    </div>
  );
}

async function renderProbe() {
  await act(async () => {
    render(
      <WorkspacePreferencesProvider>
        <Probe />
      </WorkspacePreferencesProvider>,
    );
  });
}

describe("WorkspacePreferencesProvider", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-density");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: null }) }),
    );
  });

  it("renders default workspace state", async () => {
    await renderProbe();
    expect(screen.getByTestId("density")).toHaveTextContent("comfortable");
    expect(screen.getByTestId("active-view")).toHaveTextContent("Mission Control");
    expect(screen.getByTestId("visible-count")).toHaveTextContent("8");
    expect(screen.getByTestId("views-count")).toHaveTextContent("4");
  });

  it("setDensity updates state and the document density attribute", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "set-compact" }));
    expect(screen.getByTestId("density")).toHaveTextContent("compact");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
  });

  it("defaults to the tabs layout and setLayout switches it", async () => {
    const user = userEvent.setup();
    await renderProbe();
    expect(screen.getByTestId("layout")).toHaveTextContent("tabs");
    await user.click(screen.getByRole("button", { name: "set-classic-layout" }));
    expect(screen.getByTestId("layout")).toHaveTextContent("classic");
  });

  it("setWidgetVisible hides a widget", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "hide-kpi" }));
    expect(screen.getByTestId("visible-count")).toHaveTextContent("7");
  });

  it("setWidgetMinimized collapses a widget", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "minimize-kpi" }));
    expect(screen.getByTestId("minimized-kpi")).toHaveTextContent("yes");
  });

  it("moveWidget reorders the widget list", async () => {
    const user = userEvent.setup();
    await renderProbe();
    const before = screen.getByTestId("order").textContent!.split(",");
    await user.click(screen.getByRole("button", { name: "move-down" }));
    const after = screen.getByTestId("order").textContent!.split(",");
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it("applyView applies a saved view's density and widget prefs", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "apply-quality" }));
    expect(screen.getByTestId("active-view")).toHaveTextContent("Quality Audit View");
    expect(screen.getByTestId("density")).toHaveTextContent("compact");
    expect(screen.getByTestId("visible-count")).toHaveTextContent("6");
  });

  it("saveCurrentView persists the current layout as a new view", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "save-view" }));
    expect(screen.getByTestId("views-count")).toHaveTextContent("5");
    expect(screen.getByTestId("active-view")).toHaveTextContent("My Custom View");
  });

  it("resetWorkspace restores defaults", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "set-compact" }));
    await user.click(screen.getByRole("button", { name: "reset" }));
    expect(screen.getByTestId("density")).toHaveTextContent("comfortable");
    expect(screen.getByTestId("active-view")).toHaveTextContent("Mission Control");
    expect(screen.getByTestId("visible-count")).toHaveTextContent("8");
  });

  it("persists state to localStorage", async () => {
    const user = userEvent.setup();
    await renderProbe();
    await user.click(screen.getByRole("button", { name: "set-compact" }));
    await waitFor(() => {
      const raw = window.localStorage.getItem("morningstar.workspace.v1");
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!).density).toBe("compact");
    });
  });
});
