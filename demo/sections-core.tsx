import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Switch,
  Checkbox,
  SegmentedControl,
  SearchInput,
  Slider,
  Rating,
  PasswordInput,
  Toggle,
  Card,
  Stack,
  SimpleGrid,
  Panel,
  Divider,
  Heading,
  Text,
  GradientText,
  Code,
  Kbd,
  Mark,
  Lead,
  Alert,
  Banner,
  Callout,
  Badge,
  Spinner,
  Progress,
  Meter,
  Skeleton,
  Indicator,
  Avatar,
  AvatarGroup,
  Stat,
  StatGroup,
  Table,
  TrendBadge,
  AnimatedCounter,
  RatingDisplay,
  ProgressRing,
  Timeline,
  TimelineItem,
  Tag,
} from "../src/index";
import { Section, Example } from "./parts";

/* -------------------------------------------------------------- Inputs ---- */
export function InputsSection() {
  const [seg, setSeg] = useState("week");
  const [slider, setSlider] = useState(60);
  return (
    <Section id="inputs" num="01" title="Inputs" subtitle="forms & controls">
      <SimpleGrid minChildWidth="320px" gap={5}>
        <Example label="Button variants">
          <div className="demo-row">
            <Button>Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="demo-row">
            <Button tone="primary">Primary</Button>
            <Button tone="neutral" variant="soft">
              Neutral
            </Button>
            <Button tone="danger" variant="soft">
              Danger
            </Button>
            <Button loading>Loading</Button>
          </div>
          <div className="demo-row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Example>

        <Example label="Text fields">
          <Stack gap={3}>
            <Input placeholder="Your name" />
            <Input placeholder="$ amount" leftAddon="$" rightAddon="USD" />
            <PasswordInput placeholder="Password" showStrength defaultValue="Tr0ub4dor" />
            <SearchInput placeholder="Search components…" />
          </Stack>
        </Example>

        <Example label="Select & toggles">
          <Stack gap={3}>
            <Select defaultValue="react" aria-label="Framework">
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
            </Select>
            <div className="demo-row">
              <Switch label="Wi-Fi" defaultChecked />
              <Checkbox label="Subscribe" defaultChecked />
              <Toggle defaultPressed>Bold</Toggle>
            </div>
          </Stack>
        </Example>

        <Example label="Segmented control">
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
          <Text tone="muted" size="sm">
            Selected: <Code>{seg}</Code>
          </Text>
        </Example>

        <Example label="Slider">
          <Slider value={slider} onChange={setSlider} tooltip />
          <Text tone="muted" size="sm">
            Value: {slider}
          </Text>
        </Example>

        <Example label="Rating">
          <Rating defaultValue={3} allowHalf />
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* -------------------------------------------------------------- Layout ---- */
export function LayoutSection() {
  return (
    <Section id="layout" num="02" title="Layout" subtitle="structure & spacing">
      <SimpleGrid minChildWidth="300px" gap={5}>
        <Example label="Card variants">
          <Stack gap={3}>
            <Card variant="elevated" padding={4}>
              <Text weight="semibold">Elevated</Text>
              <Text tone="muted" size="sm">
                Raised with a soft shadow.
              </Text>
            </Card>
            <Card variant="outlined" padding={4}>
              <Text weight="semibold">Outlined</Text>
              <Text tone="muted" size="sm">
                A simple bordered surface.
              </Text>
            </Card>
            <Card variant="filled" padding={4}>
              <Text weight="semibold">Filled</Text>
              <Text tone="muted" size="sm">
                Subtle filled background.
              </Text>
            </Card>
          </Stack>
        </Example>

        <Example label="Stack & Divider">
          <Stack gap={2}>
            <Text weight="semibold">Vertical stack</Text>
            <Divider />
            <div className="demo-row">
              <Badge>One</Badge>
              <Badge tone="primary">Two</Badge>
              <Badge tone="success">Three</Badge>
            </div>
            <Divider label="or" />
            <Stack direction="horizontal" gap={2}>
              <Button size="sm" variant="soft">
                Left
              </Button>
              <Button size="sm" variant="soft">
                Right
              </Button>
            </Stack>
          </Stack>
        </Example>

        <Example label="Panel">
          <Panel
            variant="outlined"
            title="Project settings"
            description="Manage how this project behaves."
            actions={
              <Button size="sm" variant="soft">
                Edit
              </Button>
            }
          >
            <Text size="sm" tone="muted">
              Panels frame related content with a header, description and actions.
            </Text>
          </Panel>
        </Example>

        <Example label="SimpleGrid">
          <SimpleGrid columns={3} gap={2}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n} variant="filled" padding={3}>
                <Text align="center" size="sm" weight="medium">
                  {n}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* ---------------------------------------------------------- Typography ---- */
export function TypographySection() {
  return (
    <Section id="typography" num="03" title="Typography" subtitle="type scale">
      <SimpleGrid minChildWidth="320px" gap={5}>
        <Example label="Headings & gradient">
          <Stack gap={2}>
            <Heading level={1} size="4xl">
              <GradientText preset="brand">Verve UI</GradientText>
            </Heading>
            <Heading level={3} size="xl">
              The quick brown fox
            </Heading>
            <Lead>
              A lead paragraph introduces a section with slightly larger, calmer
              text.
            </Lead>
          </Stack>
        </Example>

        <Example label="Body & inline">
          <Stack gap={3}>
            <Text>
              Body text with <Code>inline code</Code>, a{" "}
              <Mark>highlighted</Mark> phrase, and a keyboard shortcut{" "}
              <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
            </Text>
            <Text tone="muted" size="sm">
              Muted, smaller supporting copy.
            </Text>
            <Text tone="primary" weight="semibold">
              Primary-toned emphasis.
            </Text>
            <Code block>{`function greet(name) {\n  return "Hello, " + name;\n}`}</Code>
          </Stack>
        </Example>

        <Example label="Gradient presets">
          <Stack gap={1}>
            {(["brand", "sunset", "ocean", "candy", "forest"] as const).map(
              (p) => (
                <Heading key={p} level={4} size="lg">
                  <GradientText preset={p}>{p}</GradientText>
                </Heading>
              )
            )}
          </Stack>
        </Example>
      </SimpleGrid>
    </Section>
  );
}

/* ------------------------------------------------------------ Feedback ---- */
export function FeedbackSection() {
  return (
    <Section id="feedback" num="04" title="Feedback" subtitle="status & progress">
      <Stack gap={4}>
        <Stack gap={3}>
          <Alert tone="info" variant="soft" title="Heads up">
            This is an informational alert with a soft background.
          </Alert>
          <Alert tone="success" variant="soft" title="Saved" dismissible>
            Your changes were saved successfully.
          </Alert>
          <Alert tone="warning" variant="outline" title="Careful">
            This action may have side effects.
          </Alert>
          <Banner tone="info" action={<Button size="sm" variant="soft">Upgrade</Button>}>
            You are on the free plan — upgrade for more components.
          </Banner>
          <Callout tone="success" title="Pro tip">
            Wrap toast usage in <Code>ToastProvider</Code> at the app root.
          </Callout>
        </Stack>

        <SimpleGrid minChildWidth="280px" gap={4}>
          <Example label="Badges & tags">
            <div className="demo-row">
              <Badge>Neutral</Badge>
              <Badge tone="primary">Primary</Badge>
              <Badge tone="success" variant="soft">
                Success
              </Badge>
              <Badge tone="danger" variant="outline">
                Danger
              </Badge>
              <Badge tone="warning" dot>
                Pending
              </Badge>
            </div>
            <div className="demo-row">
              <Tag tone="primary">design</Tag>
              <Tag tone="info" variant="outline">
                react
              </Tag>
              <Tag onRemove={() => {}}>removable</Tag>
            </div>
          </Example>

          <Example label="Spinner & indicator">
            <div className="demo-row">
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" />
              <Indicator pulse content="3">
                <Button variant="soft" size="sm">
                  Inbox
                </Button>
              </Indicator>
            </div>
          </Example>

          <Example label="Progress & meter">
            <Stack gap={3}>
              <Progress value={72} label="Uploading" />
              <Progress value={40} tone="success" size="sm" />
              <Meter value={0.82} label="Disk usage" />
            </Stack>
          </Example>

          <Example label="Skeleton">
            <Stack gap={2}>
              <Skeleton variant="text" lines={3} />
              <div className="demo-row">
                <Skeleton variant="circle" width={40} height={40} />
                <Skeleton variant="rect" width={160} height={40} />
              </div>
            </Stack>
          </Example>
        </SimpleGrid>
      </Stack>
    </Section>
  );
}

/* -------------------------------------------------------- Data display ---- */
const PEOPLE = [
  { name: "Ada Lovelace", role: "Engineering", status: "Active" },
  { name: "Alan Turing", role: "Research", status: "Active" },
  { name: "Grace Hopper", role: "Operations", status: "Away" },
];

export function DataDisplaySection() {
  return (
    <Section id="data" num="05" title="Data Display" subtitle="stats & records">
      <Stack gap={4}>
        <Card variant="outlined" padding={6}>
          <StatGroup>
            <Stat
              label="Revenue"
              value={<AnimatedCounter value={48200} prefix="$" />}
              trend={{ direction: "up", value: "12%", positive: true }}
            />
            <Stat
              label="Active users"
              value={<AnimatedCounter value={3812} />}
              trend={{ direction: "up", value: "4.1%", positive: true }}
            />
            <Stat
              label="Churn"
              value="1.8%"
              trend={{ direction: "down", value: "0.3%", positive: true }}
            />
          </StatGroup>
        </Card>

        <SimpleGrid minChildWidth="300px" gap={4}>
          <Example label="Avatars & trends">
            <Stack gap={3}>
              <AvatarGroup max={4}>
                <Avatar name="Ada Lovelace" status="online" />
                <Avatar name="Alan Turing" />
                <Avatar name="Grace Hopper" status="away" />
                <Avatar name="Linus T" />
                <Avatar name="Margaret H" />
              </AvatarGroup>
              <div className="demo-row">
                <TrendBadge delta={12.5} direction="up" />
                <TrendBadge delta={-3.2} direction="down" />
                <TrendBadge value="flat" direction="flat" />
              </div>
              <div className="demo-row">
                <RatingDisplay value={4.5} />
                <ProgressRing value={68} label />
              </div>
            </Stack>
          </Example>

          <Example label="Timeline">
            <Timeline>
              <TimelineItem tone="success" title="Deployed" time="09:24">
                Build v2.4.0 shipped to production.
              </TimelineItem>
              <TimelineItem tone="primary" title="Reviewed" time="08:10">
                Pull request approved by 2 reviewers.
              </TimelineItem>
              <TimelineItem title="Opened" time="Yesterday">
                Feature branch created.
              </TimelineItem>
            </Timeline>
          </Example>
        </SimpleGrid>

        <Example label="Table">
          <Table hoverable striped>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Team</Table.HeaderCell>
                <Table.HeaderCell align="right">Status</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {PEOPLE.map((p) => (
                <Table.Row key={p.name}>
                  <Table.Cell>{p.name}</Table.Cell>
                  <Table.Cell>{p.role}</Table.Cell>
                  <Table.Cell align="right">
                    <Badge
                      tone={p.status === "Active" ? "success" : "warning"}
                      variant="soft"
                    >
                      {p.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Example>
      </Stack>
    </Section>
  );
}
