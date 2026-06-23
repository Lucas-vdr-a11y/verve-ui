import { useEffect, useState, type ReactNode } from "react";

export interface ClientOnlyProps {
  /** Content rendered only after the component has mounted on the client. */
  children: ReactNode;
  /**
   * Optional content rendered on the server and during the first client render
   * (before mount). Defaults to `null`.
   */
  fallback?: ReactNode;
}

/**
 * Renders `children` only after the component has mounted in the browser,
 * rendering `fallback` (default `null`) on the server and the first client
 * pass. Use to wrap browser-only UI and avoid hydration mismatches.
 */
export function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps): ReactNode {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted ? children : fallback}</>;
}
