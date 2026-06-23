import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ScrambleIn.css";

export interface ScrambleInProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Final text to assemble. */
  text: string;
  /** Symbol pool flickered in each not-yet-resolved slot. */
  glyphs?: string;
  /** Milliseconds between scramble frames. Defaults `35`. */
  frameRate?: number;
  /** Frames each character stays scrambled before it locks. Defaults `8`. */
  scrambleFor?: number;
  /** Frames between successive characters starting to resolve. Defaults `2`. */
  revealEvery?: number;
  /** Re-trigger each time it scrolls back into view. Defaults `false`. */
  repeat?: boolean;
}

const DEFAULT_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%&*+=?/";

/**
 * ScrambleIn — characters spawn from an empty line, each flickering through a
 * glyph pool for a moment before locking onto its final letter (a per-character
 * reveal-from-blank, distinct from DecryptedText's left-to-right decrypt
 * sweep). Triggers when scrolled into view via IntersectionObserver. Driven by
 * a single frame timer; SSR-safe with cleanup. Reduced motion shows the text
 * immediately.
 */
export const ScrambleIn = forwardRef<HTMLSpanElement, ScrambleInProps>(
  function ScrambleIn(
    {
      text,
      glyphs = DEFAULT_GLYPHS,
      frameRate = 35,
      scrambleFor = 8,
      revealEvery = 2,
      repeat = false,
      className,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const hostRef = useRef<HTMLSpanElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const chars = Array.from(text);

    const [display, setDisplay] = useState<string[]>(() =>
      chars.map(() => "")
    );
    const [locked, setLocked] = useState<boolean[]>(() => chars.map(() => false));

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = hostRef.current;
      if (!el) return;

      const finish = () => {
        setDisplay(Array.from(text));
        setLocked(Array.from(text, () => true));
      };

      const run = () => {
        if (reduced) {
          finish();
          return;
        }
        if (timerRef.current) clearInterval(timerRef.current);
        const target = Array.from(text);
        // Frame index at which each character begins scrambling.
        const startAt = target.map((_, i) => i * revealEvery);
        let frame = 0;

        timerRef.current = setInterval(() => {
          frame += 1;
          const next = target.map((ch, i) => {
            if (ch === " ") return " ";
            const elapsed = frame - startAt[i]!;
            if (elapsed < 0) return "";
            if (elapsed >= scrambleFor) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)] ?? ch;
          });
          const lock = target.map(
            (_, i) => frame - startAt[i]! >= scrambleFor
          );
          setDisplay(next);
          setLocked(lock);

          if (lock.every(Boolean)) {
            finish();
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, frameRate);
      };

      if (!("IntersectionObserver" in window)) {
        run();
        return () => {
          if (timerRef.current) clearInterval(timerRef.current);
        };
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              run();
              if (!repeat) observer.disconnect();
            } else if (repeat) {
              if (timerRef.current) clearInterval(timerRef.current);
              setDisplay(Array.from(text, () => ""));
              setLocked(Array.from(text, () => false));
            }
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(el);

      return () => {
        observer.disconnect();
        if (timerRef.current) clearInterval(timerRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, glyphs, frameRate, scrambleFor, revealEvery, repeat, reduced]);

    return (
      <span
        ref={mergeRefs(ref, hostRef)}
        className={cn("nova-scramble-in", className)}
        aria-label={text}
        {...rest}
      >
        <span aria-hidden="true">
          {display.map((ch, i) => (
            <span
              key={i}
              className={cn(
                "nova-scramble-in__char",
                !locked[i] && ch !== "" && "nova-scramble-in__char--scrambling"
              )}
            >
              {ch === "" ? "​" : ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    );
  }
);

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
