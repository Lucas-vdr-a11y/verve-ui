import { useMemo, useState } from "react";
import {
  AuroraBackground,
  GradientText,
  SparklesText,
  CountingNumber,
  BentoGrid,
  BentoCard,
  Heading,
  Lead,
  Text,
  Badge,
} from "../src/index";
import {
  CATALOG,
  TOTAL_COMPONENTS,
  TOTAL_CATEGORIES,
  SIGNATURE_COUNT,
} from "./catalog.generated";
import { REPO_URL, DOCS_URL, categoryHref } from "./site";

/* ---------------------------------------------------------------- *
 * Hero
 * ---------------------------------------------------------------- */

function Hero() {
  return (
    <header className="lp-hero">
      <AuroraBackground className="lp-hero__aurora" />
      <div className="lp-hero__inner">
        <Badge tone="primary" variant="soft" className="lp-hero__eyebrow">
          {TOTAL_COMPONENTS} components · zero runtime deps
        </Badge>

        <h1 className="lp-hero__title">
          <GradientText preset="brand">The React UI kit</GradientText>
          <br />
          <SparklesText text="with signature motion" count={14} />
        </h1>

        <Lead className="lp-hero__lead">
          Nova UI is a themeable, dependency-free component library — from
          everyday inputs and tables to aurora backgrounds, kinetic typography
          and pointer-driven flair. Token-themed, accessible and SSR-safe by
          default.
        </Lead>

        <div className="lp-hero__cta">
          <a className="lp-btn lp-btn--primary" href="#overview">
            Explore components
          </a>
          <a
            className="lp-btn lp-btn--ghost"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            ★ View on GitHub
          </a>
        </div>

        <a className="lp-hero__film" href={`${import.meta.env.BASE_URL}launch.html`}>
          ▶ Watch the 34-second launch film
        </a>

        <dl className="lp-stats">
          <div className="lp-stat">
            <dt>
              <CountingNumber value={TOTAL_COMPONENTS} />
            </dt>
            <dd>components</dd>
          </div>
          <div className="lp-stat">
            <dt>
              <CountingNumber value={TOTAL_CATEGORIES} />
            </dt>
            <dd>categories</dd>
          </div>
          <div className="lp-stat">
            <dt>
              <CountingNumber value={SIGNATURE_COUNT} />
            </dt>
            <dd>signature sets</dd>
          </div>
          <div className="lp-stat">
            <dt>
              <CountingNumber value={0} />
            </dt>
            <dd>runtime deps</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- *
 * Install / quick start
 * ---------------------------------------------------------------- */

function QuickStart() {
  return (
    <section className="lp-section lp-quickstart">
      <div className="lp-quickstart__col">
        <Heading level={2} size="2xl">
          Drop it in
        </Heading>
        <Text tone="muted">
          Install, import the stylesheet once, and start composing. Every
          component reads from semantic CSS variables, so one token override
          rebrands the whole set.
        </Text>
      </div>
      <pre className="lp-code" aria-label="Install and usage example">
        <code>{`npm install @nova/ui

import { Button, Card, Stack } from "@nova/ui";
import "@nova/ui/styles.css";

<Stack gap="4">
  <Card variant="elevated" padding="6">
    <Button tone="primary">Get started</Button>
  </Card>
</Stack>`}</code>
      </pre>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Why Nova — feature bento
 * ---------------------------------------------------------------- */

function Features() {
  return (
    <section className="lp-section">
      <div className="lp-section__head">
        <Heading level={2} size="2xl">
          Built on one cohesive system
        </Heading>
        <Text tone="muted">
          Not a random pile of snippets — every component follows the same
          authoring contract.
        </Text>
      </div>
      <BentoGrid columns={3}>
        <BentoCard
          colSpan={2}
          title="Motion-first, dependency-free"
          description="Aurora fields, beams, particles, kinetic type and pointer flair — all hand-built with CSS, rAF, canvas and SVG. No framer-motion, no three.js."
          icon={<span>◍</span>}
        />
        <BentoCard
          title="Token-themed"
          description="Light & dark out of the box. Override any --nova-* variable to retheme everything."
          icon={<span>🎨</span>}
        />
        <BentoCard
          title="Accessible"
          description="Real semantics, keyboard support, focus-visible rings, wired aria-state."
          icon={<span>♿</span>}
        />
        <BentoCard
          title="SSR-safe & typed"
          description="Window access guarded in effects. Every component ships an exported Props type."
          icon={<span>🔒</span>}
        />
        <BentoCard
          colSpan={1}
          title="prefers-reduced-motion"
          description="All signature animation respects the user's motion preference."
          icon={<span>🌀</span>}
        />
      </BentoGrid>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Category overview (searchable)
 * ---------------------------------------------------------------- */

type Filter = "all" | "signature";

function CategoryCard({ cat, query }: { cat: (typeof CATALOG)[number]; query: string }) {
  const q = query.trim().toLowerCase();
  const matching = q
    ? cat.components.filter((c) => c.toLowerCase().includes(q))
    : cat.components;
  const shown = matching.slice(0, 6);
  const extra = matching.length - shown.length;

  return (
    <a className="lp-cat" href={categoryHref(cat.key)}>
      <div className="lp-cat__top">
        <span className="lp-cat__icon" aria-hidden="true">
          {cat.icon}
        </span>
        <span className="lp-cat__count">{cat.count}</span>
      </div>
      <div className="lp-cat__name">
        {cat.label}
        {cat.signature && (
          <span className="lp-cat__badge" title="Signature / motion-driven">
            ✦
          </span>
        )}
      </div>
      <div className="lp-cat__chips">
        {shown.map((name) => (
          <span className="lp-chip" key={name}>
            {name}
          </span>
        ))}
        {extra > 0 && <span className="lp-chip lp-chip--more">+{extra}</span>}
      </div>
    </a>
  );
}

function Overview() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    return CATALOG.filter((cat) => {
      if (filter === "signature" && !cat.signature) return false;
      if (!q) return true;
      if (cat.label.toLowerCase().includes(q)) return true;
      if (cat.key.toLowerCase().includes(q)) return true;
      return cat.components.some((c) => c.toLowerCase().includes(q));
    });
  }, [q, filter]);

  const shownComponents = useMemo(
    () => visible.reduce((sum, c) => sum + c.count, 0),
    [visible]
  );

  return (
    <section className="lp-section" id="overview">
      <div className="lp-section__head">
        <Heading level={2} size="2xl">
          Every category, at a glance
        </Heading>
        <Text tone="muted">
          {TOTAL_COMPONENTS} components in {TOTAL_CATEGORIES} categories. Search
          by name, or jump into the live playground below.
        </Text>
      </div>

      <div className="lp-controls">
        <input
          className="lp-search"
          type="search"
          placeholder="Search 660 components — try “aurora”, “table”, “cursor”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search components"
        />
        <div className="lp-segment" role="tablist" aria-label="Filter categories">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={filter === "all" ? "is-active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "signature"}
            className={filter === "signature" ? "is-active" : ""}
            onClick={() => setFilter("signature")}
          >
            ✦ Signature
          </button>
        </div>
      </div>

      <Text tone="muted" size="sm" className="lp-resultcount">
        {visible.length} categor{visible.length === 1 ? "y" : "ies"} ·{" "}
        {shownComponents} components{q ? " match" : ""}
      </Text>

      {visible.length === 0 ? (
        <div className="lp-empty">
          <Text tone="muted">No components match “{query}”.</Text>
        </div>
      ) : (
        <div className="lp-cat-grid">
          {visible.map((cat) => (
            <CategoryCard key={cat.key} cat={cat} query={query} />
          ))}
        </div>
      )}

      <div className="lp-overview__foot">
        <a className="lp-link" href={DOCS_URL} target="_blank" rel="noreferrer">
          Browse the full component index →
        </a>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Public landing composition
 * ---------------------------------------------------------------- */

export function Landing() {
  return (
    <div className="lp">
      <Hero />
      <div className="lp-body">
        <Overview />
        <Features />
        <QuickStart />
      </div>
    </div>
  );
}
