import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./SpotlightFeatureCard.css";

export interface SpotlightFeatureCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Eyebrow above the title. */
  eyebrow?: React.ReactNode;
  /** Primary title. */
  title: React.ReactNode;
  /** Supporting description shown in the base layer. */
  description?: React.ReactNode;
  /** Secondary layer revealed on hover/focus (CTA, stats, etc.). */
  reveal?: React.ReactNode;
  /** Radius (px) of the cursor spotlight. Defaults `260`. */
  spotlightRadius?: number;
}

/**
 * SpotlightFeatureCard — a premium feature card with a cursor-following radial
 * spotlight on the border/surface AND a secondary layer that slides up to reveal
 * extra content (CTA, metrics) on hover or keyboard focus.
 *
 * The pointer position is written to CSS custom properties via a rAF-throttled
 * `pointermove` listener attached in an effect with cleanup; SSR-safe (guards
 * `window`). Under reduced motion the spotlight centers statically and the reveal
 * layer shows without sliding.
 */
export const SpotlightFeatureCard = forwardRef<
  HTMLDivElement,
  SpotlightFeatureCardProps
>(function SpotlightFeatureCard(
  {
    eyebrow,
    title,
    description,
    reveal,
    spotlightRadius = 260,
    className,
    style,
    tabIndex,
    ...rest
  },
  ref
) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    const card = cardRef.current;
    if (!card) return;

    let px = 0;
    let py = 0;
    const apply = () => {
      frame.current = null;
      card.style.setProperty("--nova-spotlight-x", `${px}px`);
      card.style.setProperty("--nova-spotlight-y", `${py}px`);
    };
    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(apply);
      }
    };
    const onEnter = () => card.setAttribute("data-spot", "");
    const onLeave = () => card.removeAttribute("data-spot");

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [reduced]);

  return (
    <div
      ref={mergeRefs(ref, cardRef)}
      className={cn(
        "nova-spotlight-feature-card nova-focusable",
        reduced && "nova-spotlight-feature-card--reduced",
        className
      )}
      tabIndex={tabIndex ?? 0}
      style={
        {
          "--nova-spotlight-radius": `${spotlightRadius}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span className="nova-spotlight-feature-card__glow" aria-hidden="true" />
      <div className="nova-spotlight-feature-card__base">
        {eyebrow && (
          <span className="nova-spotlight-feature-card__eyebrow">{eyebrow}</span>
        )}
        <h3 className="nova-spotlight-feature-card__title">{title}</h3>
        {description && (
          <p className="nova-spotlight-feature-card__desc">{description}</p>
        )}
      </div>
      {reveal && (
        <div className="nova-spotlight-feature-card__reveal">{reveal}</div>
      )}
    </div>
  );
});

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
