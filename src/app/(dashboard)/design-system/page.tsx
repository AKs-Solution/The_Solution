"use client";

import { useState } from "react";
import { PageContainer, Section, Panel, Stack, GridLayout } from "@/components/layout";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Avatar,
  Chip,
  Divider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tooltip,
  Modal,
  Drawer,
  Alert,
  AlertTitle,
  AlertDescription,
  LoadingSpinner,
  Skeleton,
  Progress,
  Pagination,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  StatusIndicator,
  MetricCard,
  KeyValue,
  PropertyGrid,
  TagCollection,
  Breadcrumb,
} from "@/components/ui";

const selectOptions = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  { value: "option-3", label: "Option 3" },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Design System", href: "/design-system" },
  { label: "Overview" },
];

const sampleTags = [
  { id: "1", label: "TypeScript" },
  { id: "2", label: "React" },
  { id: "3", label: "Next.js" },
];

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState("tab1");

  return (
    <PageContainer maxWidth="full">
      <Stack gap={8}>
        <Section
          title="Design System"
          description="Enterprise UI component library for Consecuencia by AK. All components support light and dark mode, keyboard navigation, and screen readers."
        >
          <Breadcrumb items={breadcrumbItems} />
        </Section>

        <Section title="Buttons" description="Actions and triggers for user interactions.">
          <Stack direction="row" gap={2} align="center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </Stack>
          <Stack direction="row" gap={2} align="center" className="mt-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Stack>
        </Section>

        <Section title="Form Controls" description="Standard form input components.">
          <GridLayout columns={2} gap={6}>
            <Panel>
              <Stack gap={3}>
                <Input label="Text Input" placeholder="Enter text..." />
                <Input
                  label="With Error"
                  error="This field is required"
                  placeholder="Invalid value"
                />
                <Input label="Disabled" disabled placeholder="Cannot edit" />
              </Stack>
            </Panel>
            <Panel>
              <Stack gap={3}>
                <Textarea label="Textarea" placeholder="Enter multiline text..." />
                <Select label="Select" options={selectOptions} placeholder="Choose an option" />
                <Select label="With Error" options={selectOptions} error="Please select a value" />
              </Stack>
            </Panel>
          </GridLayout>
          <Panel className="mt-4">
            <Stack gap={3}>
              <Checkbox label="Checkbox option" />
              <Checkbox label="Disabled checkbox" disabled />
              <Radio name="radio-group" label="Radio option 1" />
              <Radio name="radio-group" label="Radio option 2" />
              <Switch label="Toggle switch" />
              <Switch label="Disabled switch" disabled />
            </Stack>
          </Panel>
        </Section>

        <Section title="Badges & Indicators" description="Status labels, tags, and status dots.">
          <Stack gap={3}>
            <Stack direction="row" gap={2} align="center">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="outline">Outline</Badge>
            </Stack>
            <Stack direction="row" gap={2} align="center">
              <StatusIndicator status="active" label="Active" />
              <StatusIndicator status="inactive" label="Inactive" />
              <StatusIndicator status="pending" label="Pending" />
              <StatusIndicator status="error" label="Error" />
              <StatusIndicator status="success" label="Success" />
              <StatusIndicator status="warning" label="Warning" />
            </Stack>
            <TagCollection tags={sampleTags} />
            <Stack direction="row" gap={2} align="center">
              <Chip variant="default">Default chip</Chip>
              <Chip variant="secondary">Secondary chip</Chip>
              <Chip variant="outline">Outline chip</Chip>
            </Stack>
          </Stack>
        </Section>

        <Section title="Avatar" description="User avatar with image or initials fallback.">
          <Stack direction="row" gap={3} align="center">
            <Avatar size="sm" initials="JD" />
            <Avatar size="md" initials="AK" />
            <Avatar size="lg" initials="MS" />
          </Stack>
        </Section>

        <Section title="Card" description="Content containers for grouping information.">
          <GridLayout columns={3} gap={4}>
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>With header, content, and footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This is the card body content. Cards are used to group related information.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Simple card with just content, no header or footer.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Metric Card</CardTitle>
                <CardDescription>Quick stats at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-2xl font-semibold">42</p>
                <p className="text-muted-foreground text-xs">Active projects</p>
              </CardContent>
            </Card>
          </GridLayout>
        </Section>

        <Section title="Metric Cards" description="KPI display cards.">
          <GridLayout columns={4} gap={4}>
            <MetricCard label="Total Revenue" value="$84,250" trend="up" trendValue="+12.5%" />
            <MetricCard label="Active Users" value="2,340" trend="up" trendValue="+8.1%" />
            <MetricCard label="Error Rate" value="0.12%" trend="down" trendValue="-0.04%" />
            <MetricCard label="Pending Tasks" value="23" trend="neutral" trendValue="No change" />
          </GridLayout>
        </Section>

        <Section title="Tabs" description="Tabbed content navigation.">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
              <TabsTrigger value="tab3">Tab Three</TabsTrigger>
            </TabsList>
            <Panel className="mt-2">
              <TabsContent value="tab1">
                <p className="text-muted-foreground text-sm">Content for tab one.</p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="text-muted-foreground text-sm">Content for tab two.</p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="text-muted-foreground text-sm">Content for tab three.</p>
              </TabsContent>
            </Panel>
          </Tabs>
        </Section>

        <Section title="Accordion" description="Expandable content sections.">
          <Accordion type="single" defaultValue={["item-1"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Consecuencia by AK?</AccordionTrigger>
              <AccordionContent>
                An Aerospace Decision Intelligence & Engineering Reality Platform that verifies engineering truth through
                deterministic, evidence-based reasoning.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the design system work?</AccordionTrigger>
              <AccordionContent>
                The design system uses centralized tokens, Tailwind CSS variables, and accessible
                patterns to ensure consistent UI across all features.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What accessibility features are supported?</AccordionTrigger>
              <AccordionContent>
                All components support keyboard navigation, ARIA labels, focus states, screen
                readers, and WCAG-compliant color contrast.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Tooltip" description="Hover tooltips for additional context.">
          <Stack direction="row" gap={4} align="center">
            <Tooltip content="Top tooltip" side="top">
              <Button variant="secondary" size="sm">
                Hover Top
              </Button>
            </Tooltip>
            <Tooltip content="Bottom tooltip" side="bottom">
              <Button variant="secondary" size="sm">
                Hover Bottom
              </Button>
            </Tooltip>
            <Tooltip content="Left tooltip" side="left">
              <Button variant="secondary" size="sm">
                Hover Left
              </Button>
            </Tooltip>
            <Tooltip content="Right tooltip" side="right">
              <Button variant="secondary" size="sm">
                Hover Right
              </Button>
            </Tooltip>
          </Stack>
        </Section>

        <Section title="Alerts" description="Feedback messages for different states.">
          <Stack gap={2}>
            <Alert variant="info">
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>This is an informational message for the user.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Operation completed successfully.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>Please review before proceeding.</AlertDescription>
            </Alert>
            <Alert variant="error">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong. Please try again.</AlertDescription>
            </Alert>
          </Stack>
        </Section>

        <Section title="Loading & Progress" description="Indicators for async operations.">
          <Stack gap={3}>
            <Stack direction="row" gap={3} align="center">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </Stack>
            <Progress value={65} variant="default" />
            <Progress value={100} variant="success" />
            <Progress value={45} variant="warning" />
            <Stack direction="row" gap={3} align="center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-10 w-48" />
            </Stack>
          </Stack>
        </Section>

        <Section title="Modals & Drawers" description="Overlay content containers.">
          <Stack direction="row" gap={2}>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
          </Stack>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal Title"
            description="This is a modal dialog for focused content."
          >
            <p className="text-muted-foreground text-sm">
              Modal content goes here. Press Escape or click outside to close.
            </p>
          </Modal>
          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer Panel">
            <p className="text-muted-foreground text-sm">
              Drawer content for side panel interactions.
            </p>
          </Drawer>
        </Section>

        <Section title="Table" description="Structured data display.">
          <Panel variant="bordered" padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Alice Johnson", status: "active", role: "Engineer" },
                  { name: "Bob Smith", status: "pending", role: "Reviewer" },
                  { name: "Carol White", status: "active", role: "Admin" },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <StatusIndicator status={row.status as "active" | "pending"} size="sm" />
                    </TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </Section>

        <Section title="Pagination" description="Page navigation for lists and tables.">
          <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
        </Section>

        <Section title="Key-Value Display" description="Structured property display.">
          <GridLayout columns={2} gap={4}>
            <Panel>
              <KeyValue
                direction="column"
                pairs={[
                  { key: "Project", value: "Consecuencia by AK" },
                  { key: "Version", value: "0.1.0" },
                  { key: "Status", value: "Production Certified" },
                  { key: "Last Deployed", value: "2026-07-13" },
                ]}
              />
            </Panel>
            <Panel>
              <KeyValue
                direction="row"
                pairs={[
                  { key: "Uptime", value: "99.9%" },
                  { key: "Region", value: "US-East" },
                  { key: "Nodes", value: "12" },
                ]}
              />
            </Panel>
          </GridLayout>
        </Section>

        <Section title="Property Grid" description="Multi-column property layout.">
          <PropertyGrid columns={4}>
            {[
              { label: "Type", value: "Enterprise" },
              { label: "Category", value: "Platform" },
              { label: "Framework", value: "Next.js" },
              { label: "Database", value: "PostgreSQL" },
            ].map((prop) => (
              <Panel key={prop.label} variant="muted" padding="sm">
                <p className="text-muted-foreground text-xs">{prop.label}</p>
                <p className="text-foreground text-sm font-medium">{prop.value}</p>
              </Panel>
            ))}
          </PropertyGrid>
        </Section>

        <Section title="Data Display" description="Divider and empty state.">
          <Divider />
          <EmptyState
            icon={<div className="text-2xl">&#128196;</div>}
            title="No documents yet"
            description="Create your first document to get started."
            action={<Button size="sm">Create Document</Button>}
          />
        </Section>
      </Stack>
    </PageContainer>
  );
}
