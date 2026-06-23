import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * React warns when `useLayoutEffect` runs during SSR (it can't fire layout
 * effects on the server). This hook swaps in `useEffect` when there is no DOM,
 * silencing the warning while keeping synchronous layout behaviour in the
 * browser.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
