import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Thumbnail.css";

export type ThumbnailSize = "sm" | "md" | "lg";

export interface ThumbnailProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Image source URL. */
  src?: string;
  /** Alt text describing the tile. */
  alt?: string;
  /** Tile size. Defaults to `"md"`. */
  size?: ThumbnailSize;
  /** Optional aspect ratio (e.g. `16 / 9`). Defaults to `1` (square). */
  aspectRatio?: number;
  /** Show a play badge, marking the tile as a video. */
  video?: boolean;
  /** Optional duration badge text, e.g. `"2:34"`. */
  duration?: string;
  /** Marks the tile as the selected / active item. */
  selected?: boolean;
}

const PlayBadge = () => (
  <span className="nova-thumbnail__play" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="1.25em" height="1.25em">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  </span>
);

/**
 * Small media tile: a rounded image frame with an optional play badge (video),
 * duration badge and a selected/active state. Renders as a `<button>` so it is
 * keyboard-operable by default.
 */
export const Thumbnail = forwardRef<HTMLButtonElement, ThumbnailProps>(
  function Thumbnail(
    {
      src,
      alt = "",
      size = "md",
      aspectRatio = 1,
      video = false,
      duration,
      selected = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "nova-thumbnail",
          `nova-thumbnail--${size}`,
          selected && "nova-thumbnail--selected",
          className
        )}
        style={{
          ["--nova-thumbnail-ratio" as string]: String(aspectRatio),
          ...style,
        }}
        aria-pressed={selected}
        {...rest}
      >
        <span className="nova-thumbnail__frame">
          {src ? (
            <img
              className="nova-thumbnail__img"
              src={src}
              alt={alt}
              draggable={false}
            />
          ) : (
            <span className="nova-thumbnail__placeholder" aria-hidden="true" />
          )}

          {video && <PlayBadge />}

          {duration && (
            <span className="nova-thumbnail__duration">{duration}</span>
          )}
        </span>
      </button>
    );
  }
);
