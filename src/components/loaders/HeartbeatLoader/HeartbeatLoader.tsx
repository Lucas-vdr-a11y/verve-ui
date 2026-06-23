import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./HeartbeatLoader.css";

export type HeartbeatLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type HeartbeatLoaderSize = "sm" | "md" | "lg" | number;

export interface HeartbeatLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel width. Defaults to `"md"`. */
  size?: HeartbeatLoaderSize;
  /** Semantic color tone. Defaults to `"danger"`. */
  tone?: HeartbeatLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<HeartbeatLoaderSize, number>, number> = {
  sm: 64,
  md: 96,
  lg: 140,
};

function resolveSize(size: HeartbeatLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

/** ECG path drawn across a 100x40 viewBox: flat line with a single QRS spike. */
const ECG_PATH =
  "M0 20 H30 L36 20 L42 8 L48 32 L54 14 L60 20 H72 L78 20 L82 24 L86 20 H100";

export const HeartbeatLoader = forwardRef<
  HTMLSpanElement,
  HeartbeatLoaderProps
>(function HeartbeatLoader(
  {
    size = "md",
    tone = "danger",
    color,
    label = "Loading",
    className,
    style,
    ...rest
  },
  ref
) {
  const px = resolveSize(size);

  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn("nova-heartbeat-loader", className)}
      style={{
        ...style,
        ["--nova-hb-width" as string]: `${px}px`,
        ...(color ? { ["--nova-loader-color" as string]: color } : null),
      }}
      data-tone={tone}
      {...rest}
    >
      <svg
        className="nova-heartbeat-loader__svg"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="nova-heartbeat-loader__base" d={ECG_PATH} />
        <path className="nova-heartbeat-loader__trace" d={ECG_PATH} />
      </svg>
    </span>
  );
});
