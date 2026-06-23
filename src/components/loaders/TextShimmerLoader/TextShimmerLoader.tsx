import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TextShimmerLoader.css";

export type TextShimmerLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type TextShimmerLoaderSize = "sm" | "md" | "lg" | number;

export interface TextShimmerLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Word(s) to shimmer. Defaults to `"Loading…"`. */
  text?: string;
  /** Size on the sm/md/lg scale, or an explicit pixel font-size. Defaults to `"md"`. */
  size?: TextShimmerLoaderSize;
  /** Semantic color tone for the shimmer highlight. Defaults to `"primary"`. */
  tone?: TextShimmerLoaderTone;
  /** Explicit CSS color override for the highlight (wins over `tone`). */
  color?: string;
  /** Accessible label announced to assistive tech. Defaults to the `text`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<TextShimmerLoaderSize, number>, number> = {
  sm: 14,
  md: 18,
  lg: 24,
};

function resolveSize(size: TextShimmerLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const TextShimmerLoader = forwardRef<
  HTMLSpanElement,
  TextShimmerLoaderProps
>(function TextShimmerLoader(
  {
    text = "Loading…",
    size = "md",
    tone = "primary",
    color,
    label,
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
      aria-label={label ?? text}
      aria-busy="true"
      className={cn("nova-text-shimmer", className)}
      style={{
        ...style,
        ["--nova-shimmer-size" as string]: `${px}px`,
        ...(color ? { ["--nova-loader-color" as string]: color } : null),
      }}
      data-tone={tone}
      {...rest}
    >
      <span className="nova-text-shimmer__text" aria-hidden="true">
        {text}
      </span>
    </span>
  );
});
