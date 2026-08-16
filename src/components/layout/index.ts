export { Shell } from "./shell";
export { Sidebar } from "./sidebar";
export { Header } from "./header";
export { Footer } from "./footer";
export { PageContainer } from "./page-container";
export { PageHeader, PAGE_PRIMARY_ACTION_CLASS } from "./page-header";
export { Section } from "./section";
export { Panel } from "./panel";
export { Stack } from "./stack";
export { GridLayout } from "./grid-layout";
export { SplitLayout } from "./split-layout";
export { Breadcrumbs } from "./breadcrumbs";
export { CapabilityHub } from "./capability-hub";
export type { CapabilityHubProps, CapabilityLink } from "./capability-hub";
export {
  WorkspacePreferencesProvider,
  useWorkspacePreferences,
  WORKSPACE_PRESETS,
  DENSITY_LABELS,
  LAYOUT_OPTIONS,
} from "./workspace-preferences";
export type {
  WorkspaceDensity,
  WorkspaceLayout,
  LayoutOption,
  WorkspaceView,
  WorkspaceViewIcon,
  WorkspacePreferencesState,
  WorkspacePreferencesValue,
  WidgetPrefs,
} from "./workspace-preferences";
export { Widget, WidgetGrid, WidgetCustomizeMenu } from "./widget";
export type {
  WidgetConfig,
  WidgetProps,
  WidgetGridProps,
  WidgetCustomizeMenuProps,
} from "./widget";
export { DensitySwitcher, ViewSwitcher } from "./workspace-controls";
export {
  WorkspaceTabsProvider,
  useWorkspaceTabs,
  useScopedTabState,
  tabIdFor,
  deriveTabFromPathname,
  isWorkspaceRoute,
} from "./workspace-tabs";
export type {
  WorkspaceTab,
  WorkspaceTabKind,
  WorkspaceTabsValue,
  OpenTabOptions,
} from "./workspace-tabs";
export { WorkspaceTabBar } from "./workspace-tab-bar";
export { RecordTabs } from "./record-tabs";
export type { RecordTabItem, RecordTabsProps } from "./record-tabs";
export { RecordInspector } from "./record-inspector";
export type { RecordInspectorProps } from "./record-inspector";
export { useRecordScroll } from "./workspace-tabs";
export { DensityToggle } from "./density-toggle";
