import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./AnimatedTooltipGroup.css";

export interface AnimatedTooltipItem {
  /** Stable key. */
  id: string | number;
  /** Person's name (tooltip title). */
  name: string;
  /** Subtitle/role line. */
  title?: string;
  /** Avatar image source. */
  image?: string;
  /** Fallback content if no image (e.g. initials). */
  fallback?: React.ReactNode;
}

export interface AnimatedTooltipGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatars to render. */
  items: AnimatedTooltipItem[];
  /** Max rotation (deg) the tooltip tilts toward the cursor. Defaults `12`. */
  rotate?: number;
  /** Avatar diameter (px). Defaults `44`. */
  size?: number;
}

/**
 * A row of overlapping avatars; hovering one pops a spring tooltip with name and
 * title that subtly rotates and slides toward the cursor's horizontal position
 * over the avatar (the Aceternity animated tooltip). Pointer X is mapped to a
 * small rotation + translate written to CSS variables.
 *
 * Each avatar is a focusable button; the tooltip also reveals on keyboard focus
 * and is wired via `aria-describedby`. SSR-safe.
 */
export const AnimatedTooltipGroup = forwardRef<
  HTMLDivElement,
  AnimatedTooltipGroupProps
>(function AnimatedTooltipGroup(
  { items, rotate = 12, size = 44, className, style, ...rest },
  ref
) {
  const [hovered, setHovered] = useState<string | number | null>(null);
  const baseId = useId();

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      target.style.setProperty("--nova-tip-rotate", `${(px * 2 * rotate).toFixed(2)}deg`);
      target.style.setProperty("--nova-tip-x", `${(px * 28).toFixed(1)}px`);
    },
    [rotate]
  );

  return (
    <div
      ref={ref}
      className={cn("nova-tipgroup", className)}
      style={
        {
          "--nova-tip-size": `${size}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {items.map((item) => {
        const tipId = `${baseId}-${item.id}`;
        const isOpen = hovered === item.id;
        return (
          <div
            key={item.id}
            className="nova-tipgroup__item"
            onPointerMove={handlePointerMove}
          >
            <div
              className={cn(
                "nova-tipgroup__tooltip",
                isOpen && "nova-tipgroup__tooltip--open"
              )}
              id={tipId}
              role="tooltip"
            >
              <span className="nova-tipgroup__name">{item.name}</span>
              {item.title ? (
                <span className="nova-tipgroup__title">{item.title}</span>
              ) : null}
              <span className="nova-tipgroup__arrow" aria-hidden="true" />
            </div>
            <button
              type="button"
              className="nova-tipgroup__avatar"
              aria-label={item.name}
              aria-describedby={isOpen ? tipId : undefined}
              onPointerEnter={() => setHovered(item.id)}
              onPointerLeave={() =>
                setHovered((cur) => (cur === item.id ? null : cur))
              }
              onFocus={() => setHovered(item.id)}
              onBlur={() =>
                setHovered((cur) => (cur === item.id ? null : cur))
              }
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="nova-tipgroup__img"
                  draggable={false}
                />
              ) : (
                <span className="nova-tipgroup__fallback">
                  {item.fallback ?? item.name.charAt(0)}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
});
