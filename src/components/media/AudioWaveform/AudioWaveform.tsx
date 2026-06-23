import { forwardRef, useCallback, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./AudioWaveform.css";

export interface AudioWaveformProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSeek"> {
  /**
   * Amplitude values (any positive scale; normalized internally). When omitted,
   * a deterministic pseudo-waveform of `bars` length is generated.
   */
  data?: number[];
  /** Number of bars to generate when `data` is not supplied. Defaults to `48`. */
  bars?: number;
  /** Playback progress, 0 to 1. Defaults to `0`. */
  progress?: number;
  /** Called with a 0-1 position when a bar is clicked. */
  onSeek?: (position: number) => void;
  /** Height of the waveform in px. Defaults to `48`. */
  height?: number;
}

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function generate(count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    // Blend a couple of waves with noise for an organic envelope.
    const env = Math.sin((i / count) * Math.PI);
    const v = 0.25 + env * (0.4 + 0.6 * pseudo(i + 1));
    out.push(v);
  }
  return out;
}

export const AudioWaveform = forwardRef<HTMLDivElement, AudioWaveformProps>(
  function AudioWaveform(
    {
      data,
      bars = 48,
      progress = 0,
      onSeek,
      height = 48,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const amplitudes = useMemo(() => {
      const source = data && data.length > 0 ? data : generate(bars);
      const max = Math.max(...source, 1e-6);
      return source.map((v) => Math.min(Math.max(v / max, 0.05), 1));
    }, [data, bars]);

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const playedCount = clampedProgress * amplitudes.length;

    const handleSeek = useCallback(
      (index: number) => {
        if (!onSeek) return;
        // Seek to the center of the clicked bar.
        const pos = (index + 0.5) / amplitudes.length;
        onSeek(Math.min(Math.max(pos, 0), 1));
      },
      [onSeek, amplitudes.length]
    );

    const interactive = Boolean(onSeek);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-audio-waveform",
          interactive && "nova-audio-waveform--interactive",
          className
        )}
        role={interactive ? "slider" : "img"}
        aria-label="Audio waveform"
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? 100 : undefined}
        aria-valuenow={interactive ? Math.round(clampedProgress * 100) : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  onSeek?.(Math.min(clampedProgress + 0.05, 1));
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  onSeek?.(Math.max(clampedProgress - 0.05, 0));
                }
              }
            : undefined
        }
        style={{ ["--nova-waveform-height" as string]: `${height}px`, ...style }}
        {...rest}
      >
        {amplitudes.map((amp, i) => {
          const played = i < playedCount;
          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className={cn(
                "nova-audio-waveform__bar",
                played && "nova-audio-waveform__bar--played"
              )}
              style={{ ["--nova-waveform-amp" as string]: String(amp) }}
              disabled={!interactive}
              onClick={() => handleSeek(i)}
            />
          );
        })}
      </div>
    );
  }
);
