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
import "./FlipBox.css";

export type FlipBoxTrigger = "hover" | "click" | "auto";
export type FlipBoxAxis = "x" | "y";

export interface FlipBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Faces to rotate through. 2 faces = front/back flip; more = a rotating reel. */
  faces: ReactNode[];
  /** Rotation axis. @default "y" */
  axis?: FlipBoxAxis;
  /** What advances the box. @default "hover" */
  trigger?: FlipBoxTrigger;
  /** Interval (ms) for `trigger="auto"`. @default 3000 */
  interval?: number;
  /** Box width in px. @default 240 */
  width?: number;
  /** Box height in px. @default 160 */
  height?: number;
  /** Controlled face index. */
  value?: number;
  /** Fired when the visible face changes. */
  onChange?: (index: number) => void;
}

/**
 * A box that rotates to reveal a different face. With two faces it is a classic
 * front/back flip; with more it cycles like a reel. Trigger by hover, click, or
 * auto (auto freezes under reduced-motion).
 */
export const FlipBox = forwardRef<HTMLDivElement, FlipBoxProps>(
  function FlipBox(
    {
      faces,
      axis = "y",
      trigger = "hover",
      interval = 3000,
      width = 240,
      height = 160,
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

    // Auto advance.
    const [hovered, setHovered] = useState(false);
    useEffect(() => {
      if (trigger !== "auto" || reduced || count <= 1) return;
      if (typeof window === "undefined") return;
      const id = window.setInterval(
        () => setIndex(indexRef.current + 1),
        interval
      );
      return () => window.clearInterval(id);
    }, [trigger, reduced, count, interval, setIndex]);

    const advance = () => setIndex(index + 1);

    // For two faces we flip 180deg; for N faces we treat it as a flat reel that
    // translates between faces stacked along the rotation axis.
    const isTwo = count === 2;
    const angle = isTwo
      ? index * 180
      : (360 / count) * index;

    const cssVars: CSSProperties = {
      ["--nova-flipbox-w" as string]: `${width}px`,
      ["--nova-flipbox-h" as string]: `${height}px`,
      ["--nova-flipbox-angle" as string]: `${-angle}deg`,
      ["--nova-flipbox-faces" as string]: String(count),
      ["--nova-flipbox-depth" as string]: isTwo
        ? "0px"
        : `${Math.round(
            (axis === "y" ? width : height) / 2 / Math.tan(Math.PI / count)
          )}px`,
    };

    const hoverActive = trigger === "hover" && hovered && !reduced;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-flipbox",
          `nova-flipbox--axis-${axis}`,
          isTwo ? "nova-flipbox--flip" : "nova-flipbox--reel",
          className
        )}
        style={{ ...cssVars, ...style }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={trigger === "click" ? advance : undefined}
        role={trigger === "click" ? "button" : undefined}
        tabIndex={trigger === "click" ? 0 : undefined}
        onKeyDown={
          trigger === "click"
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  advance();
                }
              }
            : undefined
        }
        {...rest}
      >
        <div
          className={cn(
            "nova-flipbox__box",
            hoverActive && "nova-flipbox__box--hover"
          )}
        >
          {faces.map((face, i) => {
            const faceVars: CSSProperties = isTwo
              ? {}
              : { ["--nova-flipbox-face-i" as string]: String(i) };
            return (
              <div
                key={i}
                className={cn(
                  "nova-flipbox__face",
                  isTwo &&
                    (i === 0
                      ? "nova-flipbox__face--front"
                      : "nova-flipbox__face--back")
                )}
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
