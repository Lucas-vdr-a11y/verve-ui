import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import { formatTime } from "../utils";
import "./TimeSlotPicker.css";

/** One bookable slot. */
export interface TimeSlot {
  /** Slot start time — a `Date` or `HH:mm` string (e.g. `"09:30"`). */
  time: Date | string;
  /** Whether the slot can be booked. Defaults to `true`. */
  available?: boolean;
  /** Optional display label override. */
  label?: string;
}

export type TimeSlotGroup = "morning" | "afternoon" | "evening";

export interface TimeSlotPickerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onSelect" | "defaultValue"
  > {
  /** Slots to offer. */
  slots: TimeSlot[];
  /** Controlled selected slot value (matched by normalized `HH:mm`). */
  value?: TimeSlot | string | null;
  /** Initial selected slot (uncontrolled). */
  defaultValue?: TimeSlot | string | null;
  /** Fired when a slot is chosen. */
  onSelect?: (slot: TimeSlot) => void;
  /** 12-hour clock labels. Defaults to `true`. */
  hour12?: boolean;
  /** Group slots into morning/afternoon/evening. Defaults to `true`. */
  grouped?: boolean;
  /** Heading shown above the slots (e.g. the chosen day). */
  heading?: React.ReactNode;
  /** Shown when there are no slots. */
  emptyLabel?: React.ReactNode;
}

const GROUP_LABELS: Record<TimeSlotGroup, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const GROUP_ORDER: TimeSlotGroup[] = ["morning", "afternoon", "evening"];

/** Minutes since midnight for a slot's time, plus a normalized `HH:mm` key. */
const slotMinutes = (time: Date | string): number => {
  if (typeof time === "string") {
    const [h, m] = time.split(":");
    return Number(h) * 60 + (Number(m) || 0);
  }
  return time.getHours() * 60 + time.getMinutes();
};

const slotKey = (slot: TimeSlot | string): string => {
  const time = typeof slot === "string" ? slot : slot.time;
  const mins = slotMinutes(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const groupOf = (mins: number): TimeSlotGroup =>
  mins < 12 * 60 ? "morning" : mins < 17 * 60 ? "afternoon" : "evening";

const slotLabel = (slot: TimeSlot, hour12: boolean): string => {
  if (slot.label) return slot.label;
  if (typeof slot.time !== "string") return formatTime(slot.time, { hour12 });
  // Build a throwaway Date purely for formatting (no "now" reliance).
  const mins = slotMinutes(slot.time);
  const d = new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60);
  return formatTime(d, { hour12 });
};

export const TimeSlotPicker = forwardRef<HTMLDivElement, TimeSlotPickerProps>(
  function TimeSlotPicker(
    {
      slots,
      value,
      defaultValue,
      onSelect,
      hour12 = true,
      grouped = true,
      heading,
      emptyLabel = "No available times",
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | null>(() =>
      defaultValue != null ? slotKey(defaultValue) : null
    );
    const selectedKey = isControlled
      ? value != null
        ? slotKey(value)
        : null
      : internal;

    const groups = useMemo(() => {
      const map: Record<TimeSlotGroup, TimeSlot[]> = {
        morning: [],
        afternoon: [],
        evening: [],
      };
      const sorted = slots
        .slice()
        .sort((a, b) => slotMinutes(a.time) - slotMinutes(b.time));
      if (!grouped) return { single: sorted, map };
      for (const s of sorted) map[groupOf(slotMinutes(s.time))].push(s);
      return { single: null, map };
    }, [slots, grouped]);

    const handleSelect = (slot: TimeSlot) => {
      if (slot.available === false) return;
      const key = slotKey(slot);
      if (!isControlled) setInternal(key);
      onSelect?.(slot);
    };

    const renderSlot = (slot: TimeSlot, idx: number) => {
      const key = slotKey(slot);
      const disabled = slot.available === false;
      const isSelected = key === selectedKey;
      return (
        <button
          key={`${key}-${idx}`}
          type="button"
          className={cn(
            "nova-time-slot-picker__slot",
            "nova-focusable",
            isSelected && "nova-time-slot-picker__slot--selected",
            disabled && "nova-time-slot-picker__slot--disabled"
          )}
          disabled={disabled}
          aria-pressed={isSelected}
          onClick={() => handleSelect(slot)}
        >
          {slotLabel(slot, hour12)}
        </button>
      );
    };

    const isEmpty = slots.length === 0;

    return (
      <div
        ref={ref}
        className={cn("nova-time-slot-picker", className)}
        role="group"
        aria-label="Time slots"
        {...rest}
      >
        {heading != null && (
          <div className="nova-time-slot-picker__heading">{heading}</div>
        )}

        {isEmpty ? (
          <div className="nova-time-slot-picker__empty" role="status">
            {emptyLabel}
          </div>
        ) : grouped ? (
          GROUP_ORDER.map((g) =>
            groups.map[g].length > 0 ? (
              <section key={g} className="nova-time-slot-picker__group">
                <h3 className="nova-time-slot-picker__group-label">
                  {GROUP_LABELS[g]}
                </h3>
                <div className="nova-time-slot-picker__slots">
                  {groups.map[g].map(renderSlot)}
                </div>
              </section>
            ) : null
          )
        ) : (
          <div className="nova-time-slot-picker__slots">
            {groups.single!.map(renderSlot)}
          </div>
        )}
      </div>
    );
  }
);
