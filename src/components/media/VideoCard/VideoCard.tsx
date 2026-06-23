import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import "./VideoCard.css";

export interface VideoCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Thumbnail image source. */
  thumbnail?: string;
  /** Alt text for the thumbnail. */
  alt?: string;
  /** Aspect ratio of the thumbnail (e.g. `16 / 9`). Defaults to `16 / 9`. */
  aspectRatio?: number;
  /** Video title. */
  title?: ReactNode;
  /** Channel / author name. */
  author?: ReactNode;
  /** Optional author avatar source. */
  authorAvatar?: string;
  /** Duration badge text, e.g. `"12:04"`. */
  duration?: string;
  /** Meta line, e.g. `"1.2M views · 3 days ago"`. */
  meta?: ReactNode;
  /** Called when the card is activated (click / Enter / Space). */
  onActivate?: () => void;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

/**
 * Video preview card: a thumbnail with play overlay + duration badge, plus
 * title, channel/author and a meta line (views / date). Activatable via click
 * or keyboard when `onActivate` is provided.
 */
export const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(
  function VideoCard(
    {
      thumbnail,
      alt = "",
      aspectRatio = 16 / 9,
      title,
      author,
      authorAvatar,
      duration,
      meta,
      onActivate,
      className,
      style,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const interactive = !!onActivate;

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
      onClick?.(e);
      if (!e.defaultPrevented) onActivate?.();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (interactive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onActivate?.();
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "nova-video-card",
          interactive && "nova-video-card--interactive",
          className
        )}
        style={{
          ["--nova-video-card-ratio" as string]: String(aspectRatio),
          ...style,
        }}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? handleClick : onClick}
        onKeyDown={interactive ? handleKeyDown : onKeyDown}
        {...rest}
      >
        <div className="nova-video-card__media">
          {thumbnail ? (
            <img
              className="nova-video-card__thumb"
              src={thumbnail}
              alt={alt}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <span className="nova-video-card__placeholder" aria-hidden="true" />
          )}

          <span className="nova-video-card__overlay" aria-hidden="true">
            <span className="nova-video-card__play">
              <PlayIcon />
            </span>
          </span>

          {duration && (
            <span className="nova-video-card__duration">{duration}</span>
          )}
        </div>

        <div className="nova-video-card__body">
          {authorAvatar && (
            <img
              className="nova-video-card__avatar"
              src={authorAvatar}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          )}
          <div className="nova-video-card__text">
            {title != null && (
              <div className="nova-video-card__title">{title}</div>
            )}
            {author != null && (
              <div className="nova-video-card__author">{author}</div>
            )}
            {meta != null && <div className="nova-video-card__meta">{meta}</div>}
          </div>
        </div>
      </div>
    );
  }
);
