/* =============================================================================
 * Verve UI — public entry point
 * Styles are imported once here; component barrels are re-exported per category.
 * ========================================================================== */
import "./styles/tokens.css";
import "./styles/base.css";

export { cn } from "./utils/cn";
export type { ClassValue } from "./utils/cn";

// Category barrels (populated as components land)
export * from "./components/inputs";
export * from "./components/layout";
export * from "./components/navigation";
export * from "./components/feedback";
export * from "./components/data-display";
export * from "./components/typography";
export * from "./components/overlay";
export * from "./components/disclosure";
export * from "./components/media";
export * from "./components/utility";
export * from "./components/charts";
export * from "./components/blocks";
export * from "./components/dnd";
export * from "./components/commerce";
export * from "./components/motion";
export * from "./components/templates";
export * from "./components/chat";
export * from "./components/scheduling";
export * from "./components/fx";
export * from "./components/flair";
export * from "./components/texteffects";
export * from "./components/showcase";
export * from "./components/cursor";
export * from "./components/loaders";
export * from "./components/devices";
export * from "./components/patterns";
export * from "./components/threed";
export * from "./components/gamification";
