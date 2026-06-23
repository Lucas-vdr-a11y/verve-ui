import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./AudioPlayer.css";

export interface AudioSource {
  /** Media URL. */
  src: string;
  /** MIME type, e.g. `"audio/mpeg"`. */
  type?: string;
}

export interface AudioPlayerProps
  extends Omit<
    React.AudioHTMLAttributes<HTMLAudioElement>,
    "controls" | "src" | "title" | "children"
  > {
  /** Single audio source URL. Prefer `sources` for multiple formats. */
  src?: string;
  /** Multiple sources for format fallbacks. */
  sources?: AudioSource[];
  /** Optional track title shown in the player. */
  trackTitle?: string;
  /** Optional artist / subtitle shown beneath the title. */
  artist?: string;
  /** Accessible label for the player region. Defaults to `"Audio player"`. */
  "aria-label"?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
  </svg>
);

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" aria-hidden="true">
    <path
      d="M5 9v6h4l5 5V4L9 9H5z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" aria-hidden="true">
    <path
      d="M5 9v6h4l5 5V4L9 9H5z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path
      d="M17 9l4 6M21 9l-4 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Compact audio player with play/pause, seek bar, time readout, volume/mute and
 * optional title/artist. SSR-safe — media access happens inside effects with
 * proper listener cleanup.
 */
export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer(
    {
      src,
      sources,
      trackTitle,
      artist,
      className,
      "aria-label": ariaLabel = "Audio player",
      ...rest
    },
    ref
  ) {
    const audioRef = useRef<HTMLAudioElement>(null);
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement, []);

    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
      const a = audioRef.current;
      if (!a) return;
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnded = () => setPlaying(false);
      const onTime = () => setCurrent(a.currentTime);
      const onMeta = () => setDuration(a.duration);
      const onVolume = () => {
        setVolume(a.volume);
        setMuted(a.muted);
      };
      a.addEventListener("play", onPlay);
      a.addEventListener("pause", onPause);
      a.addEventListener("ended", onEnded);
      a.addEventListener("timeupdate", onTime);
      a.addEventListener("loadedmetadata", onMeta);
      a.addEventListener("durationchange", onMeta);
      a.addEventListener("volumechange", onVolume);
      if (a.readyState >= 1) onMeta();
      onVolume();
      return () => {
        a.removeEventListener("play", onPlay);
        a.removeEventListener("pause", onPause);
        a.removeEventListener("ended", onEnded);
        a.removeEventListener("timeupdate", onTime);
        a.removeEventListener("loadedmetadata", onMeta);
        a.removeEventListener("durationchange", onMeta);
        a.removeEventListener("volumechange", onVolume);
      };
    }, []);

    const togglePlay = useCallback(() => {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) void a.play();
      else a.pause();
    }, []);

    const seekTo = useCallback((time: number) => {
      const a = audioRef.current;
      if (!a) return;
      const clamped = Math.min(Math.max(time, 0), a.duration || 0);
      a.currentTime = clamped;
      setCurrent(clamped);
    }, []);

    const changeVolume = useCallback((value: number) => {
      const a = audioRef.current;
      if (!a) return;
      const clamped = Math.min(Math.max(value, 0), 1);
      a.volume = clamped;
      a.muted = clamped === 0;
    }, []);

    const toggleMute = useCallback(() => {
      const a = audioRef.current;
      if (!a) return;
      a.muted = !a.muted;
    }, []);

    function handleSeekKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // Reserve vertical arrows for volume even when the seek bar is focused.
        e.preventDefault();
        changeVolume(volume + (e.key === "ArrowUp" ? 0.1 : -0.1));
      }
    }

    const progress = duration > 0 ? (current / duration) * 100 : 0;
    const volumePct = (muted ? 0 : volume) * 100;

    return (
      <div
        className={cn("nova-audio-player", className)}
        role="group"
        aria-label={ariaLabel}
      >
        <audio ref={audioRef} className="nova-audio-player__audio" {...rest}>
          {sources
            ? sources.map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))
            : src
              ? <source src={src} />
              : null}
        </audio>

        <button
          type="button"
          className="nova-audio-player__play"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="nova-audio-player__body">
          {(trackTitle || artist) && (
            <div className="nova-audio-player__meta">
              {trackTitle && (
                <span className="nova-audio-player__title">{trackTitle}</span>
              )}
              {artist && (
                <span className="nova-audio-player__artist">{artist}</span>
              )}
            </div>
          )}

          <div className="nova-audio-player__row">
            <input
              type="range"
              className="nova-audio-player__seek"
              min={0}
              max={duration || 0}
              step="any"
              value={current}
              onChange={(e) => seekTo(Number(e.target.value))}
              onKeyDown={handleSeekKeyDown}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration) || 0}
              aria-valuenow={Math.floor(current)}
              aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
              style={{ ["--nova-audio-progress" as string]: `${progress}%` }}
            />
            <span className="nova-audio-player__time" aria-hidden="true">
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="nova-audio-player__volume-group">
          <button
            type="button"
            className="nova-audio-player__icon-btn"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
          >
            {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
          </button>
          <input
            type="range"
            className="nova-audio-player__volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumePct)}
            style={{ ["--nova-audio-progress" as string]: `${volumePct}%` }}
          />
        </div>
      </div>
    );
  }
);
