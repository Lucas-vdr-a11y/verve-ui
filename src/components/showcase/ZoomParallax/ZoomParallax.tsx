import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ZoomParallax.css";

export interface ZoomParallaxItem {
  /** Image source. */
  src: string;
  /** Alt text. */
  alt?: string;
}

export interface ZoomParallaxProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Images to lay out. The first is the central image that scales up to fill;
   * the rest fan out around it and parallax outward. 5–7 looks best.
   */
  images: ZoomParallaxItem[];
  /** Peak scale applied to the central image. Defaults `8`. */
  maxScale?: number;
}

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Per-surrounding-image scale + outward drift, scaled by progress. */
const LAYOUT = [
  { scale: 5, x: "0%", y: "0%" }, // unused for center, kept for index parity
  { scale: 2.2, x: "0%", y: "-28vh" },
  { scale: 2.6, x: "5vw", y: "0%" },
  { scale: 3, x: "-25vw", y: "0%" },
  { scale: 2.4, x: "27vw", y: "28vh" },
  { scale: 2.8, x: "-22vw", y: "28vh" },
  { scale: 2.2, x: "22vw", y: "-26vh" },
];

/**
 * ZoomParallax — a classic scroll-driven zoom gallery. A tall section pins a
 * sticky stage; as you scroll through it the central image scales up to fill the
 * viewport while the surrounding images parallax outward at varying rates.
 *
 * Scroll progress is read from the section's bounding rect once per animation
 * frame (rAF-throttled scroll + resize listeners, cleaned up on unmount) and
 * pushed to CSS custom properties. SSR-safe; under reduced motion the stage
 * renders static via CSS.
 */
export const ZoomParallax = forwardRef<HTMLDivElement, ZoomParallaxProps>(
  function ZoomParallax(
    { images, maxScale = 8, className, style, ...rest },
    ref
  ) {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const frame = useRef<number | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = sectionRef.current;
      if (!el) return;

      const measure = () => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const total = rect.height - vh;
        if (total <= 0) {
          setProgress(0);
          return;
        }
        // 0 when section top hits viewport top, 1 when bottom reaches it.
        const p = -rect.top / total;
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
        ref={mergeRefs(ref, sectionRef)}
        className={cn("nova-zoom-parallax", className)}
        style={
          {
            "--nova-zoom-parallax-progress": progress,
            "--nova-zoom-parallax-max-scale": maxScale,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-zoom-parallax__sticky">
          {images.map((img, i) => {
            const isCenter = i === 0;
            const layout = LAYOUT[i] ?? LAYOUT[LAYOUT.length - 1]!;
            return (
              <div
                key={i}
                className={cn(
                  "nova-zoom-parallax__item",
                  isCenter && "nova-zoom-parallax__item--center"
                )}
                style={
                  {
                    "--nova-zoom-parallax-item-scale": isCenter
                      ? "var(--nova-zoom-parallax-max-scale)"
                      : layout.scale,
                    "--nova-zoom-parallax-item-x": isCenter ? "0%" : layout.x,
                    "--nova-zoom-parallax-item-y": isCenter ? "0%" : layout.y,
                  } as React.CSSProperties
                }
              >
                <img
                  className="nova-zoom-parallax__img"
                  src={img.src}
                  alt={img.alt ?? ""}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
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
