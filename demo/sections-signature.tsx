import { useState } from "react";
import {
  // texteffects
  ShinyText,
  AuroraText,
  SparklesText,
  WordRotate,
  HyperText,
  MorphingText,
  TextReveal,
  CountingNumber,
  LineShadowText,
  FlipText,
  BoxReveal,
  BlurFadeText,
  // flair
  MagneticButton,
  TiltCard,
  SpotlightCard,
  WobbleCard,
  ShimmerButton,
  PulsatingButton,
  FlipCard,
  CardStack,
  InfiniteMovingCards,
  DirectionAwareHover,
  AnimatedTooltipGroup,
  ScratchToReveal,
  // fx
  AuroraBackground,
  SpotlightGlow,
  GridPattern,
  DotPattern,
  Meteors,
  RetroGrid,
  Particles,
  BorderBeam,
  ShineBorder,
  AnimatedGradientBorder,
  GlowingStars,
  NoiseOverlay,
  // showcase
  BentoGrid,
  BentoCard,
  AnimatedList,
  LampHeader,
  GlowMenu,
  ScrollReveal,
  MarqueeRow,
  FeatureSpotlightTabs,
  TracingBeam,
  // primitives
  Button,
  Card,
  Heading,
  Text,
} from "../src/index";
import { Section, Example } from "./parts";

/* ---------------------------------------------------------------- *
 * Shared helpers
 * ---------------------------------------------------------------- */

/** A dark, fixed-height tile used to frame an fx/background effect. */
function FxTile({
  label,
  children,
  inner,
}: {
  label: string;
  children: React.ReactNode;
  inner?: React.ReactNode;
}) {
  return (
    <div className="demo-example">
      <span className="demo-label">{label}</span>
      <div className="demo-fx-tile demo-fx-tile--dark">
        {children}
        {inner ? <div className="demo-fx-tile__inner">{inner}</div> : null}
      </div>
    </div>
  );
}

/** A centered tile for a single large text effect. */
function TextTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Example label={label}>
      <div className="demo-text-tile">{children}</div>
    </Example>
  );
}

const seedImg = (s: string) => `https://picsum.photos/seed/${s}/400/300`;

/* ---------------------------------------------------------------- *
 * 1. TEXT EFFECTS
 * ---------------------------------------------------------------- */

