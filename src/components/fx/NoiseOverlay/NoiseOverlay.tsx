import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./NoiseOverlay.css";

export interface NoiseOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Overlay opacity (0–1). Defaults `0.06`. */
  opacity?: number;
  /** Base frequency of the turbulence — higher = finer grain. Defaults `0.8`. */
  frequency?: number;
  /** Tile size of the generated noise in px. Defaults `120`. */
  tile?: number;
  /** Subtle animated flicker like real film grain. Defaults `false`. */
  animated?: boolean;
  /** Blend mode for the grain over content. Defaults `"overlay"`. */
  blendMode?: React.CSSProperties["mixBlendMode"];
}

/**
 * A subtle film-grain/noise texture overlay generated entirely from an inline
 * SVG `feTurbulence` data-URI — no image assets. Sits above content as a
 * decorative, non-interactive layer. Optional flicker animates the grain.
 *
 * SSR-safe (the data-URI is built during render, no browser APIs). Decorative —
 * aria-hidden, pointer-events none. Flicker freezes on reduced-motion.
 */
export const NoiseOverlay = forwardRef<HTMLDivElement, NoiseOverlayProps>(
  function NoiseOverlay(
    {
      opacity = 0.06,
      frequency = 0.8,
      tile = 120,
      animated = false,
      blendMode = "overlay",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const dataUri = useMemo(() => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
      return `url("data:image/svg+xml,${svg.replace(/#/g, "%23").replace(/"/g, "'")}")`;
    }, [frequency, tile]);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-noise",
          animated && "nova-noise--animated",
          className
        )}
        style={
          {
            "--nova-noise-image": dataUri,
            "--nova-noise-opacity": opacity,
            "--nova-noise-tile": `${tile}px`,
            mixBlendMode: blendMode,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  }
);
