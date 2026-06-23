import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BlobLoader.css";

export type BlobLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BlobLoaderSize = "sm" | "md" | "lg" | number;

export interface BlobLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: BlobLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: BlobLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<BlobLoaderSize, number>, number> = {
  sm: 32,
  md: 48,
  lg: 68,
};

function resolveSize(size: BlobLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const BlobLoader = forwardRef<HTMLSpanElement, BlobLoaderProps>(
  function BlobLoader(
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
        className={cn("nova-blob-loader", className)}
        style={{
          ...style,
          ["--nova-blob-size" as string]: `${px}px`,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-blob-loader__blob" aria-hidden="true" />
      </span>
    );
  }
);
