import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DotsLoader.css";

export type DotsLoaderSize = "sm" | "md" | "lg";
export type DotsLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";
export type DotsLoaderVariant = "bounce" | "pulse";

export interface DotsLoaderProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: DotsLoaderSize;
  /** Color tone. Defaults to `"primary"`. */
  tone?: DotsLoaderTone;
  /** Animation style. Defaults to `"bounce"`. */
  variant?: DotsLoaderVariant;
  /** Number of dots. Defaults to `3`. */
  count?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

export const DotsLoader = forwardRef<HTMLSpanElement, DotsLoaderProps>(
  function DotsLoader(
    {
      size = "md",
      tone = "primary",
      variant = "bounce",
      count = 3,
      label = "Loading",
      className,
      ...rest
    },
    ref
  ) {
    const dots = Math.max(1, count);
    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(
          "nova-dots-loader",
          `nova-dots-loader--${size}`,
          `nova-dots-loader--${tone}`,
          `nova-dots-loader--${variant}`,
          className
        )}
        {...rest}
      >
        {Array.from({ length: dots }, (_, i) => (
          <span
            key={i}
            className="nova-dots-loader__dot"
            style={{ animationDelay: `${i * 140}ms` }}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  }
);
