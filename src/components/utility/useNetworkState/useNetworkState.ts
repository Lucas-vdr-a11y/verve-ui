import { useEffect, useState } from "react";

export interface NetworkState {
  /** Whether the browser currently reports an online connection. */
  online: boolean;
}

/**
 * Tracks online/offline status from `navigator.onLine`.
 *
 * SSR-safe: defaults to `{ online: true }` on the server and during the first
 * client render, then syncs after mount. Subscribes to `online`/`offline`
 * events with cleanup.
 */
export function useNetworkState(): NetworkState {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return;
    }

    const update = () => setOnline(navigator.onLine);

    // Sync immediately on mount.
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return { online };
}
