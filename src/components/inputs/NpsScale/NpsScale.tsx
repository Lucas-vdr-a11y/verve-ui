import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./NpsScale.css";

export interface NpsScaleProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled value (0–10), or `null` for none selected. */
  value?: number | null;
  /** Fired with the selected score 0–10. */
  onChange?: (value: number) => void;
  /** Accessible group label. Defaults to a question prompt. */
  label?: string;
  /** Label under the low end. Defaults to `"Not likely"`. */
  lowLabel?: string;
  /** Label under the high end. Defaults to `"Very likely"`. */
  highLabel?: string;
  /** Disables interaction. */
  disabled?: boolean;
  /** Disable detractor/passive/promoter coloring. */
  monochrome?: boolean;
}

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function zoneFor(score: number): "detractor" | "passive" | "promoter" {
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

export const NpsScale = forwardRef<HTMLDivElement, NpsScaleProps>(
  function NpsScale(
    {
      value,
      onChange,
      label = "How likely are you to recommend us?",
      lowLabel = "Not likely",
      highLabel = "Very likely",
      disabled = false,
      monochrome = false,
      className,
      ...rest
    },
    ref
  ) {
    const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const select = (score: number) => {
      if (disabled) return;
      onChange?.(score);
    };

    const focusAndSelect = (index: number) => {
      const clamped = Math.min(SCORES.length - 1, Math.max(0, index));
      const btn = btnRefs.current[clamped];
      btn?.focus();
      select(SCORES[clamped]);
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      index: number
    ) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          focusAndSelect(index + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          focusAndSelect(index - 1);
          break;
        case "Home":
          e.preventDefault();
          focusAndSelect(0);
          break;
        case "End":
          e.preventDefault();
          focusAndSelect(SCORES.length - 1);
          break;
        default:
          break;
      }
    };

    // Roving tabindex: focus the selected button, else the first.
    const focusIndex =
      value != null ? SCORES.indexOf(value as (typeof SCORES)[number]) : 0;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-nps",
          disabled && "nova-nps--disabled",
          monochrome && "nova-nps--monochrome",
          className
        )}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <div className="nova-nps__scale">
          {SCORES.map((score, i) => {
            const selected = value === score;
            return (
              <button
                key={score}
                ref={(node) => {
                  btnRefs.current[i] = node;
                }}
                type="button"
                className={cn(
                  "nova-nps__btn",
                  "nova-focusable",
                  `nova-nps__btn--${zoneFor(score)}`,
                  selected && "nova-nps__btn--selected"
                )}
                role="radio"
                aria-checked={selected}
                aria-label={String(score)}
                tabIndex={i === (focusIndex < 0 ? 0 : focusIndex) ? 0 : -1}
                disabled={disabled}
                onClick={() => select(score)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {score}
              </button>
            );
          })}
        </div>
        <div className="nova-nps__endpoints" aria-hidden="true">
          <span className="nova-nps__endpoint">{lowLabel}</span>
          <span className="nova-nps__endpoint">{highLabel}</span>
        </div>
      </div>
    );
  }
);
