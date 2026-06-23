import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface FullscreenControls {
  /** Whether the target element is currently fullscreen. */
  isFullscreen: boolean;
  /** Request fullscreen for the target element. */
  enter: () => Promise<void>;
  /** Exit fullscreen (if active). */
  exit: () => Promise<void>;
  /** Enter if not fullscreen, otherwise exit. */
  toggle: () => Promise<void>;
}

export type UseFullscreenReturn<T extends HTMLElement = HTMLElement> = [
  (node: T | null) => void,
  FullscreenControls,
];

/**
 * Fullscreen API binding for a single element.
 *
 * Returns `[ref, { isFullscreen, enter, exit, toggle }]`. Attach `ref` to the
 * element to display fullscreen. SSR-safe and guarded against unsupported
 * browsers; stays in sync with external changes via `fullscreenchange` and
 * cleans the listener up.
 */
export function useFullscreen<
  T extends HTMLElement = HTMLElement,
>(): UseFullscreenReturn<T> {
  const nodeRef = useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ref = useCallback((node: T | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onChange = () =>
      setIsFullscreen(
        Boolean(
          document.fullscreenElement &&
            nodeRef.current &&
            document.fullscreenElement === nodeRef.current
        )
      );

    onChange();
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    const node = nodeRef.current;
    if (
      typeof document === "undefined" ||
      !node ||
      typeof node.requestFullscreen !== "function"
    ) {
      return;
    }
    await node.requestFullscreen();
  }, []);

  const exit = useCallback(async () => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    if (typeof document.exitFullscreen === "function") {
      await document.exitFullscreen();
    }
  }, []);

  const toggle = useCallback(async () => {
    if (
      typeof document !== "undefined" &&
      document.fullscreenElement === nodeRef.current &&
      nodeRef.current
    ) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  const controls = useMemo<FullscreenControls>(
    () => ({ isFullscreen, enter, exit, toggle }),
    [isFullscreen, enter, exit, toggle]
  );

  return [ref, controls];
}
