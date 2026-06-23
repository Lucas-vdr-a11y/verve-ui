import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./PostalCodeInput.css";

export type PostalCodeInputSize = "sm" | "md" | "lg";

export interface PostalCodeChange {
  /** The current value, lightly normalized (uppercased where appropriate). */
  value: string;
  /** Whether the value matches the country's expected pattern. */
  valid: boolean;
}

export interface PostalRule {
  /** Validation pattern for the country. */
  pattern: RegExp;
  /** A human-friendly example, shown as a placeholder hint. */
  example: string;
  /** Whether to uppercase input (true for alphanumeric postal systems). */
  uppercase: boolean;
}

export interface PostalCodeInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: PostalCodeInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** ISO 3166-1 alpha-2 country code to drive format hints/validation. */
  country?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the value and a validity flag. */
  onChange?: (change: PostalCodeChange) => void;
}

/** Light per-country postal rules. Unlisted countries accept any non-empty value. */
export const POSTAL_RULES: Record<string, PostalRule> = {
  US: { pattern: /^\d{5}(-\d{4})?$/, example: "94103", uppercase: false },
  CA: {
    pattern: /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/,
    example: "K1A 0B1",
    uppercase: true,
  },
  GB: {
    pattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?[ ]?\d[A-Za-z]{2}$/,
    example: "SW1A 1AA",
    uppercase: true,
  },
  NL: {
    pattern: /^\d{4}[ ]?[A-Za-z]{2}$/,
    example: "1011 AB",
    uppercase: true,
  },
  DE: { pattern: /^\d{5}$/, example: "10115", uppercase: false },
  FR: { pattern: /^\d{5}$/, example: "75001", uppercase: false },
  IT: { pattern: /^\d{5}$/, example: "00100", uppercase: false },
  ES: { pattern: /^\d{5}$/, example: "28001", uppercase: false },
  AU: { pattern: /^\d{4}$/, example: "2000", uppercase: false },
  JP: { pattern: /^\d{3}-?\d{4}$/, example: "100-0001", uppercase: false },
  BR: { pattern: /^\d{5}-?\d{3}$/, example: "01310-100", uppercase: false },
  IN: { pattern: /^\d{6}$/, example: "110001", uppercase: false },
};

/** Generic fallback: any non-empty trimmed value is acceptable. */
const FALLBACK: PostalRule = {
  pattern: /^.{2,}$/,
  example: "Postal code",
  uppercase: false,
};

export function postalRuleFor(country?: string): PostalRule {
  if (!country) return FALLBACK;
  return POSTAL_RULES[country.toUpperCase()] ?? FALLBACK;
}

export function validatePostal(value: string, country?: string): boolean {
  const rule = postalRuleFor(country);
  return rule.pattern.test(value.trim());
}

export const PostalCodeInput = forwardRef<
  HTMLInputElement,
  PostalCodeInputProps
>(function PostalCodeInput(
  {
    size = "md",
    invalid = false,
    country,
    value,
    defaultValue,
    onChange,
    disabled,
    className,
    placeholder,
    ...rest
  },
  ref
) {
  const rule = postalRuleFor(country);
  const normalize = (s: string) => (rule.uppercase ? s.toUpperCase() : s);

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(() =>
    normalize(defaultValue ?? "")
  );
  const raw = isControlled ? normalize(value) : internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = normalize(e.target.value);
    if (!isControlled) setInternal(next);
    onChange?.({ value: next, valid: validatePostal(next, country) });
  };

  return (
    <div
      className={cn(
        "nova-postal",
        `nova-postal--${size}`,
        invalid && "nova-postal--invalid",
        disabled && "nova-postal--disabled",
        className
      )}
      data-disabled={disabled || undefined}
    >
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode={rule.uppercase ? "text" : "numeric"}
        autoComplete="postal-code"
        className="nova-postal__field nova-focusable"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={raw}
        onChange={handleChange}
        placeholder={placeholder ?? rule.example}
      />
    </div>
  );
});
