import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./FloatingCube.css";

export type FloatingCubeFace =
  | "front"
  | "back"
  | "right"
  | "left"
  | "top"
  | "bottom";

export interface FloatingCubeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content per face. Any omitted face renders empty. */
  faces?: Partial<Record<FloatingCubeFace, ReactNode>>;
  /** Edge length of the cube in pixels. @default 200 */
  size?: number;
  /** Seconds for one full rotation. Lower is faster. @default 16 */
  speed?: number;
  /** Pause auto-rotation. @default false */
  paused?: boolean;
}

const FACE_ORDER: FloatingCubeFace[] = [
  "front",
  "back",
  "right",
  "left",
  "top",
  "bottom",
];

/**
 * A slowly auto-rotating 3D cube with six content faces. Freezes under
 * `prefers-reduced-motion` while keeping every face readable.
 */
export const FloatingCube = forwardRef<HTMLDivElement, FloatingCubeProps>(
  function FloatingCube(
    {
      faces,
      size = 200,
      speed = 16,
      paused = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const sceneRef = useRef<HTMLDivElement | null>(null);
    const [hovered, setHovered] = useState(false);

    // Pause when the tab is hidden to avoid wasted work.
    const [tabHidden, setTabHidden] = useState(false);
    useEffect(() => {
      if (typeof document === "undefined") return;
      const onVis = () => setTabHidden(document.hidden);
      onVis();
      document.addEventListener("visibilitychange", onVis);
      return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    const animating = !reduced && !paused && !hovered && !tabHidden;

    const cssVars: CSSProperties = {
      ["--nova-floating-cube-size" as string]: `${size}px`,
      ["--nova-floating-cube-speed" as string]: `${speed}s`,
    };

    return (
      <div
        ref={ref}
        className={cn("nova-floating-cube", className)}
        style={{ ...cssVars, ...style }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...rest}
      >
        <div
          ref={sceneRef}
          className={cn(
            "nova-floating-cube__cube",
            animating && "nova-floating-cube__cube--spinning"
          )}
        >
          {FACE_ORDER.map((face) => (
            <div
              key={face}
              className={cn(
                "nova-floating-cube__face",
                `nova-floating-cube__face--${face}`
              )}
            >
              {faces?.[face]}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
