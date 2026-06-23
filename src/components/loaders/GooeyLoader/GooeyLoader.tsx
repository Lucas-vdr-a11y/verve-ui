import { forwardRef, useId } from "react";
import { cn } from "../../../utils/cn";
import "./GooeyLoader.css";

export type GooeyLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type GooeyLoaderSize = "sm" | "md" | "lg" | number;

export interface GooeyLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: GooeyLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: GooeyLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<GooeyLoaderSize, number>, number> = {
  sm: 40,
  md: 64,
  lg: 96,
};

function resolveSize(size: GooeyLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const GooeyLoader = forwardRef<HTMLSpanElement, GooeyLoaderProps>(
  function GooeyLoader(
    { size = "md", tone = "primary", color, label = "Loading", className, style, ...rest },
    ref
  ) {
    const px = resolveSize(size);
    const filterId = useId().replace(/:/g, "") + "-gooey";

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-gooey-loader", className)}
        style={{
          ...style,
          ["--nova-gooey-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <svg
          className="nova-gooey-loader__svg"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
          <g filter={`url(#${filterId})`} fill="currentColor">
            <circle className="nova-gooey-loader__blob nova-gooey-loader__blob--a" cx="50" cy="50" r="11" />
            <circle className="nova-gooey-loader__blob nova-gooey-loader__blob--b" cx="50" cy="50" r="11" />
            <circle className="nova-gooey-loader__blob nova-gooey-loader__blob--c" cx="50" cy="50" r="9" />
          </g>
        </svg>
      </span>
    );
  }
);
