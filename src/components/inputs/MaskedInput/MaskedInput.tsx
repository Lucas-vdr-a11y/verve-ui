import { forwardRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "../Input/Input.css";
import "./MaskedInput.css";

export type MaskedInputSize = "sm" | "md" | "lg";

export interface MaskedInputChange {
  /** The display value including mask literals (e.g. "(123) 456-7890"). */
  formatted: string;
  /** Only the user-entered characters that filled placeholders. */
  raw: string;
}

export interface MaskedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "value" | "defaultValue"
  > {
  /**
   * Mask pattern. Tokens are filled by user input; any other char is a literal:
   * `#` = digit, `A` = letter, `*` = alphanumeric.
   */
  mask: string;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: MaskedInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Content rendered inside the field, before the input. */
  leftAddon?: React.ReactNode;
  /** Content rendered inside the field, after the input. */
  rightAddon?: React.ReactNode;
  /** Controlled raw value (the unformatted characters). */
  value?: string;
  /** Uncontrolled initial raw value. */
  defaultValue?: string;
  /** Called with both the formatted display value and the raw characters. */
  onChange?: (change: MaskedInputChange) => void;
}

const TOKENS: Record<string, (ch: string) => boolean> = {
  "#": (ch) => /[0-9]/.test(ch),
  A: (ch) => /[A-Za-z]/.test(ch),
  "*": (ch) => /[A-Za-z0-9]/.test(ch),
};

function isToken(ch: string): boolean {
  return ch in TOKENS;
}

/**
 * Apply a mask to an input string, returning the formatted display value and
 * the raw (unformatted) characters that filled the token slots.
 *
 * The input is sanitized first: any character that can never satisfy an
 * upcoming token (including the mask's own literals the user may have typed or
 * that came from a previously-formatted value) is dropped, so re-feeding a
 * formatted value is idempotent.
 */
export function applyMask(mask: string, input: string): MaskedInputChange {
  // 1. Collect the token validators in mask order.
  const tokenChars = mask.split("").filter(isToken);

  // 2. Walk the input, keeping only characters that satisfy the *next*
  //    unfilled token. This naturally strips literals and invalid chars.
  const accepted: string[] = [];
  let tokenIdx = 0;
  for (const ch of input) {
    if (tokenIdx >= tokenChars.length) break;
    const maskCh = tokenChars[tokenIdx]!;
    if (TOKENS[maskCh]!(ch)) {
      accepted.push(ch);
      tokenIdx++;
    }
  }
  const raw = accepted.join("");

  // 3. Emit the formatted string: walk the mask, dropping in accepted chars
  //    for tokens and literals in between. Stop after the last filled token so
  //    no dangling trailing literals appear.
  let formatted = "";
  let acceptIdx = 0;
  for (let i = 0; i < mask.length && acceptIdx < accepted.length; i++) {
    const maskCh = mask[i]!;
    if (isToken(maskCh)) {
      formatted += accepted[acceptIdx++];
    } else {
      formatted += maskCh;
    }
  }

  return { formatted, raw };
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(
    {
      mask,
      size = "md",
      invalid = false,
      leftAddon,
      rightAddon,
      disabled,
      className,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internalRaw, setInternalRaw] = useState<string>(defaultValue ?? "");
    const raw = isControlled ? value : internalRaw;
    const { formatted } = applyMask(mask, raw ?? "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const result = applyMask(mask, e.target.value);
      if (!isControlled) setInternalRaw(result.raw);
      onChange?.(result);
    };

    return (
      <div
        className={cn(
          "nova-input",
          "nova-masked",
          `nova-input--${size}`,
          invalid && "nova-input--invalid",
          disabled && "nova-input--disabled",
          className
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
          type="text"
          inputMode={/^#+$/.test(mask.replace(/[^#A*]/g, "")) ? "numeric" : "text"}
          className="nova-input__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={formatted}
          onChange={handleChange}
          placeholder={mask}
          {...rest}
        />
        {rightAddon != null && (
          <span className="nova-input__addon nova-input__addon--right">
            {rightAddon}
          </span>
        )}
      </div>
    );
  }
);
