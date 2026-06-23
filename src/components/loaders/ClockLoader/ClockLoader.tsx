import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ClockLoader.css";

export type ClockLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ClockLoaderSize = "sm" | "md" | "lg" | number;

export interface ClockLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel diameter. Defaults to `"md"`. */
  size?: ClockLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: ClockLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<ClockLoaderSize, number>, number> = {
  sm: 28,
  md: 44,
  lg: 64,
};

function resolveSize(size: ClockLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const ClockLoader = forwardRef<HTMLSpanElement, ClockLoaderProps>(
  function ClockLoader(
    {
      size = "md",
      tone = "primary",
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
        className={cn("nova-clock-loader", className)}
        style={{
          ...style,
          ["--nova-clock-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-clock-loader__face" aria-hidden="true">
          <span className="nova-clock-loader__hand nova-clock-loader__hand--hour" />
          <span className="nova-clock-loader__hand nova-clock-loader__hand--minute" />
          <span className="nova-clock-loader__pivot" />
        </span>
      </span>
    );
  }
);
