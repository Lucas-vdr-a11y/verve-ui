import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SkeletonPresets.css";

function toLength(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/* ============================================================================
 * SkeletonText — n lines of text placeholders, last line shortened.
 * ========================================================================== */
export interface SkeletonTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of lines. Defaults to `3`. */
  lines?: number;
  /** Width of the last line (CSS length or %). Defaults to `"60%"`. */
  lastLineWidth?: number | string;
  /** Override line height (CSS length). */
  lineHeight?: number | string;
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText(
    { lines = 3, lastLineWidth = "60%", lineHeight, className, ...rest },
    ref
  ) {
    const count = Math.max(1, lines);
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-skeleton-text", className)}
        {...rest}
      >
        {Array.from({ length: count }, (_, i) => {
          const isLast = i === count - 1 && count > 1;
          return (
            <span
              key={i}
              className="nova-skeleton-text__line"
              style={{
                blockSize: toLength(lineHeight),
                inlineSize: isLast ? toLength(lastLineWidth) : undefined,
              }}
            />
          );
        })}
      </div>
    );
  }
);

/* ============================================================================
 * SkeletonAvatar — circular or rounded avatar placeholder.
 * ========================================================================== */
export type SkeletonAvatarSize = "sm" | "md" | "lg";
export type SkeletonAvatarShape = "circle" | "rounded";

export interface SkeletonAvatarProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: SkeletonAvatarSize;
  /** Shape. Defaults to `"circle"`. */
  shape?: SkeletonAvatarShape;
}

export const SkeletonAvatar = forwardRef<HTMLSpanElement, SkeletonAvatarProps>(
  function SkeletonAvatar(
    { size = "md", shape = "circle", className, ...rest },
    ref
  ) {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-skeleton-avatar",
          `nova-skeleton-avatar--${size}`,
          `nova-skeleton-avatar--${shape}`,
          className
        )}
        {...rest}
      />
    );
  }
);

/* ============================================================================
 * SkeletonCard — avatar + heading + lines, optional image banner.
 * ========================================================================== */
export interface SkeletonCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the avatar + heading header row. Defaults to `true`. */
  avatar?: boolean;
  /** Render a top image/banner block. Defaults to `false`. */
  image?: boolean;
  /** Number of body text lines. Defaults to `3`. */
  lines?: number;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  function SkeletonCard(
    { avatar = true, image = false, lines = 3, className, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-skeleton-card", className)}
        {...rest}
      >
        {image && <span className="nova-skeleton-card__image" />}
        {avatar && (
          <div className="nova-skeleton-card__header">
            <SkeletonAvatar size="md" />
            <div className="nova-skeleton-card__heading">
              <span className="nova-skeleton-card__title" />
              <span className="nova-skeleton-card__subtitle" />
            </div>
          </div>
        )}
        <SkeletonText lines={lines} />
      </div>
    );
  }
);
