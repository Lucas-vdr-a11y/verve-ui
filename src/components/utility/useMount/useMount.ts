import { useEffect } from "react";

/**
 * Runs `callback` once, after the component mounts. The callback identity is
 * ignored after the first run (it never re-fires).
 */
export function useMount(callback: () => void): void {
  useEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
