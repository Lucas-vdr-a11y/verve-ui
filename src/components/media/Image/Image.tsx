import { forwardRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./Image.css";

export type ImageFit = "cover" | "contain";

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> {
  /** Image source URL. */
  src?: string;
  /** Alt text. Always provide for meaningful images. */
  alt?: string;
  /** How the image fills its box. Defaults to `"cover"`. */
  fit?: ImageFit;
  /** Apply a rounded corner radius. Defaults to `false`. */
  rounded?: boolean;
  /**
   * Optional aspect ratio (e.g. `16 / 9`). When set, the image is wrapped in a
   * ratio-locked box and stretched to fill it.
   */
  aspectRatio?: number;
  /**
   * Fallback shown when the image fails to load. A string is treated as a
   * replacement `src`; a node is rendered in place of the image.
   */
  fallback?: string | ReactNode;
  /** Called when the image fails to load (after fallback handling). */
  onError?: () => void;
}

type LoadState = "loading" | "loaded" | "error";

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt = "",
    fit = "cover",
    rounded = false,
    aspectRatio,
    fallback,
    onError,
    className,
    style,
    ...rest
  },
  ref
) {
  const [state, setState] = useState<LoadState>(src ? "loading" : "error");
  // If a string fallback is supplied, swap to it once on error.
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    setState(src ? "loading" : "error");
    setCurrentSrc(src);
    setFallbackUsed(false);
  }, [src]);

  const stringFallback = typeof fallback === "string" ? fallback : undefined;
  const nodeFallback = typeof fallback !== "string" ? fallback : undefined;

  function handleError() {
    if (stringFallback && !fallbackUsed) {
      setFallbackUsed(true);
      setCurrentSrc(stringFallback);
      setState("loading");
      return;
    }
    setState("error");
    onError?.();
  }

  const showNodeFallback = state === "error" && nodeFallback != null;
  const showSkeleton = state === "loading";

  const wrapperStyle: React.CSSProperties = {
    ...(aspectRatio != null
      ? { ["--nova-image-ratio" as string]: String(aspectRatio) }
      : null),
    ...style,
  };

  return (
    <span
      className={cn(
        "nova-image",
        `nova-image--${fit}`,
        rounded && "nova-image--rounded",
        aspectRatio != null && "nova-image--ratio",
        className
      )}
      style={wrapperStyle}
      data-state={state}
    >
      {showSkeleton && <span className="nova-image__skeleton" aria-hidden="true" />}

      {showNodeFallback ? (
        <span className="nova-image__fallback" role="img" aria-label={alt || undefined}>
          {nodeFallback}
        </span>
      ) : (
        <img
          ref={ref}
          className="nova-image__img"
          src={currentSrc}
          alt={alt}
          onLoad={() => setState("loaded")}
          onError={handleError}
          {...rest}
        />
      )}
    </span>
  );
});
