import { type ReactNode } from "react";
import { useMediaQuery } from "../useMediaQuery";

/** Named breakpoints (min-width, px). Aligns with common UI scales. */
export const NOVA_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof NOVA_BREAKPOINTS;

export interface ShowProps {
  /** Content to conditionally render. */
  children: ReactNode;
  /**
   * Render only at or above this breakpoint's min-width
   * (`min-width: <bp>px`).
   */
  above?: Breakpoint;
  /**
   * Render only below this breakpoint's min-width
   * (`max-width: <bp - 0.02>px`).
   */
  below?: Breakpoint;
  /**
   * Extra boolean condition AND-ed with the breakpoint result. When `false`,
   * nothing renders regardless of viewport.
   */
  when?: boolean;
  /**
   * Value used before mount / on the server where `matchMedia` is unavailable.
   * Defaults to `false` (render nothing until the client confirms).
   */
  ssr?: boolean;
}

/** Builds the media query for the given above/below pair. */
function buildQuery(above?: Breakpoint, below?: Breakpoint): string | null {
  const parts: string[] = [];
  if (above) parts.push(`(min-width: ${NOVA_BREAKPOINTS[above]}px)`);
  if (below) parts.push(`(max-width: ${NOVA_BREAKPOINTS[below] - 0.02}px)`);
  return parts.length ? parts.join(" and ") : null;
}

/**
 * Conditionally render children by viewport breakpoint and/or a boolean.
 *
 * - `<Show above="md">` — visible at ≥ 768px.
 * - `<Show below="sm">` — visible at < 640px.
 * - `<Show above="md" below="xl">` — visible in the [md, xl) range.
 * - `<Show when={isOpen}>` — plain boolean gate (no breakpoint needed).
 *
 * SSR-safe via the `ssr` prop, which seeds the match value before hydration.
 * With no `above`/`below`/`when` props it always renders its children.
 */
export function Show({
  children,
  above,
  below,
  when,
  ssr = false,
}: ShowProps): ReactNode {
  const query = buildQuery(above, below);
  // Hook must run unconditionally; a no-op query never matches in the browser.
  const matches = useMediaQuery(query ?? "(width: 0)", { defaultValue: ssr });

  const breakpointPass = query === null ? true : matches;
  const whenPass = when === undefined ? true : when;
  const visible = breakpointPass && whenPass;

  return visible ? <>{children}</> : null;
}
