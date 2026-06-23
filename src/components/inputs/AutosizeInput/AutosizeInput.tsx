import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./AutosizeInput.css";

export type AutosizeInputSize = "sm" | "md" | "lg";

export interface AutosizeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: AutosizeInputSize;
  /** Marks the field as invalid; wires `aria-invalid`. */
  invalid?: boolean;
  /** Minimum width in CSS units. Defaults to `"1rem"`. */
  minWidth?: string;
  /** Extra width (px) added to the measured content. Defaults to `2`. */
  extraWidth?: number;
}

// SSR-safe layout effect — falls back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const AutosizeInput = forwardRef<HTMLInputElement, AutosizeInputProps>(
  function AutosizeInput(
    {
      size = "md",
      invalid = false,
      minWidth = "1rem",
      extraWidth = 2,
      value,
      defaultValue,
      placeholder,
      className,
      style,
      disabled,
      onChange,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const mirrorRef = useRef<HTMLSpanElement | null>(null);
    const [width, setWidth] = useState<number>(0);

    // Track value for uncontrolled usage so the mirror updates.
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(
      defaultValue != null ? String(defaultValue) : ""
    );
    const current = isControlled ? String(value ?? "") : internal;

    const measure = () => {
      const mirror = mirrorRef.current;
      if (!mirror) return;
      // measure the value, or the placeholder when empty
      mirror.textContent = current.length > 0 ? current : placeholder ?? "";
      const next = Math.ceil(mirror.scrollWidth) + extraWidth;
      setWidth(next);
    };

    useIsoLayoutEffect(() => {
      measure();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, placeholder, size]);

    const setRef = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <span
        className={cn(
          "nova-autosize",
          `nova-autosize--${size}`,
          invalid && "nova-autosize--invalid",
          disabled && "nova-autosize--disabled",
          className
        )}
        style={style}
        data-disabled={disabled || undefined}
      >
        <input
          {...rest}
          ref={setRef}
          className="nova-autosize__field nova-focusable"
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          style={{ width: `max(${minWidth}, ${width}px)` }}
          onChange={(e) => {
            if (!isControlled) setInternal(e.target.value);
            onChange?.(e);
          }}
        />
        <span ref={mirrorRef} className="nova-autosize__mirror" aria-hidden="true" />
      </span>
    );
  }
);
