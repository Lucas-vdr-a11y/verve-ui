import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./PlayButton.css";

export type PlayButtonSize = "sm" | "md" | "lg";
export type PlayButtonVariant = "filled" | "outline";

export interface PlayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether media is currently playing. Controlled. Defaults to `false`. */
  playing?: boolean;
  /** Button size. Defaults to `"md"`. */
  size?: PlayButtonSize;
  /** Visual style. Defaults to `"filled"`. */
  variant?: PlayButtonVariant;
  /** Show an animated pulsing ring. Defaults to `false`. */
  pulse?: boolean;
  /** Accessible label for the play state. Defaults to `"Play"`. */
  playLabel?: string;
  /** Accessible label for the pause state. Defaults to `"Pause"`. */
  pauseLabel?: string;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
  </svg>
);

/**
 * Circular play / pause control intended to overlay media. Controlled via the
 * `playing` prop; emits standard `onClick`. Optional pulsing ring.
 */
export const PlayButton = forwardRef<HTMLButtonElement, PlayButtonProps>(
  function PlayButton(
    {
      playing = false,
      size = "md",
      variant = "filled",
      pulse = false,
      playLabel = "Play",
      pauseLabel = "Pause",
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "nova-play-button",
          `nova-play-button--${size}`,
          `nova-play-button--${variant}`,
          pulse && "nova-play-button--pulse",
          className
        )}
        aria-pressed={playing}
        aria-label={ariaLabel ?? (playing ? pauseLabel : playLabel)}
        {...rest}
      >
        {pulse && <span className="nova-play-button__ring" aria-hidden="true" />}
        <span className="nova-play-button__icon">
          {playing ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>
    );
  }
);
