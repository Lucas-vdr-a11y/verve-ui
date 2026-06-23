import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./FlipBoxLoader.css";

export type FlipBoxLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type FlipBoxLoaderSize = "sm" | "md" | "lg" | number;

export interface FlipBoxLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel box size. Defaults to `"md"`. */
  size?: FlipBoxLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: FlipBoxLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<FlipBoxLoaderSize, number>, number> = {
  sm: 18,
  md: 26,
  lg: 38,
};

function resolveSize(size: FlipBoxLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const FlipBoxLoader = forwardRef<HTMLSpanElement, FlipBoxLoaderProps>(
  function FlipBoxLoader(
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
        className={cn("nova-flip-box", className)}
        style={{
          ...style,
          ["--nova-flip-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-flip-box__cube" aria-hidden="true" />
      </span>
    );
  }
);
