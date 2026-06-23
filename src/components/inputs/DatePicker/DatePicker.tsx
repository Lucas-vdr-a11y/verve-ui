import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import { Calendar, type CalendarProps } from "../Calendar";
import "./DatePicker.css";

export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: DatePickerSize;
  /** Controlled selected date. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Fired with the newly selected date, or `null` when cleared. */
  onChange?: (date: Date | null) => void;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** Formats the selected date into the field text. */
  formatDate?: (date: Date) => string;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** First day of week passed to the calendar. */
  weekStartsOn?: CalendarProps["weekStartsOn"];
  /** Disable individual dates in the calendar. */
  disabledDate?: CalendarProps["disabledDate"];
  /** Locale for formatting + calendar labels. */
  locale?: string;
  /** Show a clear button when a date is selected. Defaults to `true`. */
  clearable?: boolean;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Controlled open state of the calendar popover. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Notified when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const defaultFormat = (date: Date, locale?: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
};

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      size = "md",
      value,
      defaultValue,
      onChange,
      placeholder = "Select date",
      formatDate,
      min,
      max,
      weekStartsOn,
      disabledDate,
      locale,
      clearable = true,
      invalid = false,
      disabled = false,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null
    );
    const selected = isControlled ? value ?? null : internalValue;

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = isOpenControlled ? !!openProp : internalOpen;

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelId = useId();

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        wrapperRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const setOpen = useCallback(
      (next: boolean) => {
        if (disabled) return;
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [disabled, isOpenControlled, onOpenChange]
    );

    const setValue = useCallback(
      (next: Date | null) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const handleSelect = useCallback(
      (date: Date) => {
        setValue(date);
        setOpen(false);
        triggerRef.current?.focus();
      },
      [setValue, setOpen]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
      },
      [setValue]
    );

    // Click-outside close.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onPointerDown = (e: MouseEvent) => {
        const node = wrapperRef.current;
        if (node && !node.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open, setOpen]);

    // Escape close.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, setOpen]);

    const display = selected
      ? formatDate
        ? formatDate(selected)
        : defaultFormat(selected, locale)
      : "";

    return (
      <div
        ref={setRefs}
        className={cn("nova-datepicker", className)}
        {...rest}
      >
        <div
          className={cn(
            "nova-datepicker__control",
            `nova-datepicker__control--${size}`,
            invalid && "nova-datepicker__control--invalid",
            disabled && "nova-datepicker__control--disabled"
          )}
          data-disabled={disabled || undefined}
        >
          <span className="nova-datepicker__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <button
            ref={triggerRef}
            type="button"
            className="nova-datepicker__field nova-focusable"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-invalid={invalid || undefined}
            onClick={() => setOpen(!open)}
          >
            {display ? (
              <span className="nova-datepicker__value">{display}</span>
            ) : (
              <span className="nova-datepicker__placeholder">
                {placeholder}
              </span>
            )}
          </button>
          {clearable && selected && !disabled && (
            <button
              type="button"
              className="nova-datepicker__clear nova-focusable"
              aria-label="Clear date"
              onClick={handleClear}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {open && (
          <div
            id={panelId}
            role="dialog"
            aria-label="Choose date"
            className="nova-datepicker__panel"
          >
            <Calendar
              size={size}
              value={selected}
              onChange={handleSelect}
              min={min}
              max={max}
              weekStartsOn={weekStartsOn}
              disabledDate={disabledDate}
              locale={locale}
            />
          </div>
        )}
      </div>
    );
  }
);
