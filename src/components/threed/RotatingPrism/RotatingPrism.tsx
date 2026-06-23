import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./RotatingPrism.css";

export interface RotatingPrismProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Faces wrapped around the prism. 3 = triangular, 6 = hexagonal, etc. */
  faces: ReactNode[];
  /** Face width in px. @default 280 */
  width?: number;
  /** Face height in px. @default 160 */
  height?: number;
  /** Auto-advance every N ms. `0` disables. @default 4000 */
  interval?: number;
  /** Rotation axis. @default "x" (billboard-style vertical tumble) */
  axis?: "x" | "y";
  /** Controlled face index. */
  value?: number;
  /** Fired when the front face changes. */
  onChange?: (index: number) => void;
}

/**
 * A prism (triangular, hexagonal, …) that rotates to present each face like a
 * 3D billboard. Auto-advances on an interval that freezes under reduced-motion.
 */
export const RotatingPrism = forwardRef<HTMLDivElement, RotatingPrismProps>(
  function RotatingPrism(
    {
      faces,
      width = 280,
      height = 160,
      interval = 4000,
      axis = "x",
      value,
      onChange,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const count = Math.max(1, faces.length);
    const isControlled = value != null;
    const [internal, setInternal] = useState(0);
    const index = isControlled ? (value as number) : internal;

    const setIndex = useCallback(
      (next: number) => {
        const norm = ((next % count) + count) % count;
        if (!isControlled) setInternal(norm);
        onChange?.(norm);
      },
      [count, isControlled, onChange]
    );

    const indexRef = useRef(index);
    useEffect(() => {
      indexRef.current = index;
    }, [index]);

    const [hovered, setHovered] = useState(false);
    useEffect(() => {
      if (interval <= 0 || reduced || hovered || count <= 1) return;
      if (typeof window === "undefined") return;
      const id = window.setInterval(
        () => setIndex(indexRef.current + 1),
        interval
      );
      return () => window.clearInterval(id);
    }, [interval, reduced, hovered, count, setIndex]);

    // Apothem: distance from centre to a face = (size/2) / tan(pi/n).
    const apothemBase = axis === "x" ? height : width;
    const radius =
      count > 2
        ? Math.round(apothemBase / 2 / Math.tan(Math.PI / count))
        : 0;
    const faceAngle = 360 / count;
    const rotation = -(index * faceAngle);

    const cssVars: CSSProperties = {
      ["--nova-prism-w" as string]: `${width}px`,
      ["--nova-prism-h" as string]: `${height}px`,
      ["--nova-prism-radius" as string]: `${radius}px`,
      ["--nova-prism-rotation" as string]: `${rotation}deg`,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "nova-prism",
          `nova-prism--axis-${axis}`,
          className
        )}
        style={{ ...cssVars, ...style }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-roledescription="rotating prism"
        {...rest}
      >
        <div className="nova-prism__solid">
          {faces.map((face, i) => {
            const faceVars: CSSProperties = {
              ["--nova-prism-face-angle" as string]: `${faceAngle * i}deg`,
            };
            return (
              <div
                key={i}
                className="nova-prism__face"
                style={faceVars}
                aria-hidden={i !== index}
              >
                {face}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
