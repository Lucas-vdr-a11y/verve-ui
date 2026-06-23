import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ContainerScroll.css";

export interface ContainerScrollProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional heading/caption rendered above the frame. */
  header?: React.ReactNode;
  /** Maximum tilt (degrees) when fully out of view. Defaults `28`. */
  maxTilt?: number;
  /** Media / screenshot to mount inside the device frame. */
  children?: React.ReactNode;
}

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * A 3D "device frame" that starts tilted back and rotates flat (and scales up
 * slightly) as it scrolls into view — the Aceternity container-scroll effect.
 * Drop a screenshot or any media node inside.
 *
 * Scroll progress is read from the wrapper's position and applied via CSS
 * custom properties, updated once per animation frame and cleaned up on
 * unmount. SSR-safe; under reduced motion the frame renders flat.
 */
export const ContainerScroll = forwardRef<HTMLDivElement, ContainerScrollProps>(
  function ContainerScroll(
    { header, maxTilt = 28, className, style, children, ...rest },
    ref
  ) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const frame = useRef<number | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = wrapRef.current;
      if (!el) return;

      const measure = () => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // 0 while the element's top is at the bottom of the viewport,
        // 1 once it has risen to roughly the upper third.
        const start = vh;
        const end = vh * 0.35;
        const p = (start - rect.top) / (start - end);
        setProgress(clamp(p));
      };
      const schedule = () => {
        if (frame.current === null) {
          frame.current = window.requestAnimationFrame(measure);
        }
      };

      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });

      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame.current !== null) {
          window.cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, []);

    return (
      <div
        ref={mergeRefs(ref, wrapRef)}
        className={cn("nova-container-scroll", className)}
        style={
          {
            "--nova-container-scroll-progress": progress,
            "--nova-container-scroll-tilt": `${maxTilt}deg`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {header && (
          <div className="nova-container-scroll__header">{header}</div>
        )}
        <div className="nova-container-scroll__perspective">
          <div className="nova-container-scroll__frame">
            <div className="nova-container-scroll__screen">{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

/** Merge a forwarded ref with a local one. */
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
