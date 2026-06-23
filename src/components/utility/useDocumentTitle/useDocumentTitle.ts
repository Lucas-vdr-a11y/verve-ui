import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";

export interface UseDocumentTitleOptions {
  /**
   * When `true`, restore the previous `document.title` on unmount.
   * Defaults to `false`.
   */
  restoreOnUnmount?: boolean;
}

/**
 * Sets `document.title` to `title`, keeping it in sync as `title` changes.
 *
 * SSR-safe: does nothing on the server (guards `document`). When
 * `restoreOnUnmount` is set, the title present at mount time is restored when
 * the component unmounts.
 */
export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {}
): void {
  const { restoreOnUnmount = false } = options;
  const previousRef = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (previousRef.current === null) previousRef.current = document.title;
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    return () => {
      if (restoreOnUnmount && previousRef.current !== null) {
        document.title = previousRef.current;
      }
    };
    // Capture restore behaviour once at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
