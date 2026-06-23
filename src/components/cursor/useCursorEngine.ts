import { useEffect, useState } from "react";
import { useReducedMotion } from "../utility/useReducedMotion/useReducedMotion";

/**
 * Shared gate for every cursor component.
 *
 * Returns whether a custom cursor should be active. A custom cursor is only
 * appropriate for fine pointers (mouse/trackpad) that have not opted out of
 * motion. On the server, or before mount, it returns `false` so nothing is
 * rendered until we can read the real environment.
 *
 * SSR-safe: all `matchMedia` access happens inside an effect with cleanup.
 */
export function useCursorEnabled(): boolean {
  const reduced = useReducedMotion();
  const [coarse, setCoarse] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mql.matches);
    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return mounted && !reduced && !coarse;
}

/** A node, a ref-like object, or a factory resolving to one. */
export type CursorScope =
  | Element
  | { current: Element | null }
  | (() => Element | null)
  | null
  | undefined;

/** Resolve a {@link CursorScope} into a concrete element (or `null`). */
export function resolveScope(scope: CursorScope): Element | null {
  if (!scope) return null;
  if (typeof scope === "function") return scope();
  if ("current" in scope) return scope.current;
  return scope;
}
