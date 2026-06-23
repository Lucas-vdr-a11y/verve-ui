import { useEffect, useRef, type RefObject } from "react";

export interface UseHotkeysOptions {
  /**
   * Element to bind the listener to. Pass a ref, the element, `window`, or
   * `document`. Defaults to `window`.
   */
  target?: RefObject<HTMLElement | null> | HTMLElement | Window | Document | null;
  /** Listen on `keyup` instead of `keydown`. Defaults to `keydown`. */
  event?: "keydown" | "keyup";
  /** Disable the binding without unmounting. Defaults to `true` (enabled). */
  enabled?: boolean;
  /** Call `preventDefault()` when the combo matches. Defaults to `true`. */
  preventDefault?: boolean;
}

interface ParsedCombo {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  /** `mod` matches ctrl OR meta (cross-platform). */
  mod: boolean;
}

const ALIASES: Record<string, string> = {
  esc: "escape",
  del: "delete",
  ins: "insert",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  plus: "+",
  return: "enter",
};

function parseCombo(combo: string): ParsedCombo {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const parsed: ParsedCombo = {
    key: "",
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    mod: false,
  };

  for (const part of parts) {
    switch (part) {
      case "ctrl":
      case "control":
        parsed.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
      case "win":
        parsed.meta = true;
        break;
      case "mod":
        parsed.mod = true;
        break;
      case "alt":
      case "option":
        parsed.alt = true;
        break;
      case "shift":
        parsed.shift = true;
        break;
      default:
        parsed.key = ALIASES[part] ?? part;
        break;
    }
  }

  return parsed;
}

function matches(parsed: ParsedCombo, event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  if (key !== parsed.key) return false;

  if (parsed.mod) {
    // `mod` requires ctrl OR meta to be down.
    if (!event.ctrlKey && !event.metaKey) return false;
  } else {
    if (parsed.ctrl !== event.ctrlKey) return false;
    if (parsed.meta !== event.metaKey) return false;
  }

  if (parsed.alt !== event.altKey) return false;
  if (parsed.shift !== event.shiftKey) return false;

  return true;
}

/**
 * Bind one or more keyboard combos to a handler.
 *
 * Combos use `+`-separated tokens, e.g. `"mod+k"`, `"shift+?"`, `"esc"`.
 * `mod` matches Ctrl on Windows/Linux and Cmd on macOS. Pass a single string
 * or an array of strings.
 *
 * SSR-safe: the listener is attached inside an effect and skipped where there
 * is no DOM. The latest `handler` is always used, and the listener is removed
 * on cleanup.
 */
export function useHotkeys(
  keys: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeysOptions = {}
): void {
  const {
    target,
    event = "keydown",
    enabled = true,
    preventDefault = true,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const comboList = Array.isArray(keys) ? keys : [keys];
  const comboKey = comboList.join("|");

  useEffect(() => {
    if (!enabled) return;

    const resolved: EventTarget | null =
      target === undefined || target === null
        ? typeof window !== "undefined"
          ? window
          : null
        : "current" in target
          ? target.current
          : target;

    if (!resolved || typeof resolved.addEventListener !== "function") return;

    const parsed = comboList.map(parseCombo);

    const onKey = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (parsed.some((combo) => matches(combo, ke))) {
        if (preventDefault) ke.preventDefault();
        handlerRef.current(ke);
      }
    };

    resolved.addEventListener(event, onKey);
    return () => resolved.removeEventListener(event, onKey);
    // `comboKey` is the string form of `comboList`; `parsed` derives from it.
  }, [comboKey, event, enabled, preventDefault, target]);
}

/**
 * Convenience alias for binding a single key combo.
 * @see useHotkeys
 */
export function useKeyPress(
  keys: string | string[],
  handler: (event: KeyboardEvent) => void,
  options?: UseHotkeysOptions
): void {
  useHotkeys(keys, handler, options);
}
