import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./PinInput.css";

export type PinInputSize = "sm" | "md" | "lg";

export interface PinInputProps {
  /** Number of segments. Defaults to `6`. */
  length?: number;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: PinInputSize;
  /** Controlled value. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  /** Fired with the full string on every change. */
  onChange?: (value: string) => void;
  /** Fired once when every segment is filled. */
  onComplete?: (value: string) => void;
  /** Restrict allowed characters. Defaults to `"numeric"`. */
  type?: "numeric" | "alphanumeric";
  /** Mask entered characters (like a password). */
  mask?: boolean;
  /** Placeholder character per empty segment. */
  placeholder?: string;
  /** Marks the control as invalid. */
  invalid?: boolean;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Auto-focus the first segment on mount. */
  autoFocus?: boolean;
  /** Accessible label for the group. */
  "aria-label"?: string;
  /** id of an element describing the group. */
  "aria-describedby"?: string;
  className?: string;
  /** Shared name; segments get `name-0`, `name-1`, … for form autofill. */
  name?: string;
}

export interface PinInputRef {
  /** Focus the first empty (or last) segment. */
  focus: () => void;
  /** Clear all segments. */
  clear: () => void;
}

const NUMERIC = /^[0-9]$/;
const ALPHANUMERIC = /^[a-zA-Z0-9]$/;

export const PinInput = forwardRef<PinInputRef, PinInputProps>(function PinInput(
  {
    length = 6,
    size = "md",
    value,
    defaultValue = "",
    onChange,
    onComplete,
    type = "numeric",
    mask = false,
    placeholder,
    invalid = false,
    disabled = false,
    autoFocus = false,
    className,
    name,
    ...aria
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(defaultValue.slice(0, length));
  const raw = isControlled ? (value as string) : internal;
  const chars = useMemo(() => {
    const arr = raw.slice(0, length).split("");
    while (arr.length < length) arr.push("");
    return arr;
  }, [raw, length]);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const allowed = type === "numeric" ? NUMERIC : ALPHANUMERIC;

  const completedRef = useRef(false);

  const emit = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
      if (next.length === length && !next.includes(" ") && next.split("").every(Boolean)) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.(next);
        }
      } else {
        completedRef.current = false;
      }
    },
    [isControlled, onChange, onComplete, length]
  );

  const focusIndex = useCallback((i: number) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const setCharAt = useCallback(
    (i: number, ch: string) => {
      const arr = [...chars];
      arr[i] = ch;
      emit(arr.join(""));
    },
    [chars, emit]
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        const firstEmpty = chars.findIndex((c) => !c);
        focusIndex(firstEmpty === -1 ? length - 1 : firstEmpty);
      },
      clear: () => emit(""),
    }),
    [chars, focusIndex, length, emit]
  );

  const handleChange = useCallback(
    (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Take the last typed char (handles overwriting a filled box).
      const ch = input.slice(-1);
      if (ch === "") {
        setCharAt(i, "");
        return;
      }
      if (!allowed.test(ch)) return;
      setCharAt(i, ch);
      if (i < length - 1) focusIndex(i + 1);
    },
    [allowed, setCharAt, focusIndex, length]
  );

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Backspace": {
          e.preventDefault();
          if (chars[i]) {
            setCharAt(i, "");
          } else if (i > 0) {
            const arr = [...chars];
            arr[i - 1] = "";
            emit(arr.join(""));
            focusIndex(i - 1);
          }
          break;
        }
        case "Delete": {
          e.preventDefault();
          setCharAt(i, "");
          break;
        }
        case "ArrowLeft":
          e.preventDefault();
          if (i > 0) focusIndex(i - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (i < length - 1) focusIndex(i + 1);
          break;
        case "Home":
          e.preventDefault();
          focusIndex(0);
          break;
        case "End":
          e.preventDefault();
          focusIndex(length - 1);
          break;
      }
    },
    [chars, setCharAt, emit, focusIndex, length]
  );

  const handlePaste = useCallback(
    (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .split("")
        .filter((c) => allowed.test(c));
      if (pasted.length === 0) return;
      const arr = [...chars];
      let cursor = i;
      for (const c of pasted) {
        if (cursor >= length) break;
        arr[cursor] = c;
        cursor++;
      }
      emit(arr.join(""));
      focusIndex(Math.min(cursor, length - 1));
    },
    [allowed, chars, emit, focusIndex, length]
  );

  return (
    <div
      className={cn(
        "nova-pin",
        `nova-pin--${size}`,
        invalid && "nova-pin--invalid",
        disabled && "nova-pin--disabled",
        className
      )}
      role="group"
      aria-label={aria["aria-label"] ?? "Verification code"}
      aria-describedby={aria["aria-describedby"]}
      data-disabled={disabled || undefined}
    >
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          className="nova-pin__field nova-focusable"
          type={mask ? "password" : "text"}
          inputMode={type === "numeric" ? "numeric" : "text"}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          name={name ? `${name}-${i}` : undefined}
          value={c}
          placeholder={placeholder}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
});
