import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  WorkspaceTabsProvider,
  useWorkspaceTabs,
  useScopedTabState,
  deriveTabFromPathname,
  tabIdFor,
  isWorkspaceRoute,
} from "@/components/layout/workspace-tabs";

const { pathnameMock, pushMock } = vi.hoisted(() => ({
  pathnameMock: { value: "/" },
  pushMock: { value: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock.value,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => pathnameMock.value,
}));

function Probe() {
  const ctx = useWorkspaceTabs();
  const [draft, setDraft] = useScopedTabState("draft", "default");
  return (
    <div>
      <span data-testid="tab-count">{ctx.tabs.length}</span>
      <span data-testid="active">{ctx.activeTabId ?? "none"}</span>
      <span data-testid="active-title">{ctx.activeTab?.title ?? "none"}</span>
      <span data-testid="ids">{ctx.tabs.map((t) => t.id).join(",")}</span>
      <span data-testid="pins">
        {ctx.tabs.filter((t) => t.pinned).map((t) => t.id).join(",")}
      </span>
      <span data-testid="draft">{draft}</span>
      <button
        type="button"
        onClick={() =>
          ctx.openTab({
            kind: "decision",
            ref: "dec-1",
            title: "Tighten bore tolerance",
            subtitle: "TOLERANCE_CHANGE",
            href: "/decisions/dec-1",
          })
        }
      >
        open-dec
      </button>
      <button
        type="button"
        onClick={() =>
          ctx.openTab({
            kind: "drawing",
            ref: "drw-1",
            title: "AFT_BRACKET_1032",
            subtitle: "COMPLETED",
            href: "/drawings/drw-1",
          })
        }
      >
        open-drawing
      </button>
      <button type="button" onClick={() => ctx.openTab({ kind: "decision", ref: "dec-1", title: "Updated title", subtitle: "APPROVED", href: "/decisions/dec-1" })}>
        open-dec-updated
      </button>
      <button type="button" onClick={() => ctx.activateTab("decision:dec-1")}>
        activate-dec
      </button>
      <button type="button" onClick={() => ctx.activateTab("drawing:drw-1")}>
        activate-drawing
      </button>
      <button type="button" onClick={() => ctx.closeTab("drawing:drw-1")}>
        close-drawing
      </button>
      <button type="button" onClick={() => ctx.closeTabs()}>
        close-all
      </button>
      <button type="button" onClick={() => ctx.togglePin("decision:dec-1")}>
        pin-dec
      </button>
      <button type="button" onClick={() => ctx.setScopedValue(ctx.activeTabId ?? "root", "custom", 42)}>
        set-scoped
      </button>
      <span data-testid="scoped">
        {String(ctx.getScopedValue<number>(ctx.activeTabId ?? "root", "custom") ?? "unset")}
      </span>
      <button type="button" onClick={() => setDraft("draft-A")}>
        set-draft
      </button>
    </div>
  );
}

async function renderProbe(path = "/") {
  pathnameMock.value = path;
  pushMock.value.mockClear();
  await act(async () => {
    render(
      <WorkspaceTabsProvider>
        <Probe />
      </WorkspaceTabsProvider>,
    );
  });
}

describe("workspace tabs engine", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe("pure helpers", () => {
    it("tabIdFor composites kind and ref", () => {
      expect(tabIdFor("decision", "dec-1")).toBe("decision:dec-1");
    });

    it("isWorkspaceRoute recognizes ledger and detail routes only", () => {
      expect(isWorkspaceRoute("/decisions")).toBe(true);
      expect(isWorkspaceRoute("/decisions/dec-1")).toBe(true);
      expect(isWorkspaceRoute("/sentinel/alert-1")).toBe(true);
      expect(isWorkspaceRoute("/drawings/drw-1")).toBe(true);
      expect(isWorkspaceRoute("/executive-dashboard")).toBe(true);
      expect(isWorkspaceRoute("/drawings/comparisons/cmp-1")).toBe(false);
      expect(isWorkspaceRoute("/")).toBe(false);
      expect(isWorkspaceRoute("/settings")).toBe(false);
    });

    it("deriveTabFromPathname creates ledger tabs for list routes", () => {
      const tab = deriveTabFromPathname("/decisions");
      expect(tab).not.toBeNull();
      expect(tab!.id).toBe("ledger:/decisions");
      expect(tab!.kind).toBe("ledger");
      expect(tab!.href).toBe("/decisions");
    });

    it("deriveTabFromPathname creates detail tabs for record routes", () => {
      const tab = deriveTabFromPathname("/decisions/dec-1");
      expect(tab!.id).toBe("decision:dec-1");
      expect(tab!.href).toBe("/decisions/dec-1");
    });

    it("deriveTabFromPathname falls back to a generic tab for other routes", () => {
      const tab = deriveTabFromPathname("/rules");
      expect(tab!.id).toBe("ledger:/rules");
      expect(tab!.title).toBe("Rules");
    });
  });

  it("renders a persistent Home tab even on a non-workspace route", async () => {
    await renderProbe("/");
    expect(screen.getByTestId("tab-count")).toHaveTextContent("1");
    expect(screen.getByTestId("ids")).toHaveTextContent("ledger:/dashboard");
    expect(screen.getByTestId("pins")).toHaveTextContent("ledger:/dashboard");
    expect(screen.getByTestId("active")).toHaveTextContent("none");
  });

  it("home tab survives close-all", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "close-all" }));
    expect(screen.getByTestId("ids")).toHaveTextContent("ledger:/dashboard");
    expect(screen.getByTestId("ids")).not.toHaveTextContent("decision:dec-1");
  });

  it("derives a ledger tab from the current pathname on mount", async () => {
    await renderProbe("/decisions");
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active")).toHaveTextContent("ledger:/decisions");
    expect(screen.getByTestId("active-title")).toHaveTextContent("Decision Audit Trail");
  });

  it("derives a record detail tab and marks it as auto-created", async () => {
    await renderProbe("/decisions/dec-1");
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active")).toHaveTextContent("decision:dec-1");
    expect(decisionTabIsAuto()).toBe(true);
  });

  it("openTab adds a tab, activates it, and pushes the href", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active")).toHaveTextContent("decision:dec-1");
    expect(pushMock.value).toHaveBeenCalledWith("/decisions/dec-1", { scroll: false });
  });

  it("openTab is idempotent: re-opening the same ref updates rather than duplicates", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "open-dec-updated" }));
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("ids")).toHaveTextContent("decision:dec-1");
    expect(screen.getByTestId("active-title")).toHaveTextContent("Updated title");
  });

  it("activateTab switches the active tab and pushes its href", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "open-drawing" }));
    expect(screen.getByTestId("tab-count")).toHaveTextContent("3");
    await user.click(screen.getByRole("button", { name: "activate-dec" }));
    expect(screen.getByTestId("active")).toHaveTextContent("decision:dec-1");
    expect(pushMock.value).toHaveBeenCalledWith("/decisions/dec-1", { scroll: false });
  });

  it("closeTab removes the tab and activates the nearest neighbor", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "open-drawing" }));
    await user.click(screen.getByRole("button", { name: "close-drawing" }));
    expect(screen.getByTestId("tab-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active")).toHaveTextContent("decision:dec-1");
    expect(screen.getByTestId("ids")).not.toHaveTextContent("drawing:drw-1");
  });

  it("togglePin flips the pinned flag", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "pin-dec" }));
    expect(screen.getByTestId("pins")).toHaveTextContent("ledger:/dashboard,decision:dec-1");
    await user.click(screen.getByRole("button", { name: "pin-dec" }));
    expect(screen.getByTestId("pins")).toHaveTextContent("ledger:/dashboard");
  });

  it("scoped values are isolated per active tab", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "set-scoped" }));
    await user.click(screen.getByRole("button", { name: "pin-dec" }));
    expect(screen.getByTestId("scoped")).toHaveTextContent("42");
    await user.click(screen.getByRole("button", { name: "open-drawing" }));
    expect(screen.getByTestId("scoped")).toHaveTextContent("unset");
    await user.click(screen.getByRole("button", { name: "activate-dec" }));
    expect(screen.getByTestId("scoped")).toHaveTextContent("42");
  });

  it("useScopedTabState keeps a per-tab draft and falls back on other tabs", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await user.click(screen.getByRole("button", { name: "set-draft" }));
    expect(screen.getByTestId("draft")).toHaveTextContent("draft-A");
    await user.click(screen.getByRole("button", { name: "open-drawing" }));
    expect(screen.getByTestId("draft")).toHaveTextContent("default");
    await user.click(screen.getByRole("button", { name: "activate-dec" }));
    expect(screen.getByTestId("draft")).toHaveTextContent("draft-A");
  });

  it("persists tabs to localStorage", async () => {
    const user = userEvent.setup();
    await renderProbe("/");
    await user.click(screen.getByRole("button", { name: "open-dec" }));
    await waitFor(() => {
      const raw = window.localStorage.getItem("morningstar.tabs.v1");
      expect(raw).toBeTruthy();
      const parsed: Array<{ id: string; auto?: boolean }> = JSON.parse(raw!);
      const ids = parsed.map((t) => t.id);
      expect(ids).toContain("decision:dec-1");
      expect(ids).toContain("ledger:/dashboard");
    });
  });
});

function decisionTabIsAuto(): boolean {
  const raw = window.localStorage.getItem("morningstar.tabs.v1");
  if (!raw) return false;
  const parsed: Array<{ id: string; auto?: boolean }> = JSON.parse(raw);
  const tab = parsed.find((t) => t.id === "decision:dec-1");
  return tab?.auto === true;
}
