import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./SquareLoader.css";

export type SquareLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type SquareLoaderSize = "sm" | "md" | "lg" | number;

export interface SquareLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel box size. Defaults to `"md"`. */
  size?: SquareLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: SquareLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<SquareLoaderSize, number>, number> = {
  sm: 28,
  md: 40,
  lg: 56,
};

function resolveSize(size: SquareLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const SquareLoader = forwardRef<HTMLSpanElement, SquareLoaderProps>(
  function SquareLoader(
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
        className={cn("nova-square-loader", className)}
        style={{
          ...style,
          ["--nova-sq-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-square-loader__cube nova-square-loader__cube--1" aria-hidden="true" />
        <span className="nova-square-loader__cube nova-square-loader__cube--2" aria-hidden="true" />
        <span className="nova-square-loader__cube nova-square-loader__cube--4" aria-hidden="true" />
        <span className="nova-square-loader__cube nova-square-loader__cube--3" aria-hidden="true" />
      </span>
    );
  }
);
