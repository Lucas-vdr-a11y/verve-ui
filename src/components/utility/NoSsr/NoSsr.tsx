import { useEffect, useState, type ReactNode } from "react";

export interface NoSsrProps {
  /** Content rendered only on the client, deferred one frame after mount. */
  children: ReactNode;
  /**
   * Content rendered on the server and until the deferred client render kicks
   * in. Defaults to `null`.
   */
  fallback?: ReactNode;
}

/**
 * Like {@link ClientOnly}, but defers rendering by an extra animation frame
 * after mount. Handy when children must wait for layout to settle (e.g.
 * measuring the DOM) or to push expensive client-only work off the critical
 * hydration path.
 *
 * SSR-safe: renders `fallback` until the deferred frame runs in the browser.
 */
export function NoSsr({ children, fallback = null }: NoSsrProps): ReactNode {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame(() => setReady(true))
        : null;
    // Fallback for environments without rAF (older test envs).
    const timer = raf === null ? setTimeout(() => setReady(true), 0) : null;

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      if (timer !== null) clearTimeout(timer);
    };
  }, []);

  return <>{ready ? children : fallback}</>;
}
