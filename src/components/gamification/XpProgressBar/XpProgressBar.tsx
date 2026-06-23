import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./XpProgressBar.css";

export type XpTone = "brand" | "success" | "warning" | "danger" | "info";

export interface XpProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Current level number. */
  level: number;
  /** XP accumulated toward the next level. */
  xp: number;
  /** XP required to reach the next level. */
  xpToNext: number;
  /** Gradient tone of the fill. Defaults to `"brand"`. */
  tone?: XpTone;
  /** Show the `xp / xpToNext` numeric readout. Defaults to `true`. */
  showValue?: boolean;
  /** Label rendered before the level chip. Defaults to `"Level"`. */
  levelLabel?: string;
  /** Size of the bar. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const XpProgressBar = forwardRef<HTMLDivElement, XpProgressBarProps>(
  function XpProgressBar(
    {
      level,
      xp,
      xpToNext,
      tone = "brand",
      showValue = true,
      levelLabel = "Level",
      size = "md",
      className,
      ...rest
    },
    ref
  ) {
    const safeMax = Math.max(xpToNext, 1);
    const pct = Math.min(Math.max(xp / safeMax, 0), 1) * 100;

    const [flash, setFlash] = useState(false);
    const prevLevel = useRef(level);

    useEffect(() => {
      if (level === prevLevel.current) return;
      const leveledUp = level > prevLevel.current;
      prevLevel.current = level;
      if (!leveledUp || prefersReducedMotion()) return;

      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 700);
      return () => window.clearTimeout(id);
    }, [level]);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-xp-bar",
          `nova-xp-bar--${tone}`,
          `nova-xp-bar--${size}`,
          flash && "nova-xp-bar--flash",
          className
        )}
        {...rest}
      >
        <div className="nova-xp-bar__head">
          <span className="nova-xp-bar__level">
            <span className="nova-xp-bar__level-label">{levelLabel}</span>
            <span className="nova-xp-bar__level-num">{level}</span>
          </span>
          {showValue && (
            <span className="nova-xp-bar__value">
              {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
            </span>
          )}
        </div>
        <div
          className="nova-xp-bar__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={xpToNext}
          aria-valuenow={Math.min(xp, xpToNext)}
          aria-label={`${levelLabel} ${level} experience`}
        >
          <div
            className="nova-xp-bar__fill"
            style={{ width: `${pct}%` }}
          >
            <span className="nova-xp-bar__sheen" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }
);
