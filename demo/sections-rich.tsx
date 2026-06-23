import { useState } from "react";
import {
  Sparkline,
  BarChart,
  LineChart,
  AreaChart,
  DonutChart,
  GaugeChart,
  RadarChart,
  Button,
  Modal,
  Drawer,
  ConfirmDialog,
  Popover,
  HoverCard,
  Tooltip,
  useToast,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  FAQ,
  TreeView,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Breadcrumbs,
  Pagination,
  Steps,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuSeparator,
  AspectRatio,
  Image,
  Carousel,
  PricingCard,
  FeatureCard,
  StatCard,
  TestimonialCard,
  CTABanner,
  Card,
  Stack,
  SimpleGrid,
  Text,
  Avatar,
} from "../src/index";
import { Section, Example, ChartCard } from "./parts";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

/* -------------------------------------------------------------- Charts ---- */
export function ChartsSection() {
  return (
    <Section id="charts" num="06" title="Charts" subtitle="pure-SVG, no deps">
      <div className="demo-grid-3">
        <ChartCard title="Sparkline">
          <Sparkline
            data={[10, 24, 18, 32, 28, 40, 35, 48]}
            width={200}
            height={56}
            area
            smooth
            showLastPoint
          />
        </ChartCard>

        <ChartCard title="Bar chart">
          <BarChart
            width={260}
            height={160}
            showValues
            data={[
              { label: "Q1", value: 45 },
              { label: "Q2", value: 62 },
              { label: "Q3", value: 58 },
              { label: "Q4", value: 71 },
            ]}
          />
        </ChartCard>

        <ChartCard title="Line chart">
          <LineChart
            width={260}
            height={160}
            smooth
            showPoints
            series={[
              { name: "Sales", data: [10, 20, 25, 18, 30, 28] },
              { name: "Costs", data: [5, 8, 10, 12, 15, 14] },
            ]}
          />
        </ChartCard>

        <ChartCard title="Area chart">
          <AreaChart
            width={260}
            height={160}
            series={[{ name: "Traffic", data: [100, 150, 130, 200, 180, 240] }]}
          />
        </ChartCard>

        <ChartCard title="Donut chart">
          <DonutChart
            size={170}
            centerLabel={<strong>72%</strong>}
            segments={[
              { label: "Direct", value: 300 },
              { label: "Organic", value: 200 },
              { label: "Referral", value: 150 },
            ]}
          />
        </ChartCard>

        <ChartCard title="Gauge chart">
          <GaugeChart
            value={68}
            width={200}
            showNeedle
            thresholds={[
              { at: 0, tone: "danger" },
              { at: 50, tone: "warning" },
              { at: 80, tone: "success" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Radar chart">
          <RadarChart
            size={220}
            axes={["Speed", "Power", "Range", "Defense", "Accuracy"]}
            series={[
              { label: "Alpha", values: [75, 85, 70, 80, 65] },
              { label: "Beta", values: [60, 70, 90, 55, 80] },
            ]}
          />
        </ChartCard>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- Overlay ---- */
export function OverlaySection() {
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { toast } = useToast();

  return (
    <Section id="overlay" num="07" title="Overlay" subtitle="dialogs & layers">
      <SimpleGrid minChildWidth="300px" gap={4}>
        <Example label="Dialogs">
          <div className="demo-row">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Button variant="soft" onClick={() => setDrawer(true)}>
              Open drawer
            </Button>
            <Button tone="danger" variant="soft" onClick={() => setConfirm(true)}>
              Delete…
            </Button>
          </div>
        </Example>

        <Example label="Toasts">
          <div className="demo-row">
            <Button
              variant="soft"
              onClick={() =>
                toast({ title: "Saved", description: "All set.", tone: "success" })
              }
            >
              Success toast
            </Button>
            <Button
              variant="soft"
              tone="danger"
              onClick={() =>
                toast({ title: "Error", description: "Try again.", tone: "danger" })
              }
            >
              Error toast
            </Button>
          </div>
        </Example>

        <Example label="Popover, HoverCard, Tooltip">
          <div className="demo-row">
            <Popover
              arrow
              trigger={<Button variant="outline">Popover</Button>}
              content={
                <div style={{ maxWidth: 220 }}>
                  <Text weight="semibold" size="sm">
                    Quick settings
                  </Text>
                  <Text tone="muted" size="sm">
                    Floating panel anchored to its trigger.
                  </Text>
                </div>
              }
            />
            <HoverCard
              trigger={<Button variant="ghost">Hover me</Button>}
              content={
                <Stack direction="horizontal" gap={3} align="center">
                  <Avatar name="Nova UI" />
                  <div>
                    <Text weight="semibold" size="sm">
                      Nova UI
                    </Text>
                    <Text tone="muted" size="sm">
                      188+ components
                    </Text>
                  </div>
                </Stack>
              }
            />
            <Tooltip content="Tooltip text">
              <Button variant="soft">Tooltip</Button>
            </Tooltip>
          </div>
        </Example>
      </SimpleGrid>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Welcome to Nova UI"
        footer={
          <Stack direction="horizontal" gap={2} justify="end">
            <Button variant="soft" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModal(false)}>Got it</Button>
          </Stack>
        }
      >
        <Modal.Body>
          <Text>
            Modals trap focus, close on Esc, and render above all other content.
          </Text>
        </Modal.Body>
      </Modal>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        placement="right"
        title="Filters"
      >
        <Text tone="muted">Drawer content slides in from the edge.</Text>
      </Drawer>

      <ConfirmDialog
        open={confirm}
        tone="danger"
        title="Delete project?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
      />
    </Section>
  );
}

/* ---------------------------------------------------------- Disclosure ---- */
const TREE = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "components", label: "components" },
      { id: "styles", label: "styles" },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "demo", label: "demo" },
];

export function DisclosureSection() {
  return (
    <Section id="disclosure" num="08" title="Disclosure" subtitle="expand & collapse">
      <SimpleGrid minChildWidth="320px" gap={4}>
        <Example label="Accordion">
          <Accordion type="single" defaultValue="a1" variant="separated">
            <AccordionItem value="a1">
              <AccordionTrigger>What is Nova UI?</AccordionTrigger>
              <AccordionPanel>
                A themeable React + TypeScript component library.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionPanel>
                Components ship with sensible ARIA and keyboard support.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Example>

        <Example label="Collapsible & FAQ">
          <Stack gap={3}>
            <Collapsible>
              <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
              <CollapsibleContent>
                <Text size="sm" tone="muted" style={{ marginTop: "0.5rem" }}>
                  Hidden content revealed on demand.
                </Text>
              </CollapsibleContent>
            </Collapsible>
            <FAQ
              defaultOpen={["q1"]}
              items={[
                { id: "q1", question: "Can I theme it?", answer: "Yes — light & dark out of the box." },
                { id: "q2", question: "Tree-shakeable?", answer: "Yes, import only what you use." },
              ]}
            />
          </Stack>
        </Example>

        <Example label="TreeView">
          <TreeView items={TREE} defaultExpandedIds={["src"]} defaultSelectedId="index" />
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* --------------------------------------------------------- Navigation ---- */
export function NavigationSection() {
  const [page, setPage] = useState(2);
  return (
    <Section id="navigation" num="09" title="Navigation" subtitle="wayfinding">
      <Stack gap={4}>
        <Example label="Tabs">
          <Tabs defaultValue="overview" variant="soft">
            <TabList>
              <Tab value="overview">Overview</Tab>
              <Tab value="analytics">Analytics</Tab>
              <Tab value="settings">Settings</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="overview">
                <Text style={{ paddingTop: "0.75rem" }}>Overview panel content.</Text>
              </TabPanel>
              <TabPanel value="analytics">
                <Text style={{ paddingTop: "0.75rem" }}>Analytics panel content.</Text>
              </TabPanel>
              <TabPanel value="settings">
                <Text style={{ paddingTop: "0.75rem" }}>Settings panel content.</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Example>

        <SimpleGrid minChildWidth="300px" gap={4}>
          <Example label="Breadcrumbs & Menu">
            <Stack gap={3}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "#" },
                  { label: "Components", href: "#" },
                  { label: "Navigation" },
                ]}
              />
              <Menu>
                <MenuTrigger>Actions ▾</MenuTrigger>
                <MenuList>
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Duplicate</MenuItem>
                  <MenuSeparator />
                  <MenuItem danger>Delete</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Example>

          <Example label="Pagination">
            <Pagination page={page} count={8} onPageChange={setPage} />
          </Example>
        </SimpleGrid>

        <Example label="Steps">
          <Steps
            current={1}
            items={[
              { title: "Account", description: "Create login" },
              { title: "Profile", description: "Add details" },
              { title: "Done", description: "All set" },
            ]}
          />
        </Example>
      </Stack>
    </Section>
  );
}

