import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./AiThinkingLoader.css";

export type AiThinkingLoaderTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type AiThinkingLoaderSize = "sm" | "md" | "lg" | number;

export interface AiThinkingLoaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Size on the sm/md/lg scale, or an explicit pixel height. Defaults to `"md"`. */
  size?: AiThinkingLoaderSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: AiThinkingLoaderTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Optional caption shown next to the drifting dots. */
  label?: string;
  /** Number of drifting dots. Defaults to `3`. */
  dots?: number;
  /** Accessible label announced to assistive tech. Defaults to `"Assistant is thinking"`. */
  ariaLabel?: string;
}

const SIZE_PX: Record<Exclude<AiThinkingLoaderSize, number>, number> = {
  sm: 20,
  md: 28,
  lg: 36,
};

function resolveSize(size: AiThinkingLoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

export const AiThinkingLoader = forwardRef<
  HTMLSpanElement,
  AiThinkingLoaderProps
>(function AiThinkingLoader(
  {
    size = "md",
    tone = "primary",
    color,
    label,
    dots = 3,
    ariaLabel = "Assistant is thinking",
    className,
    style,
    ...rest
  },
  ref
) {
  const px = resolveSize(size);
  const count = Math.max(1, Math.min(dots, 5));

  return (
    <span
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className={cn("nova-ai-thinking", className)}
      style={{
        ...style,
        ["--nova-ait-size" as string]: `${px}px`,
        ...(color ? { ["--nova-loader-color" as string]: color } : null),
      }}
      data-tone={tone}
      {...rest}
    >
      <span className="nova-ai-thinking__pill" aria-hidden="true">
        <span className="nova-ai-thinking__sweep" />
        <span className="nova-ai-thinking__dots">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="nova-ai-thinking__dot"
              style={{ ["--nova-ait-i" as string]: i }}
            />
          ))}
        </span>
      </span>
      {label ? <span className="nova-ai-thinking__label">{label}</span> : null}
    </span>
  );
});
