import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./Textarea.css";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TextareaSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Grows the field to fit its content as the user types. */
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      size = "md",
      invalid = false,
      autoResize = false,
      disabled,
      className,
      value,
      defaultValue,
      onChange,
      rows,
      ...rest
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    // Resize on mount and whenever the controlled value changes.
    useEffect(() => {
      resize();
    }, [resize, value, defaultValue]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
      if (autoResize) resize();
    };

    return (
      <textarea
        ref={setRef}
        className={cn(
          "nova-textarea",
          "nova-focusable",
          `nova-textarea--${size}`,
          invalid && "nova-textarea--invalid",
          autoResize && "nova-textarea--auto",
          className
        )}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);
