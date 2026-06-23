import { forwardRef, useCallback, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ThumbsToggle.css";

export type ThumbsValue = "up" | "down" | null;

export interface ThumbsToggleProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Controlled selection. Omit for uncontrolled. */
  value?: ThumbsValue;
  /** Initial selection when uncontrolled. Defaults `null`. */
  defaultValue?: ThumbsValue;
  /** Called with the next selection (clicking the active one clears it). */
  onChange?: (value: ThumbsValue) => void;
  /** Accessible label for the up button. Defaults `"Thumbs up"`. */
  upLabel?: string;
  /** Accessible label for the down button. Defaults `"Thumbs down"`. */
  downLabel?: string;
}

const THUMB_PATH =
  "M2 10h3v10H2zM7 20h9.3a2 2 0 0 0 2-1.5l1.6-6A2 2 0 0 0 18 10h-4.5l.8-4a1.6 1.6 0 0 0-1.6-2c-.6 0-1.2.3-1.5.9L7 10z";

/**
 * A combined thumbs up / thumbs down rating control with single-select: each
 * thumb bounces and fills with a semantic color when chosen; clicking the
 * active one clears the selection. Controlled via `value` or uncontrolled via
 * `defaultValue`.
 *
 * A `role="group"` of two real `<button>`s; the active one carries
 * `aria-pressed`. Bounce is suppressed under reduced motion (handled in CSS).
 */
export const ThumbsToggle = forwardRef<HTMLDivElement, ThumbsToggleProps>(
  function ThumbsToggle(
    {
      value: valueProp,
      defaultValue = null,
      onChange,
      upLabel = "Thumbs up",
      downLabel = "Thumbs down",
      className,
      role,
      ...rest
    },
    ref
  ) {
    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = useState<ThumbsValue>(defaultValue);
    const value = isControlled ? valueProp : internal;

    const select = useCallback(
      (which: "up" | "down") => {
        const next: ThumbsValue = value === which ? null : which;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange, value]
    );

    return (
      <div
        ref={ref}
        role={role ?? "group"}
        className={cn("nova-thumbs", className)}
        {...rest}
      >
        <button
          type="button"
          className={cn(
            "nova-thumbs__btn nova-thumbs__btn--up",
            value === "up" && "nova-thumbs__btn--active"
          )}
          aria-pressed={value === "up"}
          aria-label={upLabel}
          onClick={() => select("up")}
        >
          <svg className="nova-thumbs__icon" viewBox="0 0 24 24">
            <path d={THUMB_PATH} />
          </svg>
        </button>
        <button
          type="button"
          className={cn(
            "nova-thumbs__btn nova-thumbs__btn--down",
            value === "down" && "nova-thumbs__btn--active"
          )}
          aria-pressed={value === "down"}
          aria-label={downLabel}
          onClick={() => select("down")}
        >
          <svg className="nova-thumbs__icon" viewBox="0 0 24 24">
            <path d={THUMB_PATH} />
          </svg>
        </button>
      </div>
    );
  }
);
