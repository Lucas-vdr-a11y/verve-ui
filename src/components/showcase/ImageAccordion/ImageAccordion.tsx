import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ImageAccordion.css";

export interface ImageAccordionItem {
  /** Image source. */
  src: string;
  /** Alt text (also used as the default caption). */
  alt?: string;
  /** Caption shown when the panel expands. Falls back to `alt`. */
  caption?: React.ReactNode;
}

export interface ImageAccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Panels to render. */
  items: ImageAccordionItem[];
  /** Index expanded on first render. Defaults `0`. */
  defaultIndex?: number;
  /** Notified whenever the active panel changes. */
  onChange?: (index: number) => void;
}

/**
 * ImageAccordion — a row of images that expand (flex-grow) on hover or focus to
 * reveal a caption, the classic interactive accordion gallery. Fully keyboard
 * accessible: each panel is a focusable button that expands on focus, and
 * Arrow / Home / End move between panels via roving focus. The expand/collapse
 * is a pure CSS flex transition; SSR-safe with no effects. Under reduced motion
 * the resize is instant (handled in CSS).
 */
export const ImageAccordion = forwardRef<HTMLDivElement, ImageAccordionProps>(
  function ImageAccordion(
    { items, defaultIndex = 0, onChange, className, ...rest },
    ref
  ) {
    const [active, setActive] = useState(defaultIndex);

    const select = (index: number) => {
      if (index === active) return;
      setActive(index);
      onChange?.(index);
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      index: number
    ) => {
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;

      e.preventDefault();
      next = (next + items.length) % items.length;
      select(next);
      const root = e.currentTarget.parentElement;
      const target = root?.children[next] as HTMLButtonElement | undefined;
      target?.focus();
    };

    return (
      <div
        ref={ref}
        className={cn("nova-image-accordion", className)}
        role="group"
        {...rest}
      >
        {items.map((item, i) => {
          const expanded = i === active;
          const caption = item.caption ?? item.alt;
          return (
            <button
              key={i}
              type="button"
              className={cn(
                "nova-image-accordion__panel",
                expanded && "nova-image-accordion__panel--active"
              )}
              aria-expanded={expanded}
              aria-label={item.alt}
              tabIndex={expanded ? 0 : -1}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <img
                className="nova-image-accordion__img"
                src={item.src}
                alt=""
                loading="lazy"
                draggable={false}
              />
              {caption != null && (
                <span className="nova-image-accordion__caption" aria-hidden={!expanded}>
                  {caption}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);
