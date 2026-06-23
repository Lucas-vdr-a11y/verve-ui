import { forwardRef, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./FollowingPointerCard.css";

export interface FollowingPointerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Label shown next to the custom pointer while hovered. */
  label?: React.ReactNode;
  /** Accent color for the pointer + label (CSS color). Defaults brand primary. */
  color?: string;
  /** Card content. */
  children?: React.ReactNode;
}

/**
 * A card that hides the native cursor on hover and renders a custom pointer
 * (arrow + trailing label) that follows the cursor inside the card — the
 * Aceternity following-pointer. Pointer position is written to CSS variables on
 * pointer move; the system cursor returns on leave. Reduced motion keeps the
 * native cursor and skips the follower.
 */
export const FollowingPointerCard = forwardRef<
  HTMLDivElement,
  FollowingPointerCardProps
>(function FollowingPointerCard(
  {
    label = "You",
    color,
    className,
    children,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
    style,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!reduced) {
      const el = cardRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--nova-fp-x", `${e.clientX - r.left}px`);
        el.style.setProperty("--nova-fp-y", `${e.clientY - r.top}px`);
      }
    }
    onPointerMove?.(e);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!reduced) setActive(true);
    onPointerEnter?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setActive(false);
    onPointerLeave?.(e);
  };

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "nova-following-pointer",
        active && "nova-following-pointer--active",
        className
      )}
      style={
        {
          ...(color ? { "--nova-fp-color": color } : null),
          ...style,
        } as React.CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {children}
      {active && (
        <div className="nova-following-pointer__cursor" aria-hidden="true">
          <svg
            className="nova-following-pointer__arrow"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              d="M0 0l5 16 2.5-6.5L14 7 0 0z"
              fill="currentColor"
              stroke="var(--nova-surface)"
              strokeWidth="1"
            />
          </svg>
          <span className="nova-following-pointer__label">{label}</span>
        </div>
      )}
    </div>
  );
});
