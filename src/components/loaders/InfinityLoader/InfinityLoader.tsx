import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./InfinityLoader.css";

export type InfinityLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type InfinityLoaderSize = "sm" | "md" | "lg" | number;

export interface InfinityLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Width on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: InfinityLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: InfinityLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<InfinityLoaderSize, number>, number> = {
  sm: 48,
  md: 72,
  lg: 104,
};

function resolveSize(size: InfinityLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

/** Lemniscate of Gerono scaled into the 0..100 / 0..50 viewBox. */
const INFINITY_PATH =
  "M20,25 C20,12 35,12 50,25 C65,38 80,38 80,25 C80,12 65,12 50,25 C35,38 20,38 20,25 Z";

export const InfinityLoader = forwardRef<HTMLSpanElement, InfinityLoaderProps>(
  function InfinityLoader(
    { size = "md", tone = "primary", color, label = "Loading", className, style, ...rest },
    ref
  ) {
    const px = resolveSize(size);

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-infinity-loader", className)}
        style={{
          ...style,
          ["--nova-inf-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <svg
          className="nova-infinity-loader__svg"
          viewBox="0 0 100 50"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="nova-infinity-loader__track"
            d={INFINITY_PATH}
            fill="none"
            strokeWidth="4"
          />
          <path
            className="nova-infinity-loader__trace"
            d={INFINITY_PATH}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
);
