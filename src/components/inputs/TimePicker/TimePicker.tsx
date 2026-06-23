import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./TimePicker.css";

export type TimePickerSize = "sm" | "md" | "lg";

/** A time value as minutes/seconds since midnight, 24h based. */
export interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimePickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TimePickerSize;
  /** Controlled value. */
  value?: TimeValue | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: TimeValue | null;
  /** Fired with the new time, or `null` when cleared. */
  onChange?: (value: TimeValue | null) => void;
  /** Use 12-hour clock with AM/PM. Defaults to `false` (24h). */
  hour12?: boolean;
  /** Include a seconds segment. Defaults to `false`. */
  withSeconds?: boolean;
  /** Minute granularity for the dropdown list + stepping. Defaults to `1`. */
  step?: number;
  /** Render the dropdown list of preset times. Defaults to `true`. */
  withDropdown?: boolean;
  /** Placeholder when empty. */
  placeholder?: string;
  /** Marks the field as invalid. */
  invalid?: boolean;
  /** Disables the control. */
  disabled?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

const pad = (n: number): string => String(n).padStart(2, "0");

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

const toMinutes = (t: TimeValue): number => t.hours * 60 + t.minutes;

const formatTime = (
  t: TimeValue,
  hour12: boolean,
  withSeconds: boolean
): string => {
  if (hour12) {
    const period = t.hours >= 12 ? "PM" : "AM";
    let h = t.hours % 12;
    if (h === 0) h = 12;
    const core = `${h}:${pad(t.minutes)}${
      withSeconds ? `:${pad(t.seconds)}` : ""
    }`;
    return `${core} ${period}`;
  }
  return `${pad(t.hours)}:${pad(t.minutes)}${
    withSeconds ? `:${pad(t.seconds)}` : ""
  }`;
};

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(
    {
      size = "md",
      value,
      defaultValue,
      onChange,
      hour12 = false,
      withSeconds = false,
      step = 1,
      withDropdown = true,
      placeholder = "--:--",
      invalid = false,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<TimeValue | null>(
      defaultValue ?? null
    );
    const current = isControlled ? value ?? null : internal;

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const listId = useId();

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        wrapperRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const commit = useCallback(
      (next: TimeValue | null) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    // Update one segment, normalising into a full value (default the rest to 0).
    const updateSegment = useCallback(
      (segment: "hours" | "minutes" | "seconds", raw: number) => {
        const base: TimeValue = current ?? {
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        const next: TimeValue = { ...base };
        if (segment === "hours") next.hours = clamp(raw, 0, 23);
        if (segment === "minutes") next.minutes = clamp(raw, 0, 59);
        if (segment === "seconds") next.seconds = clamp(raw, 0, 59);
        commit(next);
      },
      [current, commit]
    );

    const onSegmentInput = useCallback(
      (
        segment: "hours" | "minutes" | "seconds",
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (raw === "") return;
        updateSegment(segment, Number(raw));
      },
      [updateSegment]
    );

    const onSegmentKeyDown = useCallback(
      (
        segment: "hours" | "minutes" | "seconds",
        e: React.KeyboardEvent<HTMLInputElement>
      ) => {
        const base = current ?? { hours: 0, minutes: 0, seconds: 0 };
        const value =
          segment === "hours"
            ? base.hours
            : segment === "minutes"
            ? base.minutes
            : base.seconds;
        const delta = segment === "minutes" ? step : 1;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          updateSegment(segment, value + delta);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updateSegment(segment, value - delta);
        }
      },
      [current, step, updateSegment]
    );

    // Build dropdown options stepping over minutes.
    const options = useMemo<TimeValue[]>(() => {
      if (!withDropdown) return [];
      const out: TimeValue[] = [];
      const stride = Math.max(1, step);
      for (let m = 0; m < 24 * 60; m += stride) {
        out.push({ hours: Math.floor(m / 60), minutes: m % 60, seconds: 0 });
      }
      return out;
    }, [withDropdown, step]);

    const selectedMinutes = current ? toMinutes(current) : -1;

    // Click-outside.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onPointerDown = (e: MouseEvent) => {
        const node = wrapperRef.current;
        if (node && !node.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    // Escape close.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Scroll selected option into view when opening.
    useEffect(() => {
      if (!open) return;
      const node = listRef.current?.querySelector<HTMLLIElement>(
        '[aria-selected="true"]'
      );
      node?.scrollIntoView({ block: "center" });
    }, [open]);

    // Display values for the segment inputs.
    const dispHours = current
      ? hour12
        ? pad(((current.hours + 11) % 12) + 1)
        : pad(current.hours)
      : "";
    const dispMinutes = current ? pad(current.minutes) : "";
    const dispSeconds = current ? pad(current.seconds) : "";
    const period = current ? (current.hours >= 12 ? "PM" : "AM") : "AM";

    const togglePeriod = useCallback(() => {
      const base = current ?? { hours: 0, minutes: 0, seconds: 0 };
      const next = { ...base };
      next.hours = base.hours >= 12 ? base.hours - 12 : base.hours + 12;
      commit(next);
    }, [current, commit]);

    return (
      <div
        ref={setRefs}
        className={cn("nova-timepicker", className)}
        {...rest}
      >
        <div
          className={cn(
            "nova-timepicker__control",
            `nova-timepicker__control--${size}`,
            invalid && "nova-timepicker__control--invalid",
            disabled && "nova-timepicker__control--disabled"
          )}
          data-disabled={disabled || undefined}
          role="group"
          aria-label="Time"
        >
          <span className="nova-timepicker__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="8.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M12 7.5V12l3 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className="nova-timepicker__segments">
            <input
              className="nova-timepicker__segment nova-focusable"
              type="text"
              inputMode="numeric"
              aria-label="Hours"
              placeholder={placeholder.slice(0, 2)}
              value={dispHours}
              disabled={disabled}
              maxLength={2}
              onChange={(e) => {
                if (hour12) {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (raw === "") return;
                  let h12 = clamp(Number(raw), 1, 12) % 12;
                  if (period === "PM") h12 += 12;
                  updateSegment("hours", h12);
                } else {
                  onSegmentInput("hours", e);
                }
              }}
              onKeyDown={(e) => onSegmentKeyDown("hours", e)}
            />
            <span className="nova-timepicker__colon" aria-hidden="true">
              :
            </span>
            <input
              className="nova-timepicker__segment nova-focusable"
              type="text"
              inputMode="numeric"
              aria-label="Minutes"
              placeholder="--"
              value={dispMinutes}
              disabled={disabled}
              maxLength={2}
              onChange={(e) => onSegmentInput("minutes", e)}
              onKeyDown={(e) => onSegmentKeyDown("minutes", e)}
            />
            {withSeconds && (
              <>
                <span className="nova-timepicker__colon" aria-hidden="true">
                  :
                </span>
                <input
                  className="nova-timepicker__segment nova-focusable"
                  type="text"
                  inputMode="numeric"
                  aria-label="Seconds"
                  placeholder="--"
                  value={dispSeconds}
                  disabled={disabled}
                  maxLength={2}
                  onChange={(e) => onSegmentInput("seconds", e)}
                  onKeyDown={(e) => onSegmentKeyDown("seconds", e)}
                />
              </>
            )}
            {hour12 && (
              <button
                type="button"
                className="nova-timepicker__period nova-focusable"
                aria-label="Toggle AM/PM"
                disabled={disabled}
                onClick={togglePeriod}
              >
                {period}
              </button>
            )}
          </div>

          {withDropdown && (
            <button
              type="button"
              className="nova-timepicker__toggle nova-focusable"
              aria-label="Open time list"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              disabled={disabled}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {withDropdown && open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Times"
            className="nova-timepicker__list"
          >
            {options.map((opt) => {
              const isSelected = toMinutes(opt) === selectedMinutes;
              return (
                <li
                  key={`${opt.hours}-${opt.minutes}`}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "nova-timepicker__option",
                    isSelected && "nova-timepicker__option--selected"
                  )}
                  onClick={() => {
                    commit({ ...opt, seconds: current?.seconds ?? 0 });
                    setOpen(false);
                  }}
                >
                  {formatTime(opt, hour12, false)}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);

export { formatTime };
