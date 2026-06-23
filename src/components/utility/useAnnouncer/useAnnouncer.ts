import { useCallback, useEffect, useRef } from "react";
import type { LiveRegionPoliteness } from "../LiveRegion";

export interface UseAnnouncerOptions {
  /** Default politeness used when `announce` is called without one. */
  politeness?: LiveRegionPoliteness;
  /**
   * How long (ms) a message stays in the region before it is cleared. Clearing
   * lets the same message be announced again later. Defaults to `7000`.
   */
  clearDelay?: number;
}

export interface UseAnnouncerReturn {
  /**
   * Announce a message to assistive technology. Optionally override the
   * politeness for this single announcement.
   */
  announce: (message: string, politeness?: LiveRegionPoliteness) => void;
}

function createRegion(politeness: LiveRegionPoliteness): HTMLDivElement {
  const node = document.createElement("div");
  node.setAttribute("role", politeness === "assertive" ? "alert" : "status");
  node.setAttribute("aria-live", politeness);
  node.setAttribute("aria-atomic", "true");
  node.className = "nova-visually-hidden";
  return node;
}

/**
 * Imperatively announce messages to screen readers without rendering a
 * component. Lazily injects a pair of visually-hidden `aria-live` regions
 * (one polite, one assertive) into `document.body` on first use and cleans
 * them up on unmount.
 *
 * SSR-safe: all DOM access is deferred to event handlers / effects, so calling
 * the hook on the server does nothing until `announce` runs in the browser.
 *
 * @example
 * const { announce } = useAnnouncer();
 * announce("Saved");
 * announce("Upload failed", "assertive");
 */
export function useAnnouncer(
  options: UseAnnouncerOptions = {}
): UseAnnouncerReturn {
  const { politeness: defaultPoliteness = "polite", clearDelay = 7000 } =
    options;

  const regionsRef = useRef<Partial<Record<LiveRegionPoliteness, HTMLDivElement>>>(
    {}
  );
  const timersRef = useRef<Map<HTMLDivElement, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Tear down any injected regions + pending timers when the component unmounts.
  useEffect(() => {
    const regions = regionsRef.current;
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      (Object.values(regions) as HTMLDivElement[]).forEach((node) => {
        node.parentNode?.removeChild(node);
      });
      regionsRef.current = {};
    };
  }, []);

  const announce = useCallback(
    (message: string, politeness?: LiveRegionPoliteness) => {
      if (typeof document === "undefined") return;

      const level = politeness ?? defaultPoliteness;
      if (level === "off") return;

      let node = regionsRef.current[level];
      if (!node || !node.isConnected) {
        node = createRegion(level);
        regionsRef.current[level] = node;
        document.body.appendChild(node);
      }

      // Reset before writing so identical consecutive messages re-announce.
      const existing = timersRef.current.get(node);
      if (existing) clearTimeout(existing);

      node.textContent = "";
      // Defer the write a tick so the empty -> text change is observed.
      const region = node;
      window.setTimeout(() => {
        region.textContent = message;
      }, 100);

      if (clearDelay > 0) {
        const timer = setTimeout(() => {
          region.textContent = "";
          timersRef.current.delete(region);
        }, clearDelay);
        timersRef.current.set(region, timer);
      }
    },
    [defaultPoliteness, clearDelay]
  );

  return { announce };
}
