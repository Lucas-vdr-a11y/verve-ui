import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BackgroundMedia.css";

export type BackgroundMediaOverlay = "none" | "scrim" | "dark" | "light";

export interface BackgroundMediaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Background image URL. Ignored when `videoSrc` is provided. */
  src?: string;
  /** Background video URL (autoplaying, muted, looping by default). */
  videoSrc?: string;
  /** Poster image for the video. */
  poster?: string;
  /** Alt text for an image background (rendered as an accessible `<img>`). */
  alt?: string;
  /** Overlay tint over the media. Defaults to `"scrim"`. */
  overlay?: BackgroundMediaOverlay;
  /** Minimum block size of the container, e.g. `"60vh"`. */
  minHeight?: string;
  /** Where to align the content slot. Defaults to `"center"`. */
  align?: "start" | "center" | "end";
  /** Foreground content rendered above the media + overlay. */
  children?: React.ReactNode;
}

/**
 * Full-bleed background image or video with a token-based overlay tint and a
 * content slot layered on top — ideal for heroes. Media is `object-fit: cover`.
 * SSR-safe (the `<video>` element renders on the server without JS).
 */
export const BackgroundMedia = forwardRef<HTMLDivElement, BackgroundMediaProps>(
  function BackgroundMedia(
    {
      src,
      videoSrc,
      poster,
      alt = "",
      overlay = "scrim",
      minHeight,
      align = "center",
      children,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-background-media",
          `nova-background-media--align-${align}`,
          className
        )}
        style={{
          ...(minHeight
            ? { ["--nova-background-media-min-h" as string]: minHeight }
            : null),
          ...style,
        }}
        {...rest}
      >
        <div className="nova-background-media__media" aria-hidden={!alt}>
          {videoSrc ? (
            <video
              className="nova-background-media__video"
              src={videoSrc}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : src ? (
            <img
              className="nova-background-media__img"
              src={src}
              alt={alt}
              draggable={false}
            />
          ) : null}
        </div>

        {overlay !== "none" && (
          <div
            className={cn(
              "nova-background-media__overlay",
              `nova-background-media__overlay--${overlay}`
            )}
            aria-hidden="true"
          />
        )}

        {children != null && (
          <div className="nova-background-media__content">{children}</div>
        )}
      </div>
    );
  }
);
