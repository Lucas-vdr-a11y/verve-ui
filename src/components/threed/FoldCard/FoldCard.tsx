import { forwardRef, useCallback, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./FoldCard.css";

export type FoldCardTrigger = "hover" | "click";

export interface FoldCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The cover panel (always visible). */
  cover: ReactNode;
  /** The revealed content shown once unfolded. */
  children?: ReactNode;
  /** Hinge edge the panel folds open from. @default "top" */
  hinge?: "top" | "bottom" | "left" | "right";
  /** What opens the fold. @default "hover" */
  trigger?: FoldCardTrigger;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. @default false */
  defaultOpen?: boolean;
  /** Fired when the open state changes. */
  onChange?: (open: boolean) => void;
}

/**
 * A card that unfolds in 3D: a cover panel rotates open from a hinge to reveal
 * content behind it. Opens on hover or click.
 */
export const FoldCard = forwardRef<HTMLDivElement, FoldCardProps>(
  function FoldCard(
    {
      cover,
      children,
      hinge = "top",
      trigger = "hover",
      open,
      defaultOpen = false,
      onChange,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const isControlled = open != null;
    const [internal, setInternal] = useState(defaultOpen);
    const isOpen = isControlled ? (open as boolean) : internal;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const hoverProps =
      trigger === "hover"
        ? {
            onMouseEnter: () => setOpen(true),
            onMouseLeave: () => setOpen(false),
            onFocus: () => setOpen(true),
            onBlur: () => setOpen(false),
          }
        : {};

    const clickProps =
      trigger === "click"
        ? {
            onClick: () => setOpen(!isOpen),
            onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(!isOpen);
              }
            },
          }
        : {};

    return (
      <div
        ref={ref}
        className={cn(
          "nova-fold-card",
          `nova-fold-card--hinge-${hinge}`,
          isOpen && "nova-fold-card--open",
          className
        )}
        style={style}
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        {...hoverProps}
        {...clickProps}
        {...rest}
      >
        <div className="nova-fold-card__reveal">{children}</div>
        <div className="nova-fold-card__panel">
          <div className="nova-fold-card__cover">{cover}</div>
        </div>
      </div>
    );
  }
);
