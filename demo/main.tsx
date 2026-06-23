import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ThemeProvider,
  useTheme,
  ToastProvider,
  Button,
  Badge,
  Heading,
  Lead,
} from "../src/index";
import "./demo.css";
import { Landing } from "./Landing";
import { REPO_URL, DOCS_URL, CONTRACT_URL, DOWNLOAD_URL } from "./site";
import {
  InputsSection,
  LayoutSection,
  TypographySection,
  FeedbackSection,
  DataDisplaySection,
} from "./sections-core";
import {
  ChartsSection,
  OverlaySection,
  DisclosureSection,
  NavigationSection,
  MediaSection,
  BlocksSection,
} from "./sections-rich";
import {
  CommerceSection,
  MotionSection,
  DndSection,
  MoreChartsSection,
  MoreDataSection,
  MoreInputsSection,
  MoreNavSection,
} from "./sections-extra";
import {
  TextEffectsSection,
  FlairSection,
  FxSection,
  ShowcaseSection,
} from "./sections-signature";

const NAV = [
  { id: "texteffects", label: "✨ Text Effects" },
  { id: "flair", label: "✨ Flair" },
  { id: "fx", label: "✨ FX & Backgrounds" },
  { id: "showcase", label: "✨ Showcase" },
  { id: "inputs", label: "Inputs" },
  { id: "layout", label: "Layout" },
  { id: "typography", label: "Typography" },
  { id: "feedback", label: "Feedback" },
  { id: "data", label: "Data Display" },
  { id: "charts", label: "Charts" },
  { id: "overlay", label: "Overlay" },
  { id: "disclosure", label: "Disclosure" },
  { id: "navigation", label: "Navigation" },
  { id: "media", label: "Media" },
  { id: "blocks", label: "Blocks" },
  { id: "commerce", label: "Commerce" },
  { id: "motion", label: "Motion" },
  { id: "dnd", label: "Drag & Drop" },
  { id: "charts-more", label: "More Charts" },
  { id: "data-more", label: "More Data Display" },
  { id: "inputs-more", label: "More Inputs" },
  { id: "nav-more", label: "More Navigation" },
];

function TopBar() {
  const { resolvedTheme, toggle } = useTheme();
  return (
    <header className="demo-topbar">
      <a className="demo-wordmark" href="#top">
        <span className="demo-logo">V</span>
        <span>Verve UI</span>
      </a>
      <div className="demo-topbar-right">
        <Badge tone="primary" variant="soft">
          660 components
        </Badge>
        <a
          className="demo-topbar-link"
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
        <a className="demo-topbar-download" href={DOWNLOAD_URL} download>
          ⤓ Download
        </a>
        <Button variant="outline" tone="neutral" size="sm" onClick={toggle}>
          {resolvedTheme === "dark" ? "☀ Light" : "🌙 Dark"}
        </Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="demo-footer">
      <div className="demo-footer__inner">
        <div className="demo-wordmark">
          <span className="demo-logo">V</span>
          <span>Verve UI — MIT licensed</span>
        </div>
        <nav className="demo-footer__links">
          <a href={`${import.meta.env.BASE_URL}launch.html`}>Launch film ▶</a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            Component index
          </a>
          <a href={CONTRACT_URL} target="_blank" rel="noreferrer">
            Authoring contract
          </a>
          <a href="#overview">Categories</a>
        </nav>
      </div>
    </footer>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ToastProvider placement="bottom-right">
        <span id="top" />
        <TopBar />
        <Landing />

        <div className="demo-playground-head">
          <Heading level={2} size="3xl">
            <span className="demo-playground-grad">Live playground</span>
          </Heading>
          <Lead style={{ margin: "0.5rem auto 0", maxWidth: "48ch" }}>
            Every component, interactive and themed. Flip light / dark from the
            top bar.
          </Lead>
        </div>

        <div className="demo-shell">
          <nav className="demo-sidebar">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {n.label}
              </a>
            ))}
          </nav>
          <main className="demo-content">
            <TextEffectsSection />
            <FlairSection />
            <FxSection />
            <ShowcaseSection />
            <InputsSection />
            <LayoutSection />
            <TypographySection />
            <FeedbackSection />
            <DataDisplaySection />
            <ChartsSection />
            <OverlaySection />
            <DisclosureSection />
            <NavigationSection />
            <MediaSection />
            <BlocksSection />
            <CommerceSection />
            <MotionSection />
            <DndSection />
            <MoreChartsSection />
            <MoreDataSection />
            <MoreInputsSection />
            <MoreNavSection />
          </main>
        </div>

        <Footer />
      </ToastProvider>
    </ThemeProvider>
  );
}

// Reuse the root across HMR / repeated entry execution so we never call
// createRoot twice on the same container (avoids the React dev warning and
// the re-mount that would restart the hero count-up).
const container = document.getElementById("root")!;
const w = window as unknown as { __verveRoot?: ReturnType<typeof createRoot> };
const root = w.__verveRoot ?? (w.__verveRoot = createRoot(container));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
