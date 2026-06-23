import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ScrollProgress.css";

export interface ScrollProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Element to measure. Pass a ref to a scroll container to track its scroll,
   * or omit to track the whole document/window. Defaults the window.
   */
  target?: React.RefObject<HTMLElement | null>;
  /** Bar thickness, any CSS length or number (px). Defaults `"3px"`. */
  thickness?: number | string;
  /** Edge to pin the bar to. Defaults `"top"`. */
  position?: "top" | "bottom";
  /** Fill color, any CSS color. Defaults a brand gradient. */
  color?: string;
}

const getProgress = (target?: HTMLElement | null): number => {
  if (typeof window === "undefined") return 0;
  if (target) {
    const max = target.scrollHeight - target.clientHeight;
    return max <= 0 ? 0 : clamp(target.scrollTop / max);
  }
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  return max <= 0 ? 0 : clamp((window.scrollY || doc.scrollTop) / max);
};

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Slim progress bar pinned to the top (or bottom) of the viewport reflecting
 * how far the page — or a given scroll container — has been scrolled.
 *
 * The scroll listener is throttled to one update per animation frame and
 * cleaned up on unmount. SSR-safe (no window access during render). Marked
 * `aria-hidden` as it mirrors visible scroll position.
 */
export const ScrollProgress = forwardRef<HTMLDivElement, ScrollProgressProps>(
  function ScrollProgress(
    {
      target,
      thickness = "3px",
      position = "top",
      color,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const [progress, setProgress] = useState(0);
    const frame = useRef<number | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = target?.current ?? null;
      const scrollSource: HTMLElement | Window = el ?? window;

      const update = () => {
        frame.current = null;
        setProgress(getProgress(el));
      };
      const onScroll = () => {
        if (frame.current === null) {
          frame.current = window.requestAnimationFrame(update);
        }
      };

      update();
      scrollSource.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      return () => {
        scrollSource.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame.current !== null) {
          window.cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, [target]);

    const thicknessValue =
      typeof thickness === "number" ? `${thickness}px` : thickness;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-scroll-progress",
          `nova-scroll-progress--${position}`,
          className
        )}
        aria-hidden="true"
        style={
          {
            "--nova-scroll-progress-thickness": thicknessValue,
            ...(color ? { "--nova-scroll-progress-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div
          className="nova-scroll-progress__bar"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    );
  }
);
