import { useState } from "react";
import {
  // commerce
  PriceTag,
  QuantityStepper,
  RatingSummary,
  AddToCartButton,
  CheckoutSummary,
  ShippingTracker,
  CouponInput,
  // motion
  Fade,
  Slide,
  Scale,
  Collapse,
  Marquee,
  Typewriter,
  Stagger,
  Ripple,
  // dnd
  Sortable,
  // charts
  StackedBarChart,
  ScatterChart,
  Funnel,
  Heatmap,
  ActivityRings,
  BulletChart,
  ComboChart,
  WaterfallChart,
  Treemap,
  // data display
  JsonViewer,
  CodeBlock,
  CalendarHeatmap,
  Leaderboard,
  TagCloud,
  Statistic,
  KanbanBoard,
  ComparisonTable,
  FileTree,
  // inputs
  DatePicker,
  MultiSelect,
  ColorPicker,
  FileDropzone,
  Combobox,
  RangeSlider,
  NumberInput,
  TimePicker,
  // nav / overlay extras
  TabBar,
  Sheet,
  ContextMenu,
  // primitives
  Button,
  Badge,
  Card,
  Stack,
  SimpleGrid,
  Text,
  Avatar,
} from "../src/index";
import { Section, Example, ChartCard } from "./parts";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

