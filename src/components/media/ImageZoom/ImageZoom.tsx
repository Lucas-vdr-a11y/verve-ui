import {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./ImageZoom.css";

export type ImageZoomMode = "lens" | "click";

export interface ImageZoomProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  /** Image source URL. */
  src: string;
  /** Alt text. Always provide for meaningful images. */
  alt?: string;
  /**
   * Interaction mode.
   * - `"lens"`: a magnifier lens follows the cursor on hover/move.
   * - `"click"`: click toggles a zoomed (pan) view.
   * Defaults to `"lens"`.
   */
  mode?: ImageZoomMode;
  /** Magnification factor. Defaults to `2.5`. */
  zoom?: number;
  /** Diameter of the lens in px (lens mode only). Defaults to `160`. */
  lensSize?: number;
}

interface Pos {
  x: number;
  y: number;
}

const canUseDOM = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export const ImageZoom = forwardRef<HTMLDivElement, ImageZoomProps>(
  function ImageZoom(
    {
      src,
      alt = "",
      mode = "lens",
      zoom = 2.5,
      lensSize = 160,
      className,
      ...rest
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState(false);
    // Cursor position as a fraction (0-1) within the image.
    const [pos, setPos] = useState<Pos>({ x: 0.5, y: 0.5 });

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const updatePos = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      setPos({ x, y });
    }, []);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!active) return;
        updatePos(e);
      },
      [active, updatePos]
    );

    const handleEnter = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== "lens") return;
        updatePos(e);
        setActive(true);
      },
      [mode, updatePos]
    );

    const handleLeave = useCallback(() => {
      if (mode === "lens") setActive(false);
    }, [mode]);

    const handleClick = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== "click") return;
        updatePos(e);
        setActive((a) => !a);
      },
      [mode, updatePos]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (mode !== "click") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive((a) => !a);
        } else if (e.key === "Escape") {
          setActive(false);
        }
      },
      [mode]
    );

    const pctX = pos.x * 100;
    const pctY = pos.y * 100;

    // Lens overlay style — only meaningful in the browser.
    const lensStyle: React.CSSProperties = canUseDOM()
      ? {
          width: lensSize,
          height: lensSize,
          left: `calc(${pctX}% - ${lensSize / 2}px)`,
          top: `calc(${pctY}% - ${lensSize / 2}px)`,
          backgroundImage: `url(${src})`,
          backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
          backgroundPosition: `${pctX}% ${pctY}%`,
        }
      : {};

    const isClick = mode === "click";

    return (
      <div
        ref={setRefs}
        className={cn(
          "nova-image-zoom",
          `nova-image-zoom--${mode}`,
          active && "nova-image-zoom--active",
          className
        )}
        role={isClick ? "button" : undefined}
        tabIndex={isClick ? 0 : undefined}
        aria-pressed={isClick ? active : undefined}
        aria-label={isClick ? alt || "Zoom image" : undefined}
        onPointerEnter={handleEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <img
          className="nova-image-zoom__img"
          src={src}
          alt={alt}
          draggable={false}
          style={
            isClick && active
              ? {
                  transform: `scale(${zoom})`,
                  transformOrigin: `${pctX}% ${pctY}%`,
                }
              : undefined
          }
        />
        {mode === "lens" && active && (
          <span
            className="nova-image-zoom__lens"
            aria-hidden="true"
            style={lensStyle}
          />
        )}
      </div>
    );
  }
);
