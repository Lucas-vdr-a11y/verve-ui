import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./GradientBlob.css";

export interface GradientBlobProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Diameter token. Defaults `"lg"`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Core tint color (any CSS color). Defaults the primary token. */
  tint?: string;
  /** Optional second tint to blend toward at the edge. Defaults a transparent fade. */
  tint2?: string;
  /** Blur radius in px for the soft glow. Defaults `48`. */
  blur?: number;
  /** Core opacity 0–1. Defaults `0.55`. */
  opacity?: number;
}

const SIZES: Record<NonNullable<GradientBlobProps["size"]>, number> = {
  sm: 160,
  md: 280,
  lg: 420,
  xl: 600,
};

/**
 * A soft, blurred radial-gradient blob for ambient color accents — drop it behind
 * a hero or card for a glow. Tintable, sizeable, purely CSS (no SVG).
 *
 * SSR-safe, no motion. Decorative — aria-hidden. Position it with `style`/className
 * (it is `position: absolute`-friendly via a transparent wrapper).
 */
export const GradientBlob = forwardRef<HTMLDivElement, GradientBlobProps>(
  function GradientBlob(
    {
      size = "lg",
      tint = "var(--nova-primary)",
      tint2 = "transparent",
      blur = 48,
      opacity = 0.55,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = SIZES[size];
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("nova-gradient-blob", className)}
        style={
          {
            "--nova-gblob-tint": tint,
            "--nova-gblob-tint2": tint2,
            "--nova-gblob-blur": `${blur}px`,
            "--nova-gblob-opacity": opacity,
            width: px,
            height: px,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  }
);
