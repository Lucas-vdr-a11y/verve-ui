import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BentoGrid.css";

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base column count on the widest breakpoint. Defaults `3`. */
  columns?: 2 | 3 | 4;
  /** Gap between cells, any CSS length or token-friendly number (px). Defaults `"1rem"`. */
  gap?: number | string;
  children?: React.ReactNode;
}

/**
 * Asymmetric "bento box" feature grid. Cards opt into column/row spans through
 * {@link BentoCard}; the grid collapses to a single column on small screens.
 *
 * Pure CSS grid — SSR-safe, no measurement.
 */
export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  function BentoGrid(
    { columns = 3, gap = "1rem", className, style, children, ...rest },
    ref
  ) {
    const gapValue = typeof gap === "number" ? `${gap}px` : gap;
    return (
      <div
        ref={ref}
        className={cn("nova-bento", `nova-bento--cols-${columns}`, className)}
        style={
          {
            "--nova-bento-gap": gapValue,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    );
  }
);

export interface BentoCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Column span (1–4). Defaults `1`. */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span (1–3). Defaults `1`. */
  rowSpan?: 1 | 2 | 3;
  /** Leading icon / glyph node, rendered in the header. */
  icon?: React.ReactNode;
  /** Card title. */
  title?: React.ReactNode;
  /** Supporting description under the title. */
  description?: React.ReactNode;
  /** Call-to-action node rendered in the footer (link/button). */
  cta?: React.ReactNode;
  /** Decorative background slot, rendered behind the content (absolute). */
  background?: React.ReactNode;
  /** Disable the hover lift + spotlight. Defaults `false`. */
  flat?: boolean;
  children?: React.ReactNode;
}

/**
 * A single bento cell. Provide structured `icon`/`title`/`description`/`cta`
 * for the default premium layout, drop in arbitrary `children`, and/or layer a
 * decorative `background` node behind everything. A pointer-tracked spotlight
 * highlights the card on hover (suppressed when `flat`).
 */
export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  function BentoCard(
    {
      colSpan = 1,
      rowSpan = 1,
      icon,
      title,
      description,
      cta,
      background,
      flat = false,
      className,
      children,
      onPointerMove,
      ...rest
    },
    ref
  ) {
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!flat) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--nova-bento-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--nova-bento-y", `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-bento-card",
          `nova-bento-card--col-${colSpan}`,
          `nova-bento-card--row-${rowSpan}`,
          flat && "nova-bento-card--flat",
          className
        )}
        onPointerMove={handlePointerMove}
        {...rest}
      >
        {!flat && <span className="nova-bento-card__spotlight" aria-hidden="true" />}
        {background && (
          <div className="nova-bento-card__bg" aria-hidden="true">
            {background}
          </div>
        )}
        <div className="nova-bento-card__content">
          {(icon || title) && (
            <div className="nova-bento-card__header">
              {icon && (
                <span className="nova-bento-card__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              {title && <h3 className="nova-bento-card__title">{title}</h3>}
            </div>
          )}
          {description && (
            <p className="nova-bento-card__desc">{description}</p>
          )}
          {children}
          {cta && <div className="nova-bento-card__cta">{cta}</div>}
        </div>
      </div>
    );
  }
);
