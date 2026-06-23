import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./VoiceMessage.css";

export interface VoiceMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay" | "onPause"> {
  /** Whether playback is currently running. */
  playing?: boolean;
  /** Total duration in seconds. */
  duration: number;
  /** Elapsed time in seconds. Drives the waveform progress. */
  elapsed?: number;
  /**
   * Waveform amplitudes (0–1). If omitted, a deterministic pseudo-waveform is
   * generated so the bubble always renders something pleasant.
   */
  waveform?: number[];
  /** Number of bars to render when `waveform` is omitted. Defaults to `40`. */
  bars?: number;
  /** Fires when the play/pause button is pressed. */
  onToggle?: (playing: boolean) => void;
  /** Accessible label for the play/pause button. */
  toggleLabel?: string;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function pseudoWaveform(count: number): number[] {
  // Deterministic, no randomness — SSR-safe and stable across renders.
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const v = Math.abs(Math.sin(i * 1.7) * 0.5 + Math.sin(i * 0.6) * 0.5);
    out.push(0.25 + v * 0.75);
  }
  return out;
}

const PlayIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M6 4.5l9 5.5-9 5.5z" fill="currentColor" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden="true" focusable="false">
    <rect x="5.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" />
    <rect x="11.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" />
  </svg>
);

export const VoiceMessage = forwardRef<HTMLDivElement, VoiceMessageProps>(
  function VoiceMessage(
    {
      playing = false,
      duration,
      elapsed = 0,
      waveform,
      bars = 40,
      onToggle,
      toggleLabel,
      className,
      ...rest
    },
    ref
  ) {
    const amps = useMemo(
      () => (waveform && waveform.length > 0 ? waveform : pseudoWaveform(bars)),
      [waveform, bars]
    );

    const ratio =
      duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 0;
    const playedBars = Math.round(ratio * amps.length);
    const remaining = Math.max(0, duration - elapsed);
    const label =
      toggleLabel ?? (playing ? "Pause voice message" : "Play voice message");

    return (
      <div
        ref={ref}
        className={cn(
          "nova-voice-message",
          playing && "nova-voice-message--playing",
          className
        )}
        {...rest}
      >
        <button
          type="button"
          className="nova-voice-message__toggle nova-focusable"
          aria-label={label}
          aria-pressed={playing}
          onClick={() => onToggle?.(!playing)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div
          className="nova-voice-message__wave"
          role="progressbar"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Playback progress"
        >
          {amps.map((amp, i) => (
            <span
              key={i}
              className={cn(
                "nova-voice-message__bar",
                i < playedBars && "nova-voice-message__bar--played"
              )}
              style={{ height: `${Math.max(8, Math.min(100, amp * 100))}%` }}
            />
          ))}
        </div>

        <span className="nova-voice-message__time">
          {formatTime(playing || elapsed > 0 ? elapsed : duration)}
          {(playing || elapsed > 0) && (
            <span className="nova-voice-message__time-remaining">
              {" "}/ -{formatTime(remaining)}
            </span>
          )}
        </span>
      </div>
    );
  }
);
