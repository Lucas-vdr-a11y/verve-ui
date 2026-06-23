import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./VideoPlayer.css";

export interface VideoSource {
  /** Media URL. */
  src: string;
  /** MIME type, e.g. `"video/mp4"`. */
  type?: string;
}

export interface VideoPlayerProps
  extends Omit<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    "controls" | "src" | "children"
  > {
  /** Single video source URL. Prefer `sources` for multiple formats. */
  src?: string;
  /** Multiple sources for format fallbacks. */
  sources?: VideoSource[];
  /** Poster image shown before playback. */
  poster?: string;
  /** Accessible label for the player region. Defaults to `"Video player"`. */
  "aria-label"?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
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
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
    <path
      d="M5 9v6h4l5 5V4L9 9H5z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 8.5a4 4 0 0 1 0 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
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

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
    <path
      d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
    <path
      d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Custom-styled controls layered over a native `<video>`. Supports play/pause,
 * seek with scrub, volume/mute, fullscreen, keyboard control, poster and
 * multiple sources. SSR-safe — all media access happens inside effects.
 */
export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      sources,
      poster,
      className,
      "aria-label": ariaLabel = "Video player",
      ...rest
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    // Sync state from the media element via its native events.
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onTime = () => setCurrent(v.currentTime);
      const onMeta = () => setDuration(v.duration);
      const onVolume = () => {
        setVolume(v.volume);
        setMuted(v.muted);
      };
      v.addEventListener("play", onPlay);
      v.addEventListener("pause", onPause);
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("loadedmetadata", onMeta);
      v.addEventListener("durationchange", onMeta);
      v.addEventListener("volumechange", onVolume);
      // Pick up an already-loaded source on mount.
      if (v.readyState >= 1) onMeta();
      onVolume();
      return () => {
        v.removeEventListener("play", onPlay);
        v.removeEventListener("pause", onPause);
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("loadedmetadata", onMeta);
        v.removeEventListener("durationchange", onMeta);
        v.removeEventListener("volumechange", onVolume);
      };
    }, []);

    // Track fullscreen changes (including ones the user triggers via Esc).
    useEffect(() => {
      const onFsChange = () =>
        setFullscreen(document.fullscreenElement === rootRef.current);
      document.addEventListener("fullscreenchange", onFsChange);
      return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    const togglePlay = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) void v.play();
      else v.pause();
    }, []);

    const seekTo = useCallback((time: number) => {
      const v = videoRef.current;
      if (!v) return;
      const clamped = Math.min(Math.max(time, 0), v.duration || 0);
      v.currentTime = clamped;
      setCurrent(clamped);
    }, []);

    const changeVolume = useCallback((value: number) => {
      const v = videoRef.current;
      if (!v) return;
      const clamped = Math.min(Math.max(value, 0), 1);
      v.volume = clamped;
      v.muted = clamped === 0;
    }, []);

    const toggleMute = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = !v.muted;
    }, []);

    const toggleFullscreen = useCallback(() => {
      const root = rootRef.current;
      if (!root) return;
      if (document.fullscreenElement === root) {
        void document.exitFullscreen?.();
      } else {
        void root.requestFullscreen?.();
      }
    }, []);

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(current + 5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(current - 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(volume - 0.1);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    }

    const progress = duration > 0 ? (current / duration) * 100 : 0;
    const volumePct = (muted ? 0 : volume) * 100;

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-video-player",
          fullscreen && "nova-video-player--fullscreen",
          className
        )}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          className="nova-video-player__video"
          poster={poster}
          onClick={togglePlay}
          {...rest}
        >
          {sources
            ? sources.map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))
            : src
              ? <source src={src} />
              : null}
        </video>

        <div className="nova-video-player__controls">
          <button
            type="button"
            className="nova-video-player__btn"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <span className="nova-video-player__time" aria-hidden="true">
            {formatTime(current)}
          </span>

          <input
            type="range"
            className="nova-video-player__seek"
            min={0}
            max={duration || 0}
            step="any"
            value={current}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration) || 0}
            aria-valuenow={Math.floor(current)}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            style={{ ["--nova-video-progress" as string]: `${progress}%` }}
          />

          <span className="nova-video-player__time" aria-hidden="true">
            {formatTime(duration)}
          </span>

          <button
            type="button"
            className="nova-video-player__btn"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
          >
            {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
          </button>

          <input
            type="range"
            className="nova-video-player__volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumePct)}
            style={{ ["--nova-video-progress" as string]: `${volumePct}%` }}
          />

          <button
            type="button"
            className="nova-video-player__btn"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-pressed={fullscreen}
          >
            {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>
    );
  }
);