/* --------------------------------------------------------------- Media ---- */
export function MediaSection() {
  return (
    <Section id="media" num="10" title="Media" subtitle="images & carousel">
      <SimpleGrid minChildWidth="320px" gap={4}>
        <Example label="AspectRatio + Image">
          <AspectRatio ratio={16 / 9}>
            <Image src={img("nova-media")} alt="Sample" rounded fit="cover" />
          </AspectRatio>
        </Example>

        <Example label="Carousel">
          <Carousel autoPlay interval={4000} aria-label="Gallery">
            {["a", "b", "c"].map((s) => (
              <AspectRatio key={s} ratio={16 / 9}>
                <Image src={img(`nova-${s}`)} alt={`Slide ${s}`} rounded />
              </AspectRatio>
            ))}
          </Carousel>
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* -------------------------------------------------------------- Blocks ---- */
export function BlocksSection() {
  return (
    <Section id="blocks" num="11" title="Blocks" subtitle="composed sections">
      <Stack gap={4}>
        <div className="demo-grid-2">
          <StatCard
            label="Monthly revenue"
            value="$48.2k"
            description="vs last month"
            delta={{ direction: "up", value: "12%", positive: true }}
          />
          <FeatureCard
            title="Tree-shakeable"
            description="Import only what you use. Zero runtime dependencies."
            linkLabel="Learn more"
            href="#"
          />
          <TestimonialCard
            quote="Nova UI let us ship a polished product in days, not weeks."
            author="Jane Doe"
            role="CTO, Acme"
            rating={5}
            avatar={<Avatar name="Jane Doe" />}
          />
          <Card variant="outlined" padding={0}>
            <PricingCard
              name="Pro"
              price="$29"
              period="/mo"
              highlighted
              features={[
                "All 188+ components",
                "Light & dark themes",
                { label: "Priority support", included: true },
                { label: "On-prem deploy", included: false },
              ]}
              ctaLabel="Get started"
            />
          </Card>
        </div>

        <CTABanner
          title="Build something beautiful"
          subtitle="Start with Nova UI today."
          primaryAction={<Button>Get started</Button>}
          secondaryAction={
            <Button variant="ghost" tone="neutral">
              Read docs
            </Button>
          }
        />
      </Stack>
    </Section>
  );
}
