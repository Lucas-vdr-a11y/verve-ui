import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./CometLoader.css";

export type CometLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type CometLoaderSize = "sm" | "md" | "lg" | number;

export interface CometLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: CometLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: CometLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<CometLoaderSize, number>, number> = {
  sm: 32,
  md: 48,
  lg: 68,
};

function resolveSize(size: CometLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const CometLoader = forwardRef<HTMLSpanElement, CometLoaderProps>(
  function CometLoader(
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
        className={cn("nova-comet-loader", className)}
        style={{
          ...style,
          ["--nova-comet-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-comet-loader__orbit" aria-hidden="true">
          <span className="nova-comet-loader__comet">
            <span className="nova-comet-loader__tail" />
            <span className="nova-comet-loader__head" />
          </span>
        </span>
      </span>
    );
  }
);