export function TextEffectsSection() {
  return (
    <Section
      id="texteffects"
      num="✨ 01"
      title="Text Effects"
      subtitle="Kinetic typography"
    >
      <Text tone="muted" size="sm" className="demo-sig-lead">
        Twelve signature ways to make a headline move. Each renders real sample
        copy at a readable size so the animation is obvious.
      </Text>
      <div className="demo-sig-grid">
        <TextTile label="ShinyText">
          <ShinyText text="Shiny Text" />
        </TextTile>

        <TextTile label="AuroraText">
          <AuroraText text="Aurora" />
        </TextTile>

        <TextTile label="SparklesText">
          <SparklesText text="Sparkles" count={10} />
        </TextTile>

        <TextTile label="WordRotate">
          <WordRotate words={["Ship", "Build", "Design", "Launch"]} />
        </TextTile>

        <TextTile label="HyperText">
          <HyperText text="DECODE" />
        </TextTile>

        <TextTile label="MorphingText">
          <MorphingText texts={["Create", "Morph", "Repeat"]} />
        </TextTile>

        <TextTile label="TextReveal">
          <TextReveal text="Reveal on scroll" repeat />
        </TextTile>

        <TextTile label="CountingNumber">
          <CountingNumber value={98765} prefix="$" />
        </TextTile>

        <TextTile label="LineShadowText">
          <LineShadowText text="Shadow" />
        </TextTile>

        <TextTile label="FlipText">
          <FlipText text="FLIP IN" />
        </TextTile>

        <TextTile label="BoxReveal">
          <BoxReveal>
            <span style={{ fontSize: "2rem", fontWeight: 800 }}>Box Reveal</span>
          </BoxReveal>
        </TextTile>

        <TextTile label="BlurFadeText">
          <BlurFadeText text="Blur into focus" />
        </TextTile>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- *
 * 2. FLAIR — pointer-driven interactions
 * ---------------------------------------------------------------- */

const STACK_ITEMS = [
  { id: 1, content: <Text>"Nova UI shipped our redesign in a weekend." — Ada</Text> },
  { id: 2, content: <Text>"The motion components are unreal." — Lin</Text> },
  { id: 3, content: <Text>"Zero dependencies, all the flair." — Rey</Text> },
];

const MOVING_ITEMS = [
  { id: 1, content: <Text>"Buttery smooth." — Vega</Text> },
  { id: 2, content: <Text>"Premium feel out of the box." — Kai</Text> },
  { id: 3, content: <Text>"Our PMs noticed instantly." — Sol</Text> },
  { id: 4, content: <Text>"Dark mode looks gorgeous." — Wren</Text> },
];

const TOOLTIP_ITEMS = [
  { id: 1, name: "Ada Lovelace", title: "Design", image: seedImg("ada") },
  { id: 2, name: "Linus Vibe", title: "Eng", image: seedImg("linus") },
  { id: 3, name: "Rey Park", title: "Product", image: seedImg("rey") },
  { id: 4, name: "Sol Mira", title: "Founder", image: seedImg("sol") },
];

function FlipCardDemo() {
  const [flipped, setFlipped] = useState(false);
  return (
    <FlipCard
      trigger="click"
      flipped={flipped}
      onChange={setFlipped}
      style={{ width: 220, height: 140 }}
      front={
        <Card variant="elevated" padding={5} style={{ height: "100%" }}>
          <Text>Click to flip →</Text>
        </Card>
      }
      back={
        <Card variant="outlined" padding={5} style={{ height: "100%" }}>
          <Text>← The back face</Text>
        </Card>
      }
    />
  );
}

function CardStackDemo() {
  return <CardStack items={STACK_ITEMS} style={{ width: 260, height: 140 }} />;
}

function ScratchDemo() {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <ScratchToReveal
        width={240}
        height={130}
        coverLabel="Scratch here"
        onComplete={() => setDone(true)}
      >
        <div
          style={{
            width: 240,
            height: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--nova-primary)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.4rem",
          }}
        >
          You win 🎉
        </div>
      </ScratchToReveal>
      <Text tone="muted" size="sm">
        {done ? "Revealed!" : "Drag across the surface."}
      </Text>
    </div>
  );
}

