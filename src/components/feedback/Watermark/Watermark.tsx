import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./Watermark.css";

export interface WatermarkProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** Repeating watermark text. Ignored when `image` is provided. */
  text?: string;
  /** Image URL used as the repeating tile instead of text. */
  image?: string;
  /** Rotation angle of each tile, in degrees. Defaults to `-22`. */
  angle?: number;
  /** Opacity of the watermark overlay (0–1). Defaults to `0.12`. */
  opacity?: number;
  /** Gap between tiles in px: `[x, y]`. Defaults to `[120, 100]`. */
  gap?: [number, number];
  /** Font size of the text tile, in px. Defaults to `16`. */
  fontSize?: number;
  /** Image tile width in px. Defaults to `120`. Ignored for text. */
  imageWidth?: number;
  /** Image tile height in px. Defaults to `64`. Ignored for text. */
  imageHeight?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Watermark — a repeating diagonal text or image overlay tiled across its
 * children (for branding / security / "draft" stamping). SSR-safe: the tile is
 * a pure-string SVG data URI built during render, no window/canvas access.
 */
export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(
  function Watermark(
    {
      text = "Watermark",
      image,
      angle = -22,
      opacity = 0.12,
      gap = [120, 100],
      fontSize = 16,
      imageWidth = 120,
      imageHeight = 64,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const [gapX, gapY] = gap;

    const dataUri = useMemo(() => {
      const tileW = image ? imageWidth : Math.max(gapX, 1);
      const tileH = image ? imageHeight : Math.max(fontSize * 2, 1);
      const fullW = tileW + gapX;
      const fullH = tileH + gapY;
      const cx = fullW / 2;
      const cy = fullH / 2;

      const inner = image
        ? `<image href="${escapeXml(image)}" x="${
            cx - tileW / 2
          }" y="${cy - tileH / 2}" width="${tileW}" height="${tileH}" />`
        : `<text x="${cx}" y="${cy}" fill="currentColor" font-family="${"sans-serif"}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${escapeXml(
            text
          )}</text>`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${fullW}" height="${fullH}"><g transform="rotate(${angle} ${cx} ${cy})">${inner}</g></svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }, [image, text, angle, gapX, gapY, fontSize, imageWidth, imageHeight]);

    return (
      <div
        ref={ref}
        className={cn("nova-watermark", className)}
        style={style}
        {...rest}
      >
        {children}
        <div
          aria-hidden="true"
          className="nova-watermark__overlay"
          style={{ backgroundImage: dataUri, opacity }}
        />
      </div>
    );
  }
);
