import { forwardRef, useId, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "../Input/Input.css";
import "./PasswordInput.css";

export type PasswordInputSize = "sm" | "md" | "lg";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  /** Categorical strength bucket. */
  level: PasswordStrength;
  /** Normalized score from 0 (empty) to 4 (strong). */
  score: number;
}

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: PasswordInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Content rendered inside the field, before the input. */
  leftAddon?: React.ReactNode;
  /** Show the weak/fair/good/strong strength meter below the field. */
  showStrength?: boolean;
  /** Controls the initial visibility of the value (uncontrolled toggle). */
  defaultVisible?: boolean;
  /** Accessible label for the show/hide toggle button. Defaults provided. */
  toggleLabel?: { show: string; hide: string };
}

const STRENGTH_LABEL: Record<PasswordStrength, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

/** Compute strength from length + character-class variety. */
export function computePasswordStrength(value: string): PasswordStrengthResult {
  if (!value) return { level: "weak", score: 0 };

  let variety = 0;
  if (/[a-z]/.test(value)) variety++;
  if (/[A-Z]/.test(value)) variety++;
  if (/[0-9]/.test(value)) variety++;
  if (/[^A-Za-z0-9]/.test(value)) variety++;

  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (variety >= 2) score++;
  if (variety >= 3 && value.length >= 8) score++;

  // Very short passwords can never read as strong.
  if (value.length < 6) score = Math.min(score, 1);

  const level: PasswordStrength =
    score <= 1 ? "weak" : score === 2 ? "fair" : score === 3 ? "good" : "strong";
  return { level, score };
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.9M9.9 5.7A9.7 9.7 0 0 1 12 5.5c6.5 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.5M6.3 6.4A16 16 0 0 0 2.5 12S5.5 18.5 12 18.5a9.4 9.4 0 0 0 3-.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      size = "md",
      invalid = false,
      leftAddon,
      showStrength = false,
      defaultVisible = false,
      toggleLabel = { show: "Show password", hide: "Hide password" },
      disabled,
      className,
      value,
      defaultValue,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref
  ) {
    const [visible, setVisible] = useState(defaultVisible);
    const meterId = useId();

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(
      defaultValue != null ? String(defaultValue) : ""
    );
    const current = isControlled ? String(value ?? "") : internal;

    const strength = useMemo(
      () => (showStrength ? computePasswordStrength(current) : null),
      [showStrength, current]
    );

    const describedBy =
      [ariaDescribedBy, showStrength ? meterId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternal(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn("nova-password", className)}>
        <div
          className={cn(
            "nova-input",
            "nova-password__box",
            `nova-input--${size}`,
            invalid && "nova-input--invalid",
            disabled && "nova-input--disabled"
          )}
          data-disabled={disabled || undefined}
        >
          {leftAddon != null && (
            <span className="nova-input__addon nova-input__addon--left">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            className="nova-input__field nova-focusable"
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            value={isControlled ? value : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            onChange={handleChange}
            {...rest}
          />
          <button
            type="button"
            className="nova-password__toggle nova-focusable"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-pressed={visible}
            aria-label={visible ? toggleLabel.hide : toggleLabel.show}
            tabIndex={disabled ? -1 : 0}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {showStrength && strength && (
          <div
            className="nova-password__strength"
            id={meterId}
            data-level={strength.level}
          >
            <div
              className="nova-password__meter"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={strength.score}
              aria-label="Password strength"
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "nova-password__bar",
                    i < strength.score && "nova-password__bar--on"
                  )}
                />
              ))}
            </div>
            <span className="nova-password__strength-label" aria-hidden="true">
              {STRENGTH_LABEL[strength.level]}
            </span>
          </div>
        )}
      </div>
    );
  }
);
