import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Badge.css";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. Defaults to `"neutral"`. */
  tone?: BadgeTone;
  /** Visual style. Defaults to `"soft"`. */
  variant?: BadgeVariant;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: BadgeSize;
  /** Renders a small leading status dot. */
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = "neutral",
    variant = "soft",
    size = "md",
    dot = false,
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "nova-badge",
        `nova-badge--${tone}`,
        `nova-badge--${variant}`,
        `nova-badge--${size}`,
        className
      )}
      {...rest}
    >
      {dot && <span className="nova-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