export function FlairSection() {
  return (
    <Section
      id="flair"
      num="✨ 02"
      title="Flair"
      subtitle="Interactive · pointer-driven"
    >
      <Text tone="muted" size="sm" className="demo-sig-lead">
        Hover, tilt, magnetize and scratch. These components react to the
        pointer for a tactile, premium feel.
      </Text>
      <div className="demo-sig-grid">
        <Example label="MagneticButton">
          <MagneticButton>Magnetic</MagneticButton>
        </Example>

        <Example label="TiltCard">
          <TiltCard>
            <Card variant="elevated" padding={6}>
              <Heading level={3} size="lg">
                Tilt me
              </Heading>
              <Text tone="muted" size="sm">
                3D tilt + glare
              </Text>
            </Card>
          </TiltCard>
        </Example>

        <Example label="SpotlightCard">
          <SpotlightCard>
            <Card variant="outlined" padding={6}>
              <Heading level={3} size="lg">
                Spotlight
              </Heading>
              <Text tone="muted" size="sm">
                Move your cursor over me.
              </Text>
            </Card>
          </SpotlightCard>
        </Example>

        <Example label="WobbleCard">
          <WobbleCard>
            <Card variant="elevated" padding={6}>
              <Heading level={3} size="lg">
                Wobble
              </Heading>
              <Text tone="muted" size="sm">
                Parallax on hover.
              </Text>
            </Card>
          </WobbleCard>
        </Example>

        <Example label="ShimmerButton">
          <ShimmerButton>Shimmer</ShimmerButton>
        </Example>

        <Example label="PulsatingButton">
          <PulsatingButton>Pulsate</PulsatingButton>
        </Example>

        <Example label="FlipCard (click)">
          <FlipCardDemo />
        </Example>

        <Example label="CardStack">
          <CardStackDemo />
        </Example>

        <Example label="DirectionAwareHover">
          <DirectionAwareHover
            style={{ width: 240, height: 150, borderRadius: 12 }}
            overlay={
              <div style={{ padding: "1rem", color: "#fff" }}>
                <Heading level={3} size="md" style={{ color: "#fff" }}>
                  Mountain
                </Heading>
                <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Slides in from your entry edge.
                </Text>
              </div>
            }
          >
            <img
              src={seedImg("daw")}
              alt="sample"
              style={{ width: 240, height: 150, objectFit: "cover" }}
            />
          </DirectionAwareHover>
        </Example>

        <Example label="AnimatedTooltipGroup">
          <AnimatedTooltipGroup items={TOOLTIP_ITEMS} />
        </Example>

        <Example label="ScratchToReveal">
          <ScratchDemo />
        </Example>

        <Example label="InfiniteMovingCards" style={{ gridColumn: "1 / -1" }}>
          <InfiniteMovingCards items={MOVING_ITEMS} speed="slow" />
        </Example>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- *
 * 3. FX — backgrounds & borders
 * ---------------------------------------------------------------- */

export function FxSection() {
  return (
    <Section id="fx" num="✨ 03" title="FX & Backgrounds" subtitle="Ambient motion">
      <Text tone="muted" size="sm" className="demo-sig-lead">
        Drop-in backgrounds, animated borders and particle fields. Each frames a
        little content so the effect has something to wrap.
      </Text>
      <div className="demo-sig-grid">
        <FxTile
          label="AuroraBackground"
          inner={<Heading level={3} size="lg" style={{ color: "inherit" }}>Aurora</Heading>}
        >
          <AuroraBackground style={{ position: "absolute", inset: 0 }} />
        </FxTile>

        <FxTile
          label="SpotlightGlow"
          inner={<Text style={{ color: "inherit" }}>Cursor-follow glow</Text>}
        >
          <SpotlightGlow style={{ position: "absolute", inset: 0 }} />
        </FxTile>

        <FxTile
          label="GridPattern"
          inner={<Text style={{ color: "inherit" }}>Grid pattern</Text>}
        >
          <GridPattern highlightedSquares={6} />
        </FxTile>

        <FxTile
          label="DotPattern"
          inner={<Text style={{ color: "inherit" }}>Dot pattern</Text>}
        >
          <DotPattern />
        </FxTile>

        <FxTile
          label="Meteors"
          inner={<Text style={{ color: "inherit" }}>Meteor shower</Text>}
        >
          <Meteors quantity={14} />
        </FxTile>

        <FxTile
          label="RetroGrid"
          inner={<Heading level={3} size="lg" style={{ color: "inherit" }}>Retro</Heading>}
        >
          <RetroGrid />
        </FxTile>

        <FxTile
          label="Particles"
          inner={<Text style={{ color: "inherit" }}>Particle field</Text>}
        >
          <Particles quantity={60} />
        </FxTile>

        <FxTile
          label="GlowingStars"
          inner={<Text style={{ color: "inherit" }}>Starfield</Text>}
        >
          <GlowingStars style={{ position: "absolute", inset: 0 }} />
        </FxTile>

        <div className="demo-example">
          <span className="demo-label">BorderBeam</span>
          <BorderBeam
            style={{ borderRadius: 14, padding: 0 }}
          >
            <div
              style={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
              }}
            >
              <Text>Traveling border beam</Text>
            </div>
          </BorderBeam>
        </div>

        <div className="demo-example">
          <span className="demo-label">ShineBorder</span>
          <ShineBorder>
            <div
              style={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
              }}
            >
              <Text>Shimmering border</Text>
            </div>
          </ShineBorder>
        </div>

        <div className="demo-example">
          <span className="demo-label">AnimatedGradientBorder</span>
          <AnimatedGradientBorder>
            <div
              style={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
              }}
            >
              <Button tone="primary">Gradient frame</Button>
            </div>
          </AnimatedGradientBorder>
        </div>

        <FxTile
          label="NoiseOverlay"
          inner={<Text style={{ color: "inherit" }}>Film grain over content</Text>}
        >
          <NoiseOverlay opacity={0.18} animated />
        </FxTile>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- *
 * 4. SHOWCASE — layout-scale signature blocks
 * ---------------------------------------------------------------- */

const NOTIFICATIONS = [
  "💸 New payment received",
  "⭐ You got a new star",
  "👤 New follower joined",
  "📦 Order #1024 shipped",
  "✅ Build passed",
];

const SPOTLIGHT_ITEMS = [
  {
    id: "speed",
    title: "Blazing fast",
    description: "Zero-dependency components that ship tiny.",
    media: (
      <div className="demo-fx-tile demo-fx-tile--dark" style={{ minHeight: 200 }}>
        <Heading level={3} size="xl" style={{ color: "inherit" }}>
          ⚡ Speed
        </Heading>
      </div>
    ),
  },
  {
    id: "theme",
    title: "Fully themeable",
    description: "Token-driven theming with light & dark out of the box.",
    media: (
      <div className="demo-fx-tile demo-fx-tile--dark" style={{ minHeight: 200 }}>
        <Heading level={3} size="xl" style={{ color: "inherit" }}>
          🎨 Theme
        </Heading>
      </div>
    ),
  },
  {
    id: "motion",
    title: "Motion-first",
    description: "Signature animations built right in.",
    media: (
      <div className="demo-fx-tile demo-fx-tile--dark" style={{ minHeight: 200 }}>
        <Heading level={3} size="xl" style={{ color: "inherit" }}>
          🌀 Motion
        </Heading>
      </div>
    ),
  },
];

function GlowMenuDemo() {
  const [active, setActive] = useState("home");
  return (
    <GlowMenu
      value={active}
      onChange={setActive}
      items={[
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
        { value: "about", label: "About" },
        { value: "blog", label: "Blog" },
      ]}
    />
  );
}

export function ShowcaseSection() {
  return (
    <Section id="showcase" num="✨ 04" title="Showcase" subtitle="Signature blocks">
      <Text tone="muted" size="sm" className="demo-sig-lead">
        Larger, opinionated blocks for landing pages — bento grids, live
        activity, lamp headers and animated tabs.
      </Text>

      <div className="demo-stack" style={{ gap: "2rem" }}>
        <Example label="LampHeader">
          <LampHeader size="sm">
            <Heading level={2} size="3xl">
              Built to impress
            </Heading>
          </LampHeader>
        </Example>

        <Example label="GlowMenu (stateful active tab)">
          <GlowMenuDemo />
        </Example>

        <Example label="BentoGrid + BentoCard">
          <BentoGrid columns={3}>
            <BentoCard
              colSpan={2}
              title="Motion-driven"
              description="Signature animations, zero config."
              icon={<span>🌀</span>}
            />
            <BentoCard
              title="Themeable"
              description="Light & dark tokens."
              icon={<span>🎨</span>}
            />
            <BentoCard
              title="Tiny"
              description="No runtime deps."
              icon={<span>⚡</span>}
            />
            <BentoCard
              colSpan={2}
              title="660 components"
              description="One cohesive system."
              icon={<span>📦</span>}
            />
          </BentoGrid>
        </Example>

        <div className="demo-grid-2">
          <Example label="AnimatedList (live activity)">
            <AnimatedList style={{ maxWidth: 360 }}>
              {NOTIFICATIONS.map((n) => (
                <Card key={n} variant="outlined" padding={4}>
                  <Text>{n}</Text>
                </Card>
              ))}
            </AnimatedList>
          </Example>

          <Example label="ScrollReveal (wraps a card)">
            <ScrollReveal animation="slide-up">
              <Card variant="elevated" padding={6}>
                <Heading level={3} size="lg">
                  Revealed on scroll
                </Heading>
                <Text tone="muted" size="sm">
                  Slides up into view as it enters the viewport.
                </Text>
              </Card>
            </ScrollReveal>
          </Example>
        </div>

        <Example label="MarqueeRow (logo row)">
          <MarqueeRow speed={40}>
            {["NOVA", "VERTEX", "LUMEN", "ORBIT", "PULSE", "ATLAS"].map((logo) => (
              <span
                key={logo}
                style={{ fontWeight: 800, fontSize: "1.4rem", opacity: 0.7 }}
              >
                {logo}
              </span>
            ))}
          </MarqueeRow>
        </Example>

        <Example label="FeatureSpotlightTabs">
          <FeatureSpotlightTabs items={SPOTLIGHT_ITEMS} />
        </Example>

        <Example label="TracingBeam">
          <TracingBeam>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Heading level={3} size="lg">
                A guided story
              </Heading>
              <Text tone="muted">
                The beam traces alongside this content as you read down the
                column, perfect for long-form narratives and docs.
              </Text>
              <Text tone="muted">
                It anchors the eye and gives a sense of progress through the
                page.
              </Text>
            </div>
          </TracingBeam>
        </Example>
      </div>
    </Section>
  );
}
