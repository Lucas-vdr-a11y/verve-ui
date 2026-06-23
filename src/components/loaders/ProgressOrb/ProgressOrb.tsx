import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProgressOrb.css";

export type ProgressOrbTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ProgressOrbSize = "sm" | "md" | "lg" | number;

export interface ProgressOrbProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Current progress value. Defaults to `0`. */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Size on the sm/md/lg scale, or an explicit pixel number. Defaults to `"md"`. */
  size?: ProgressOrbSize;
  /** Semantic color tone. Defaults to `"primary"`. */
  tone?: ProgressOrbTone;
  /** Explicit CSS color override (wins over `tone`). */
  color?: string;
  /** Show the numeric percentage inside the orb. Defaults to `false`. */
  showValue?: boolean;
  /** Accessible label announced to assistive tech. Defaults to `"Loading"`. */
  label?: string;
}

const SIZE_PX: Record<Exclude<ProgressOrbSize, number>, number> = {
  sm: 40,
  md: 64,
  lg: 96,
};

function resolveSize(size: ProgressOrbSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export const ProgressOrb = forwardRef<HTMLSpanElement, ProgressOrbProps>(
  function ProgressOrb(
    {
      value = 0,
      max = 100,
      size = "md",
      tone = "primary",
      color,
      showValue = false,
      label = "Loading",
      className,
      style,
      ...rest
    },
    ref
  ) {
    const px = resolveSize(size);
    const safeMax = max <= 0 ? 100 : max;
    const ratio = clamp(value / safeMax, 0, 1);
    const pct = Math.round(ratio * 100);

    return (
      <span
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-busy={ratio < 1}
        className={cn("nova-progress-orb", className)}
        style={{
          ...style,
          ["--nova-orb-size" as string]: `${px}px`,
          ["--nova-orb-fill" as string]: ratio,
          ...(color ? { ["--nova-loader-color" as string]: color } : null),
        }}
        data-tone={tone}
        {...rest}
      >
        <span className="nova-progress-orb__shell" aria-hidden="true">
          <span className="nova-progress-orb__liquid" />
        </span>
        {showValue && (
          <span className="nova-progress-orb__value" aria-hidden="true">
            {pct}%
          </span>
        )}
      </span>
    );
  }
);
