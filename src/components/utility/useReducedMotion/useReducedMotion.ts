import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns `true` when the user has requested reduced motion via
 * `prefers-reduced-motion: reduce`.
 *
 * SSR-safe: returns `false` on the server / before mount, then syncs to the
 * real value and subscribes to changes (cleaning up on unmount). Built directly
 * on `matchMedia` so it has no dependency on other hooks.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(QUERY);
    const update = () => setReduced(mql.matches);

    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return reduced;
}
