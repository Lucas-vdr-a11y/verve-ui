import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./LikertScale.css";

export interface LikertOption {
  /** Stable value reported via onChange. */
  value: string | number;
  /** Visible label for this point. */
  label: string;
}

export interface LikertScaleProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** The scale points, low → high. */
  options?: LikertOption[];
  /** Controlled selected value. */
  value?: string | number | null;
  /** Fired with the chosen option value. */
  onChange?: (value: string | number) => void;
  /** Accessible group label. */
  label?: string;
  /** Disables interaction. */
  disabled?: boolean;
}

const DEFAULT_OPTIONS: LikertOption[] = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export const LikertScale = forwardRef<HTMLDivElement, LikertScaleProps>(
  function LikertScale(
    {
      options = DEFAULT_OPTIONS,
      value = null,
      onChange,
      label = "Rate your agreement",
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const select = (val: string | number) => {
      if (disabled) return;
      onChange?.(val);
    };

    const focusAndSelect = (index: number) => {
      const clamped = Math.min(options.length - 1, Math.max(0, index));
      const opt = options[clamped];
      btnRefs.current[clamped]?.focus();
      if (opt) select(opt.value);
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
          focusAndSelect(options.length - 1);
          break;
        default:
          break;
      }
    };

    const selectedIndex = options.findIndex((o) => o.value === value);
    const focusIndex = selectedIndex < 0 ? 0 : selectedIndex;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-likert",
          disabled && "nova-likert--disabled",
          className
        )}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {options.map((opt, i) => {
          const selected = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              ref={(node) => {
                btnRefs.current[i] = node;
              }}
              type="button"
              className={cn(
                "nova-likert__option",
                "nova-focusable",
                selected && "nova-likert__option--selected"
              )}
              role="radio"
              aria-checked={selected}
              tabIndex={i === focusIndex ? 0 : -1}
              disabled={disabled}
              onClick={() => select(opt.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className="nova-likert__dot" aria-hidden="true" />
              <span className="nova-likert__label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
