import { type ReactNode } from "react";
import { useMediaQuery } from "../useMediaQuery";
import { NOVA_BREAKPOINTS, type Breakpoint } from "./Show";

export interface HideProps {
  /** Content to conditionally render (rendered when NOT matching). */
  children: ReactNode;
  /**
   * Hide at or above this breakpoint's min-width (`min-width: <bp>px`).
   */
  above?: Breakpoint;
  /**
   * Hide below this breakpoint's min-width
   * (`max-width: <bp - 0.02>px`).
   */
  below?: Breakpoint;
  /** When `true`, hide regardless of viewport. */
  when?: boolean;
  /**
   * Value used before mount / on the server where `matchMedia` is unavailable.
   * Defaults to `false` (assume not matching → render until client confirms).
   */
  ssr?: boolean;
}

function buildQuery(above?: Breakpoint, below?: Breakpoint): string | null {
  const parts: string[] = [];
  if (above) parts.push(`(min-width: ${NOVA_BREAKPOINTS[above]}px)`);
  if (below) parts.push(`(max-width: ${NOVA_BREAKPOINTS[below] - 0.02}px)`);
  return parts.length ? parts.join(" and ") : null;
}

/**
 * Inverse of {@link Show}: hides children when the breakpoint and/or `when`
 * condition matches.
 *
 * - `<Hide below="md">` — hidden below 768px (i.e. mobile-hidden).
 * - `<Hide above="lg">` — hidden at ≥ 1024px.
 * - `<Hide when={isLoading}>` — plain boolean gate.
 *
 * SSR-safe via the `ssr` prop. With no props it always renders its children.
 */
export function Hide({
  children,
  above,
  below,
  when,
  ssr = false,
}: HideProps): ReactNode {
  const query = buildQuery(above, below);
  const matches = useMediaQuery(query ?? "(width: 0)", { defaultValue: ssr });

  const breakpointHide = query === null ? false : matches;
  const whenHide = when === undefined ? false : when;
  const hidden = breakpointHide || whenHide;

  return hidden ? null : <>{children}</>;
}