/* ------------------------------------------------------------ Commerce ---- */
export function CommerceSection() {
  const [qty, setQty] = useState(2);
  const [cart, setCart] = useState<"idle" | "loading" | "added">("idle");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | undefined>(undefined);

  const handleAdd = () => {
    setCart("loading");
    setTimeout(() => setCart("added"), 800);
    setTimeout(() => setCart("idle"), 2400);
  };

  return (
    <Section id="commerce" num="12" title="Commerce" subtitle="storefront UI">
      <SimpleGrid minChildWidth="300px" gap={4}>
        <Example label="PriceTag">
          <Stack direction="horizontal" gap={4} align="center">
            <PriceTag amount={49} size="lg" />
            <PriceTag amount={39} originalAmount={59} size="lg" />
          </Stack>
        </Example>

        <Example label="QuantityStepper">
          <QuantityStepper value={qty} min={1} max={10} onChange={setQty} />
        </Example>

        <Example label="RatingSummary">
          <RatingSummary
            average={4.3}
            distribution={{ 5: 120, 4: 48, 3: 18, 2: 6, 1: 4 }}
          />
        </Example>

        <Example label="AddToCartButton">
          <AddToCartButton state={cart} price="$39.00" onClick={handleAdd} />
        </Example>

        <Example label="CouponInput">
          <CouponInput
            value={coupon}
            onChange={setCoupon}
            appliedCode={applied}
            onApply={(v) => setApplied(v || "SAVE10")}
            onRemove={() => {
              setApplied(undefined);
              setCoupon("");
            }}
          />
        </Example>

        <Example label="ShippingTracker">
          <ShippingTracker
            current={2}
            stages={[
              { label: "Ordered", date: "Jun 16" },
              { label: "Shipped", date: "Jun 18" },
              { label: "In transit", date: "Jun 20" },
              { label: "Delivered" },
            ]}
          />
        </Example>
      </SimpleGrid>

      <div style={{ maxWidth: 360, marginTop: "1rem" }}>
        <CheckoutSummary
          subtotal="$120.00"
          shipping="Free"
          tax="$9.60"
          discount="-$12.00"
          total="$117.60"
          cta={<Button fullWidth>Checkout</Button>}
        />
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- Motion ---- */
export function MotionSection() {
  const [show, setShow] = useState(true);
  const [open, setOpen] = useState(true);

  return (
    <Section id="motion" num="13" title="Motion" subtitle="transitions & effects">
      <Stack gap={4}>
        <Example label="Fade / Slide / Scale / Collapse">
          <Stack gap={3}>
            <div className="demo-row">
              <Button size="sm" variant="soft" onClick={() => setShow((s) => !s)}>
                {show ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="soft" onClick={() => setOpen((o) => !o)}>
                {open ? "Collapse" : "Expand"}
              </Button>
            </div>
            <SimpleGrid minChildWidth="160px" gap={3}>
              <Fade in={show}>
                <Card variant="outlined" padding={4}>
                  <Text size="sm">Fade</Text>
                </Card>
              </Fade>
              <Slide in={show} direction="up">
                <Card variant="outlined" padding={4}>
                  <Text size="sm">Slide</Text>
                </Card>
              </Slide>
              <Scale in={show}>
                <Card variant="outlined" padding={4}>
                  <Text size="sm">Scale</Text>
                </Card>
              </Scale>
            </SimpleGrid>
            <Collapse open={open}>
              <Card variant="outlined" padding={4}>
                <Text size="sm" tone="muted">
                  Collapsible region — animates its own height.
                </Text>
              </Card>
            </Collapse>
          </Stack>
        </Example>

        <SimpleGrid minChildWidth="300px" gap={4}>
          <Example label="Marquee">
            <Marquee speed={50}>
              <Stack direction="horizontal" gap={4} align="center">
                {["React", "TypeScript", "Zero deps", "Themeable", "Accessible"].map(
                  (t) => (
                    <Badge key={t} tone="primary" variant="soft">
                      {t}
                    </Badge>
                  )
                )}
              </Stack>
            </Marquee>
          </Example>

          <Example label="Typewriter">
            <Text size="lg" weight="semibold">
              <Typewriter text={["Build fast.", "Ship beautiful.", "Stay light."]} />
            </Text>
          </Example>

          <Example label="Ripple">
            <Ripple>
              <Button variant="soft">Click for ripple</Button>
            </Ripple>
          </Example>
        </SimpleGrid>

        <Example label="Stagger">
          <Stagger gap={80}>
            {["One", "Two", "Three", "Four"].map((n) => (
              <Card key={n} variant="outlined" padding={3} style={{ marginBottom: 8 }}>
                <Text size="sm">{n}</Text>
              </Card>
            ))}
          </Stagger>
        </Example>
      </Stack>
    </Section>
  );
}

/* ----------------------------------------------------------------- DnD ---- */
interface SortItem {
  id: string;
  label: string;
}

export function DndSection() {
  const [items, setItems] = useState<SortItem[]>([
    { id: "a", label: "Draft proposal" },
    { id: "b", label: "Review with team" },
    { id: "c", label: "Send to client" },
    { id: "d", label: "Archive" },
  ]);

  return (
    <Section id="dnd" num="14" title="Drag & Drop" subtitle="reorderable lists">
      <Example label="Sortable list">
        <Sortable
          items={items}
          onReorder={(next) => setItems(next)}
          renderItem={(item, { handleProps }) => (
            <Card
              variant="outlined"
              padding={3}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span {...handleProps} style={{ cursor: "grab", color: "var(--nova-text-muted)" }}>
                ⋮⋮
              </span>
              <Text size="sm">{item.label}</Text>
            </Card>
          )}
        />
      </Example>
    </Section>
  );
}

/* ----------------------------------------------------------- More charts ---- */
export function MoreChartsSection() {
  return (
    <Section id="charts-more" num="15" title="More Charts" subtitle="extended SVG set">
      <div className="demo-grid-3">
        <ChartCard title="Stacked bar">
          <StackedBarChart
            width={280}
            height={180}
            data={[
              { label: "Q1", new: 30, returning: 20 },
              { label: "Q2", new: 42, returning: 28 },
              { label: "Q3", new: 38, returning: 34 },
              { label: "Q4", new: 50, returning: 30 },
            ]}
            series={[
              { key: "new", label: "New" },
              { key: "returning", label: "Returning" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Scatter">
          <ScatterChart
            width={280}
            height={200}
            series={[
              {
                label: "Group A",
                points: [
                  { x: 10, y: 20 },
                  { x: 25, y: 35 },
                  { x: 40, y: 30 },
                  { x: 55, y: 50 },
                  { x: 70, y: 45 },
                ],
              },
              {
                label: "Group B",
                points: [
                  { x: 15, y: 10 },
                  { x: 30, y: 18 },
                  { x: 50, y: 22 },
                  { x: 65, y: 28 },
                ],
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Funnel">
          <Funnel
            width={280}
            stages={[
              { label: "Visits", value: 1000 },
              { label: "Signups", value: 620 },
              { label: "Trials", value: 310 },
              { label: "Paid", value: 120 },
            ]}
          />
        </ChartCard>

        <ChartCard title="Heatmap">
          <Heatmap
            cellSize={28}
            xLabels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
            yLabels={["AM", "Noon", "PM"]}
            matrix={[
              [2, 5, 8, 6, 3],
              [7, 9, 4, 8, 6],
              [3, 6, 7, 5, 9],
            ]}
          />
        </ChartCard>

        <ChartCard title="Activity rings">
          <ActivityRings
            size={180}
            rings={[
              { label: "Move", value: 78, tone: "danger" },
              { label: "Exercise", value: 55, tone: "success" },
              { label: "Stand", value: 90, tone: "info" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Bullet">
          <BulletChart
            value={72}
            target={80}
            max={100}
            title="Revenue"
            ranges={[{ to: 50 }, { to: 75 }, { to: 100 }]}
          />
        </ChartCard>

        <ChartCard title="Combo">
          <ComboChart
            width={300}
            height={200}
            data={[
              { label: "Jan", bar: 40, line: 12 },
              { label: "Feb", bar: 55, line: 18 },
              { label: "Mar", bar: 48, line: 22 },
              { label: "Apr", bar: 62, line: 28 },
            ]}
          />
        </ChartCard>

        <ChartCard title="Waterfall">
          <WaterfallChart
            width={300}
            height={200}
            data={[
              { label: "Start", value: 100, total: true },
              { label: "Sales", value: 60 },
              { label: "Refunds", value: -25 },
              { label: "Fees", value: -15 },
              { label: "End", value: 120, total: true },
            ]}
          />
        </ChartCard>

        <ChartCard title="Treemap">
          <Treemap
            width={300}
            height={200}
            data={[
              { label: "Search", value: 50 },
              { label: "Direct", value: 30 },
              { label: "Social", value: 20 },
              { label: "Email", value: 12 },
              { label: "Referral", value: 8 },
            ]}
          />
        </ChartCard>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------ More data display ---- */
const SAMPLE_JSON = {
  name: "Nova UI",
  version: "1.0.0",
  themeable: true,
  categories: 15,
  components: 273,
  tags: ["react", "typescript", "zero-deps"],
  author: { name: "Nova", url: "https://example.com" },
};

const CODE_SAMPLE = `import { Button } from "nova-ui";

export function App() {
  return <Button variant="soft">Click me</Button>;
}`;

const calendarValues = Array.from({ length: 60 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return {
    date: d.toISOString().slice(0, 10),
    count: Math.floor(Math.random() * 6),
  };
});

export function MoreDataSection() {
  return (
    <Section id="data-more" num="16" title="More Data Display" subtitle="rich data UI">
      <SimpleGrid minChildWidth="320px" gap={4}>
        <Example label="Statistic">
          <Stack direction="horizontal" gap={5}>
            <Statistic value="12.4k" label="Active users" trend="up" trendValue="8%" />
            <Statistic value="98.2" suffix="%" label="Uptime" trend="up" trendValue="0.3%" />
          </Stack>
        </Example>

        <Example label="JsonViewer">
          <JsonViewer data={SAMPLE_JSON} defaultExpandedDepth={2} />
        </Example>

        <Example label="CodeBlock">
          <CodeBlock code={CODE_SAMPLE} language="tsx" filename="App.tsx" />
        </Example>

        <Example label="TagCloud">
          <TagCloud
            tags={[
              { label: "React", weight: 90 },
              { label: "TypeScript", weight: 80 },
              { label: "CSS", weight: 50 },
              { label: "A11y", weight: 65 },
              { label: "Themes", weight: 40 },
              { label: "Charts", weight: 70 },
              { label: "Forms", weight: 55 },
            ]}
          />
        </Example>

        <Example label="Leaderboard">
          <Leaderboard
            currentUserId="u3"
            entries={[
              { id: "u1", rank: 1, name: "Ada", score: "9,820", delta: 0 },
              { id: "u2", rank: 2, name: "Linus", score: "9,310", delta: 1 },
              { id: "u3", rank: 3, name: "You", score: "8,940", delta: 2 },
              { id: "u4", rank: 4, name: "Grace", score: "8,120", delta: -1 },
            ]}
          />
        </Example>

        <Example label="FileTree">
          <FileTree
            defaultExpandedIds={["src", "components"]}
            activeId="index"
            nodes={[
              {
                id: "src",
                name: "src",
                children: [
                  {
                    id: "components",
                    name: "components",
                    children: [{ id: "Button", name: "Button.tsx" }],
                  },
                  { id: "index", name: "index.ts" },
                ],
              },
              { id: "readme", name: "README.md" },
            ]}
          />
        </Example>

        <Example label="ComparisonTable">
          <ComparisonTable
            featureHeading="Feature"
            columns={[
              { id: "free", title: "Free" },
              { id: "pro", title: "Pro", highlighted: true },
            ]}
            rows={[
              { id: "r1", feature: "Components", values: { free: "50", pro: "273+" } },
              { id: "r2", feature: "Dark mode", values: { free: true, pro: true } },
              { id: "r3", feature: "Priority support", values: { free: false, pro: true } },
            ]}
          />
        </Example>

        <Example label="CalendarHeatmap">
          <CalendarHeatmap values={calendarValues} />
        </Example>
      </SimpleGrid>

      <Example label="KanbanBoard" style={{ marginTop: "1rem" }}>
        <KanbanBoard
          columns={[
            {
              id: "todo",
              title: "To do",
              tone: "neutral",
              items: [
                { id: "k1", title: "Spec API" },
                { id: "k2", title: "Write tests" },
              ],
            },
            {
              id: "doing",
              title: "In progress",
              tone: "primary",
              items: [{ id: "k3", title: "Build UI" }],
            },
            {
              id: "done",
              title: "Done",
              tone: "success",
              items: [{ id: "k4", title: "Setup repo" }],
            },
          ]}
          renderCard={(card) => <Text size="sm">{String(card.title)}</Text>}
        />
      </Example>
    </Section>
  );
}

/* ----------------------------------------------------------- More inputs ---- */
const MULTI_OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular" },
];

export function MoreInputsSection() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [tags, setTags] = useState<string[]>(["react"]);
  const [color, setColor] = useState("#4f46e5");
  const [combo, setCombo] = useState("");
  const [range, setRange] = useState<[number, number]>([25, 75]);
  const [num, setNum] = useState<number | "">(3);
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>({
    hours: 9,
    minutes: 30,
    seconds: 0,
  });

  return (
    <Section id="inputs-more" num="17" title="More Inputs" subtitle="advanced controls">
      <SimpleGrid minChildWidth="280px" gap={4}>
        <Example label="DatePicker">
          <DatePicker value={date} onChange={setDate} />
        </Example>

        <Example label="TimePicker">
          <TimePicker value={time} onChange={setTime} />
        </Example>

        <Example label="MultiSelect">
          <MultiSelect
            options={MULTI_OPTIONS}
            value={tags}
            onChange={(v) => setTags(v)}
            placeholder="Pick frameworks"
          />
        </Example>

        <Example label="Combobox">
          <Combobox
            options={MULTI_OPTIONS}
            value={combo}
            onChange={setCombo}
            onSelect={(o) => setCombo(o.label)}
            placeholder="Search…"
          />
        </Example>

        <Example label="ColorPicker">
          <ColorPicker
            colors={["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
            value={color}
            onChange={setColor}
            allowCustom
          />
        </Example>

        <Example label="NumberInput">
          <NumberInput value={num} min={0} max={10} onChange={setNum} />
        </Example>

        <Example label="RangeSlider">
          <RangeSlider value={range} onChange={(v) => setRange(v)} />
        </Example>

        <Example label="FileDropzone">
          <FileDropzone multiple label="Drop files here" hint="PNG, JPG up to 5MB" />
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* ------------------------------------------------------------- Nav extras ---- */
export function MoreNavSection() {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(false);

  return (
    <Section id="nav-more" num="18" title="More Navigation" subtitle="bars, sheets & menus">
      <SimpleGrid minChildWidth="300px" gap={4}>
        <Example label="TabBar">
          <TabBar
            value={tab}
            onChange={setTab}
            items={[
              { value: "home", label: "Home" },
              { value: "search", label: "Search" },
              { value: "profile", label: "Profile" },
            ]}
          />
        </Example>

        <Example label="Sheet (bottom)">
          <Button variant="soft" onClick={() => setSheet(true)}>
            Open sheet
          </Button>
        </Example>

        <Example label="ContextMenu">
          <ContextMenu
            items={[
              { id: "open", label: "Open" },
              { id: "rename", label: "Rename" },
              { id: "sep", separator: true },
              { id: "delete", label: "Delete", danger: true },
            ]}
          >
            <Card variant="outlined" padding={4}>
              <Text size="sm" tone="muted">
                Right-click me
              </Text>
            </Card>
          </ContextMenu>
        </Example>
      </SimpleGrid>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Quick actions">
        <Stack gap={3}>
          <Stack direction="horizontal" gap={3} align="center">
            <Avatar name="Nova UI" />
            <Text size="sm">Bottom sheet content slides up from the edge.</Text>
          </Stack>
          <img
            src={img("nova-sheet")}
            alt="Preview"
            style={{ width: "100%", borderRadius: 12 }}
          />
        </Stack>
      </Sheet>
    </Section>
  );
}
