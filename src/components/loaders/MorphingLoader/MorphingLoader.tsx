import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MorphingLoader.css";

export type MorphingLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type MorphingLoaderSize = "sm" | "md" | "lg" | number;

export interface MorphingLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: MorphingLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: MorphingLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<MorphingLoaderSize, number>, number> = {
  sm: 24,
  md: 36,
  lg: 52,
};

function resolveSize(size: MorphingLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const MorphingLoader = forwardRef<HTMLSpanElement, MorphingLoaderProps>(
  function MorphingLoader(
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
        className={cn("nova-morphing-loader", className)}
        style={{
          ...style,
          ["--nova-morph-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-morphing-loader__shape" aria-hidden="true" />
      </span>
    );
  }
);
