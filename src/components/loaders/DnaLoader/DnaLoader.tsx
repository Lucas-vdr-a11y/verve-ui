import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./DnaLoader.css";

export type DnaLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type DnaLoaderSize = "sm" | "md" | "lg" | number;

export interface DnaLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Height on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: DnaLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: DnaLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Number of rungs in the helix. Defaults to `10`. */
  rungs?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<DnaLoaderSize, number>, number> = {
  sm: 36,
  md: 52,
  lg: 72,
};

function resolveSize(size: DnaLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const DnaLoader = forwardRef<HTMLSpanElement, DnaLoaderProps>(
  function DnaLoader(
    {
      size = "md",
      tone = "primary",
      color,
      rungs = 10,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const count = Math.max(4, Math.min(rungs, 16));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn("nova-dna-loader", className)}
        style={{
          ...style,
          ["--nova-dna-size" as string]: `${px}px`,
          ["--nova-dna-count" as string]: count,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="nova-dna-loader__rung"
            aria-hidden="true"
            style={{ ["--nova-dna-i" as string]: i }}
          >
            <span className="nova-dna-loader__dot nova-dna-loader__dot--top" />
            <span className="nova-dna-loader__dot nova-dna-loader__dot--bottom" />
          </span>
        ))}
      </span>
    );
  }
);
