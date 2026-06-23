import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ImagePlaceholder.css";

export interface ImagePlaceholderProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "placeholder"> {
  /** Real image source. */
  src?: string;
  /** Alt text. */
  alt?: string;
  /** Aspect ratio (e.g. `16 / 9`) to reserve layout space. */
  aspectRatio?: number;
  /** How the image fills its box. Defaults to `"cover"`. */
  fit?: "cover" | "contain";
  /** Solid placeholder color (any CSS color). Overridden by `gradient`. */
  color?: string;
  /**
   * Gradient placeholder, used as `background`. When set, takes precedence over
   * `color`. e.g. `"linear-gradient(135deg, #6366f1, #0ea5e9)"`.
   */
  gradient?: string;
  /** Called once the real image has loaded. */
  onLoad?: () => void;
}

/**
 * Graceful image placeholder: shows a solid color / gradient block (blurhash-
 * like) that crossfades to the real image once it loads. SSR-safe — the
 * placeholder renders on the server and the crossfade is driven by the image's
 * own `onLoad`. If the image is already cached/complete on mount, it's revealed
 * immediately.
 */
export const ImagePlaceholder = forwardRef<
  HTMLImageElement,
  ImagePlaceholderProps
>(function ImagePlaceholder(
  {
    src,
    alt = "",
    aspectRatio,
    fit = "cover",
    color = "var(--nova-bg-muted)",
    gradient,
    onLoad,
    className,
    style,
    ...rest
  },
  ref
) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  function setRefs(node: HTMLImageElement | null) {
    imgRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
  }

  // Handle images already complete before React attaches onLoad (cache / SSR
  // hydration). Reset when the source changes.
  useEffect(() => {
    setLoaded(false);
    const node = imgRef.current;
    if (node && node.complete && node.naturalWidth > 0) {
      setLoaded(true);
      onLoad?.();
    }
    // onLoad intentionally omitted from deps to avoid re-running on identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const placeholderStyle: React.CSSProperties = {
    background: gradient ?? color,
  };

  const wrapperStyle: React.CSSProperties = {
    ...(aspectRatio != null
      ? { ["--nova-image-placeholder-ratio" as string]: String(aspectRatio) }
      : null),
    ...style,
  };

  return (
    <span
      className={cn(
        "nova-image-placeholder",
        `nova-image-placeholder--${fit}`,
        aspectRatio != null && "nova-image-placeholder--ratio",
        loaded && "nova-image-placeholder--loaded",
        className
      )}
      style={wrapperStyle}
      data-loaded={loaded}
    >
      <span
        className="nova-image-placeholder__bg"
        style={placeholderStyle}
        aria-hidden="true"
      />
      {src && (
        <img
          ref={setRefs}
          className="nova-image-placeholder__img"
          src={src}
          alt={alt}
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
          {...rest}
        />
      )}
    </span>
  );
});
