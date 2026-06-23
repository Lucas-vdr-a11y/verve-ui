import { useEffect, useState } from "react";

export interface UseMediaQueryOptions {
  /**
   * Value returned on the server / before hydration, where `matchMedia` is
   * unavailable. Defaults to `false`.
   */
  defaultValue?: boolean;
}

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 *
 * SSR-safe: returns `defaultValue` (default `false`) when there is no
 * `window.matchMedia`, then syncs to the real value after mount. Cleans up its
 * listener on unmount or when the query string changes.
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false } = options;

  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    // Sync immediately in case the query already matches at mount.
    update();

    // `addEventListener` is the modern API; fall back to `addListener` for
    // older Safari where `MediaQueryList` predates the EventTarget interface.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [query]);

  return matches;
}
