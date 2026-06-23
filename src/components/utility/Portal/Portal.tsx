import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";

export interface PortalProps {
  /** Content to render into the portal target. */
  children: ReactNode;
  /**
   * Target node (or a function returning one) to portal into. Defaults to
   * `document.body`. Resolved after mount, so a function is safe for SSR.
   */
  container?: Element | (() => Element | null) | null;
  /**
   * When `true`, render children inline instead of portalling. Useful for
   * tests or when a parent wants to opt out.
   */
  disabled?: boolean;
}

/**
 * Render children into a different part of the DOM via `createPortal`.
 *
 * SSR-safe: renders nothing on the server and until the first client effect
 * runs, then portals into `container` (default `document.body`).
 */
export function Portal({
  children,
  container,
  disabled = false,
}: PortalProps): ReactNode {
  const [target, setTarget] = useState<Element | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (disabled) return;
    if (typeof document === "undefined") return;

    const resolved =
      typeof container === "function"
        ? container()
        : (container ?? document.body);

    setTarget(resolved ?? document.body);
  }, [container, disabled]);

  if (disabled) return <>{children}</>;
  if (!target) return null;

  return createPortal(children, target);
}
