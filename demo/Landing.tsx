import { useEffect, useRef, useState } from "react";
import {
  CATALOG,
  TOTAL_COMPONENTS,
  TOTAL_CATEGORIES,
  SIGNATURE_COUNT,
} from "./catalog.generated";
import { REPO_URL, DOCS_URL, DOWNLOAD_URL, categoryHref } from "./site";

/* ---------------------------------------------------------------- *
 * Robust count-up stat — shows the final number by default (so it is
 * correct with no JS / reduced motion), animating from 0 only when it
 * scrolls into view and motion is allowed.
 * ---------------------------------------------------------------- */
function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  const [n, setN] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value === 0) return;
    const reduce =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const dur = 1100;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
          else setN(value);
        };
        setN(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div className="nv-stat">
      <span ref={ref} className={`nv-stat__n${accent ? " nv-stat__n--accent" : ""}`}>
        {n}
      </span>
      <span className="nv-stat__l">{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Hero — entirely CSS-driven so it always renders rich.
 * ---------------------------------------------------------------- */
function Hero() {
  return (
    <header className="nv-hero">
      <div className="nv-hero__bg" aria-hidden="true">
        <div className="nv-hero__wash" />
        <div className="nv-hero__grid" />
        <div className="nv-hero__beam" />
      </div>

      <div className="nv-hero__inner">
        <span className="nv-pill">
          <span className="nv-pill__dot" />
          {TOTAL_COMPONENTS} components · {TOTAL_CATEGORIES} categories · zero
          runtime deps
        </span>

        <h1 className="nv-hero__title">
          The React UI kit
          <br />
          <span className="grad">with signature motion</span>
        </h1>

        <p className="nv-hero__lead">
          Verve UI is a themeable, dependency-free component library — from
          everyday inputs and tables to aurora backgrounds, kinetic typography
          and pointer-driven flair. Token-themed, accessible and SSR-safe by
          default.
        </p>

        <div className="nv-hero__cta">
          <a className="nv-btn nv-btn--primary" href={DOWNLOAD_URL} download>
            ⤓ Download everything (.zip)
          </a>
          <a className="nv-btn nv-btn--ghost" href="#overview">
            Explore components
          </a>
          <a
            className="nv-btn nv-btn--ghost"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="nv-btn__star">★</span> GitHub
          </a>
          <a
            className="nv-btn nv-btn--text"
            href={`${import.meta.env.BASE_URL}launch.html`}
          >
            ▶ Launch film
          </a>
        </div>

        <dl className="nv-stats">
          <Stat value={TOTAL_COMPONENTS} label="components" />
          <Stat value={TOTAL_CATEGORIES} label="categories" />
          <Stat value={SIGNATURE_COUNT} label="signature sets" />
          <Stat value={0} label="runtime deps" accent />
        </dl>
      </div>

      <a className="nv-hero__scroll" href="#overview" aria-label="Scroll to components">
        <span />
      </a>
    </header>
  );
}

/* ---------------------------------------------------------------- *
 * Feature bento
 * ---------------------------------------------------------------- */
const FEATURES = [
  {
    span: 2,
    icon: "◍",
    title: "Motion-first, dependency-free",
    body: "Aurora fields, beams, particles, kinetic type and pointer flair — hand-built with CSS, rAF, canvas and SVG. No framer-motion, no three.js.",
  },
  {
    span: 1,
    icon: "🎨",
    title: "Token-themed",
    body: "Light & dark out of the box. Override any --nova-* variable to rebrand everything.",
  },
  {
    span: 1,
    icon: "♿",
    title: "Accessible",
    body: "Real semantics, keyboard support, focus-visible rings, wired aria-state.",
  },
  {
    span: 1,
    icon: "🔒",
    title: "SSR-safe & typed",
    body: "Browser access guarded in effects. Every component ships an exported Props type.",
  },
  {
    span: 1,
    icon: "🌀",
    title: "Reduced-motion aware",
    body: "Every signature animation respects the user's prefers-reduced-motion setting.",
  },
];

function Features() {
  return (
    <section className="nv-section">
      <div className="nv-section__head">
        <h2 className="nv-h2">Built on one cohesive system</h2>
        <p className="nv-sub">
          Not a random pile of snippets — every component follows the same
          authoring contract.
        </p>
      </div>
      <div className="nv-bento">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={`nv-feature${f.span === 2 ? " nv-feature--wide" : ""}`}
          >
            <span className="nv-feature__icon">{f.icon}</span>
            <h3 className="nv-feature__title">{f.title}</h3>
            <p className="nv-feature__body">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Quick start
 * ---------------------------------------------------------------- */
function QuickStart() {
  return (
    <section className="nv-section nv-quickstart">
      <div className="nv-quickstart__col">
        <h2 className="nv-h2">Drop it in</h2>
        <p className="nv-sub">
          Install, import the stylesheet once, and start composing. Every
          component reads from semantic CSS variables, so one token override
          rebrands the whole set.
        </p>
        <a className="nv-link" href={DOCS_URL} target="_blank" rel="noreferrer">
          Browse the full component index →
        </a>
      </div>
      <pre className="nv-code" aria-label="Install and usage example">
        <code>
          <span className="nv-code__c">$ npm install @verve/ui</span>
          {"\n\n"}
          <span className="nv-code__k">import</span> {"{ Button, Card, Stack }"}{" "}
          <span className="nv-code__k">from</span>{" "}
          <span className="nv-code__s">"@verve/ui"</span>;{"\n"}
          <span className="nv-code__k">import</span>{" "}
          <span className="nv-code__s">"@verve/ui/styles.css"</span>;{"\n\n"}
          {"<"}
          <span className="nv-code__t">Stack</span> gap=
          <span className="nv-code__s">"4"</span>
          {">"}
          {"\n  <"}
          <span className="nv-code__t">Card</span> variant=
          <span className="nv-code__s">"elevated"</span>
          {">"}
          {"\n    <"}
          <span className="nv-code__t">Button</span> tone=
          <span className="nv-code__s">"primary"</span>
          {">Get started</"}
          <span className="nv-code__t">Button</span>
          {">"}
          {"\n  </"}
          <span className="nv-code__t">Card</span>
          {">\n</"}
          <span className="nv-code__t">Stack</span>
          {">"}
        </code>
      </pre>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Category overview (searchable)
 * ---------------------------------------------------------------- */
type Filter = "all" | "signature";

function CategoryCard({
  cat,
  query,
}: {
  cat: (typeof CATALOG)[number];
  query: string;
}) {
  const q = query.trim().toLowerCase();
  const matching = q
    ? cat.components.filter((c) => c.toLowerCase().includes(q))
    : cat.components;
  const shown = matching.slice(0, 6);
  const extra = matching.length - shown.length;

  return (
    <a
      className={`nv-cat${cat.signature ? " nv-cat--sig" : ""}`}
      href={categoryHref(cat.key)}
    >
      <div className="nv-cat__top">
        <span className="nv-cat__icon" aria-hidden="true">
          {cat.icon}
        </span>
        <span className="nv-cat__count">{cat.count}</span>
      </div>
      <div className="nv-cat__name">
        {cat.label}
        {cat.signature && (
          <span className="nv-cat__badge" title="Signature / motion-driven">
            ✦
          </span>
        )}
      </div>
      <div className="nv-cat__chips">
        {shown.map((name) => (
          <span className="nv-chip" key={name}>
            {name}
          </span>
        ))}
        {extra > 0 && <span className="nv-chip nv-chip--more">+{extra}</span>}
      </div>
    </a>
  );
}

function Overview() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = query.trim().toLowerCase();
  const visible = CATALOG.filter((cat) => {
    if (filter === "signature" && !cat.signature) return false;
    if (!q) return true;
    if (cat.label.toLowerCase().includes(q)) return true;
    if (cat.key.toLowerCase().includes(q)) return true;
    return cat.components.some((c) => c.toLowerCase().includes(q));
  });
  const shownComponents = visible.reduce((sum, c) => sum + c.count, 0);

  return (
    <section className="nv-section" id="overview">
      <div className="nv-section__head">
        <h2 className="nv-h2">Every category, at a glance</h2>
        <p className="nv-sub">
          {TOTAL_COMPONENTS} components in {TOTAL_CATEGORIES} categories. Search
          by name, or jump into the live playground below.
        </p>
      </div>

      <div className="nv-controls">
        <div className="nv-search">
          <span className="nv-search__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            placeholder="Search 660 components — try “aurora”, “table”, “cursor”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search components"
          />
        </div>
        <div className="nv-segment" role="tablist" aria-label="Filter categories">
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

      <p className="nv-resultcount">
        {visible.length} categor{visible.length === 1 ? "y" : "ies"} ·{" "}
        {shownComponents} components{q ? " match" : ""}
      </p>

      {visible.length === 0 ? (
        <div className="nv-empty">No components match “{query}”.</div>
      ) : (
        <div className="nv-cat-grid">
          {visible.map((cat) => (
            <CategoryCard key={cat.key} cat={cat} query={query} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Composition
 * ---------------------------------------------------------------- */
export function Landing() {
  return (
    <div className="nv">
      <Hero />
      <main className="nv-body">
        <Overview />
        <Features />
        <QuickStart />
      </main>
    </div>
  );
}
