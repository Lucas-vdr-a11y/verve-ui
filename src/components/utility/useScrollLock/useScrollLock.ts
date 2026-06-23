import { useCallback, useEffect, useRef } from "react";

export interface UseScrollLockOptions {
  /** Lock immediately on mount. Defaults to `false`. */
  initial?: boolean;
}

export interface UseScrollLockControls {
  /** Lock body scroll. */
  lock: () => void;
  /** Unlock body scroll, restoring the previous style. */
  unlock: () => void;
}

// Shared count so multiple simultaneous consumers (e.g. nested modals) don't
// clobber each other: the body only unlocks once the last lock is released.
let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

function applyLock() {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (lockCount === 0) {
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;

    // Compensate for the scrollbar width to avoid a layout shift.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function releaseLock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPaddingRight;
  }
}

/**
 * Lock and unlock body scroll (e.g. while a modal or drawer is open).
 *
 * SSR-safe: all `document` access is guarded. Uses a shared reference count so
 * nested locks compose correctly — the body only restores once every consumer
 * has unlocked. Any active lock owned by this hook is released on unmount.
 */
export function useScrollLock(
  options: UseScrollLockOptions = {}
): UseScrollLockControls {
  const { initial = false } = options;

  // Tracks whether *this* hook instance currently holds a lock, so unmount
  // cleanup releases exactly once.
  const lockedRef = useRef(false);

  const lock = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    applyLock();
  }, []);

  const unlock = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    releaseLock();
  }, []);

  useEffect(() => {
    if (initial) lock();
    return () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        releaseLock();
      }
    };
  }, [initial, lock]);

  return { lock, unlock };
}
