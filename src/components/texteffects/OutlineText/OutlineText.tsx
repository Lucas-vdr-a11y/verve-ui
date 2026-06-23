import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./OutlineText.css";

export type OutlineTextFill = "none" | "hover" | "view";

export interface OutlineTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text to render as outlined display type. */
  children: React.ReactNode;
  /** Rendered element. Defaults `"span"`. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  /** When the hollow letters fill in. Defaults `"hover"`. */
  fill?: OutlineTextFill;
  /** Stroke width in px. Defaults `2`. */
  strokeWidth?: number;
  /** Stroke/fill color. Defaults the current text color token. */
  color?: string;
}

/**
 * OutlineText — hollow display type drawn with a text-stroke only. The fill can
 * sweep in on hover or when the element scrolls into view (left-to-right
 * clip-path wipe). Pure CSS animation; the view trigger uses an
 * IntersectionObserver with cleanup. SSR-safe; reduced motion snaps the fill.
 */
export const OutlineText = forwardRef<HTMLSpanElement, OutlineTextProps>(
  function OutlineText(
    {
      children,
      as: Tag = "span",
      fill = "hover",
      strokeWidth = 2,
      color,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const hostRef = useRef<HTMLSpanElement | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
      if (fill !== "view") return;
      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        setInView(true);
        return;
      }
      const el = hostRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
            }
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [fill]);

    return (
      <Tag
        ref={mergeRefs(ref, hostRef)}
        className={cn(
          "nova-outline-text",
          `nova-outline-text--fill-${fill}`,
          fill === "view" && inView && "nova-outline-text--in",
          className
        )}
        style={
          {
            "--nova-outline-text-stroke": `${strokeWidth}px`,
            ...(color ? { "--nova-outline-text-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <span className="nova-outline-text__outline" aria-hidden="true">
          {children}
        </span>
        <span className="nova-outline-text__fill" aria-hidden="true">
          {children}
        </span>
        <span className="nova-outline-text__sr">{children}</span>
      </Tag>
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
