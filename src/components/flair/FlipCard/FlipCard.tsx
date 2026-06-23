import { forwardRef, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./FlipCard.css";

export interface FlipCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Front face content. */
  front: React.ReactNode;
  /** Back face content. */
  back: React.ReactNode;
  /** What triggers the flip. Defaults `"hover"`. */
  trigger?: "hover" | "click";
  /** Flip axis. `"y"` flips horizontally, `"x"` vertically. Defaults `"y"`. */
  axis?: "x" | "y";
  /** Controlled flipped state. */
  flipped?: boolean;
  /** Initial flipped state (uncontrolled). Defaults `false`. */
  defaultFlipped?: boolean;
  /** Called when the flipped state changes (click trigger). */
  onChange?: (flipped: boolean) => void;
}

/**
 * A card that flips in 3D to reveal a back face, on hover or click. The two
 * faces are absolutely stacked with `backface-visibility: hidden`; the inner
 * wrapper rotates around the chosen axis.
 *
 * With the click trigger the card is a real toggle button (keyboard operable,
 * `aria-pressed`). Under reduced motion the flip is instant via tokens.
 */
export const FlipCard = forwardRef<HTMLDivElement, FlipCardProps>(
  function FlipCard(
    {
      front,
      back,
      trigger = "hover",
      axis = "y",
      flipped,
      defaultFlipped = false,
      onChange,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = flipped !== undefined;
    const [internal, setInternal] = useState(defaultFlipped);
    const isFlipped = isControlled ? flipped : internal;
    const id = useId();

    const toggle = () => {
      const next = !isFlipped;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const clickable = trigger === "click";

    return (
      <div
        ref={ref}
        className={cn(
          "nova-flip",
          `nova-flip--${axis}`,
          `nova-flip--${trigger}`,
          isFlipped && "nova-flip--flipped",
          className
        )}
        {...(clickable
          ? {
              role: "button",
              tabIndex: 0,
              "aria-pressed": isFlipped,
              "aria-controls": id,
              onClick: toggle,
              onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              },
            }
          : null)}
        {...rest}
      >
        <div className="nova-flip__inner" id={id}>
          <div className="nova-flip__face nova-flip__face--front">{front}</div>
          <div
            className="nova-flip__face nova-flip__face--back"
            aria-hidden={!isFlipped}
          >
            {back}
          </div>
        </div>
      </div>
    );
  }
);
