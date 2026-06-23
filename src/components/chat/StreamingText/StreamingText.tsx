import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./StreamingText.css";

export interface StreamingTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The full text to reveal. Appending to this streams the new characters in. */
  text: string;
  /** Characters revealed per second. Defaults to `40`. */
  speed?: number;
  /** Show a blinking caret while streaming. Defaults to `true`. */
  caret?: boolean;
  /** Fires once the visible text has fully caught up to `text`. */
  onDone?: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const StreamingText = forwardRef<HTMLSpanElement, StreamingTextProps>(
  function StreamingText(
    { text, speed = 40, caret = true, onDone, className, ...rest },
    ref
  ) {
    const [count, setCount] = useState(() =>
      prefersReducedMotion() ? text.length : 0
    );
    const rafRef = useRef<number | null>(null);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    // Keep the revealed count from exceeding the (possibly shorter) new text.
    const safeCount = Math.min(count, text.length);
    const done = safeCount >= text.length;

    useEffect(() => {
      if (typeof window === "undefined") return;

      if (prefersReducedMotion()) {
        setCount(text.length);
        return;
      }

      const perChar = speed > 0 ? 1000 / speed : 0;
      let lastTime: number | null = null;

      const tick = (now: number) => {
        if (lastTime == null) lastTime = now;
        const elapsed = now - lastTime;
        const advance =
          perChar > 0 ? Math.floor(elapsed / perChar) : text.length;

        let reachedEnd = false;
        if (advance > 0) {
          lastTime = now;
          setCount((c) => {
            const next = Math.min(c + advance, text.length);
            if (next >= text.length) reachedEnd = true;
            return next;
          });
        }
        if (!reachedEnd) {
          rafRef.current = window.requestAnimationFrame(tick);
        }
      };

      rafRef.current = window.requestAnimationFrame(tick);

      return () => {
        if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, [text, speed]);

    const prevDoneRef = useRef(false);
    useEffect(() => {
      if (done && !prevDoneRef.current) {
        prevDoneRef.current = true;
        onDoneRef.current?.();
      }
      if (!done) prevDoneRef.current = false;
    }, [done]);

    const visible = text.slice(0, safeCount);

    return (
      <span
        ref={ref}
        className={cn("nova-streaming-text", className)}
        aria-live="polite"
        {...rest}
      >
        <span className="nova-streaming-text__content">{visible}</span>
        {caret && !done && (
          <span className="nova-streaming-text__caret" aria-hidden="true" />
        )}
      </span>
    );
  }
);
