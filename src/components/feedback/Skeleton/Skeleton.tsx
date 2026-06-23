import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Skeleton.css";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape of the placeholder. Defaults to `"text"`. */
  variant?: SkeletonVariant;
  /** Explicit width (number = px, string = any CSS length). */
  width?: number | string;
  /** Explicit height (number = px, string = any CSS length). */
  height?: number | string;
  /** Number of text lines. Only applies to the `"text"` variant. Defaults to `1`. */
  lines?: number;
}

function toLength(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    {
      variant = "text",
      width,
      height,
      lines = 1,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const isMultiline = variant === "text" && lines > 1;

    if (isMultiline) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          className={cn("nova-skeleton-group", className)}
          style={{ inlineSize: toLength(width), ...style }}
          {...rest}
        >
          {Array.from({ length: lines }, (_, i) => (
            <span
              key={i}
              className="nova-skeleton nova-skeleton--text"
              style={{ blockSize: toLength(height) }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-skeleton", `nova-skeleton--${variant}`, className)}
        style={{
          inlineSize: toLength(width),
          blockSize: toLength(height),
          ...style,
        }}
        {...rest}
      />
    );
  }
);
