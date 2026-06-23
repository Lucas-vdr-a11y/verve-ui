import * as React from "react";

/**
 * Module-scoped counter for the fallback path (React < 18, where
 * `React.useId` does not exist). Stable enough for client-only rendering.
 */
let fallbackCounter = 0;

// React 18+ ships `useId`. Reference it defensively so this also compiles and
// runs against older React typings/runtimes.
const reactUseId: (() => string) | undefined = (
  React as { useId?: () => string }
).useId;

/**
 * SSR-safe unique id with an optional prefix.
 *
 * Thin wrapper over `React.useId` (React 18+), which produces matching ids on
 * server and client to avoid hydration mismatches. Falls back to an
 * incrementing counter on older React. Pass `prefix` for readable, scoped ids
 * (e.g. `"nova-field"` → `"nova-field-:r3:"`).
 */
export function useId(prefix?: string): string {
  const generated = reactUseId
    ? reactUseId()
    : // eslint-disable-next-line react-hooks/rules-of-hooks -- branch is stable per React version
      React.useMemo(() => `nova-${++fallbackCounter}`, []);

  return prefix ? `${prefix}-${generated}` : generated;
}
