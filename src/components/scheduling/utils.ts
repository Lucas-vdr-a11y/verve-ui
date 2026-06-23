/* =============================================================================
 * scheduling/utils.ts — local, dependency-free date math + shared types.
 * Native Date only. Self-contained for the scheduling category (do NOT import
 * helpers from inputs/Calendar or data-display/EventCalendar — duplicate them
 * here so this category stays standalone).
 * ========================================================================== */

export type EventTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** A time-bound event used by WeekView / DayView / Scheduler. */
export interface SchedulerEvent {
  /** Unique id (used for React keys + click payloads). */
  id: string;
  /** Event title. */
  title: string;
  /** Start datetime. */
  start: Date;
  /** End datetime. */
  end: Date;
  /** Semantic tone for the chip. Defaults to `"primary"`. */
  tone?: EventTone;
  /** Spans the whole day → rendered in the all-day row, not the grid. */
  allDay?: boolean;
  /** Optional location, shown by AgendaView. */
  location?: string;
  /** Arbitrary echo payload. */
  meta?: unknown;
}

export const MS_PER_MINUTE = 60000;
export const MS_PER_DAY = 86400000;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Sunday-first short weekday labels. */
export const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Sunday-first single-letter weekday labels (mini grids). */
export const DOW_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

export type WeekStart = 0 | 1;

/** Midnight (local) of the given date. */
export const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** First of the month (local). */
export const startOfMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const addMonths = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

export const addYears = (d: Date, n: number): Date =>
  new Date(d.getFullYear() + n, d.getMonth(), d.getDate());

export const isSameDay = (
  a: Date | null | undefined,
  b: Date | null | undefined
): boolean =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (
  a: Date | null | undefined,
  b: Date | null | undefined
): boolean =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** ISO-ish `YYYY-MM-DD` key in local time. */
export const toDayKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Coerce a `Date | string` into a normalized Date. Strings parse as local. */
export const toDate = (d: Date | string): Date =>
  typeof d === "string"
    ? new Date(d.length <= 10 ? d + "T00:00:00" : d)
    : new Date(d.getTime());

/** Start (Sunday or Monday) of the week containing `d`. */
export const startOfWeek = (d: Date, weekStartsOn: WeekStart = 0): Date => {
  const day = startOfDay(d);
  const diff = (day.getDay() - weekStartsOn + 7) % 7;
  return addDays(day, -diff);
};

/** The 7 days of the week containing `d`. */
export const weekDays = (d: Date, weekStartsOn: WeekStart = 0): Date[] => {
  const start = startOfWeek(d, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/** Minutes since local midnight for the given datetime. */
export const minutesSinceMidnight = (d: Date): number =>
  d.getHours() * 60 + d.getMinutes();

/** Format a clock time, e.g. `9:00 AM`. */
export const formatTime = (
  d: Date,
  opts: { hour12?: boolean } = {}
): string => {
  const hour12 = opts.hour12 ?? true;
  let h = d.getHours();
  const m = d.getMinutes();
  const mm = String(m).padStart(2, "0");
  if (!hour12) return `${String(h).padStart(2, "0")}:${mm}`;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return m === 0 ? `${h} ${period}` : `${h}:${mm} ${period}`;
};

/** Hour-of-day label for a grid gutter, e.g. `9 AM`. */
export const formatHour = (hour: number, hour12 = true): string => {
  if (!hour12) return `${String(hour).padStart(2, "0")}:00`;
  const period = hour >= 12 ? "PM" : "AM";
  let h = hour % 12;
  if (h === 0) h = 12;
  return `${h} ${period}`;
};

/** A full month label, e.g. `June 2026`. */
export const formatMonthYear = (d: Date): string =>
  `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

/** Weekday labels ordered per `weekStartsOn`. */
export const orderedWeekdays = (
  weekStartsOn: WeekStart,
  narrow = false
): string[] => {
  const src = narrow ? DOW_NARROW : DOW_SHORT;
  return weekStartsOn === 1 ? [...src.slice(1), src[0]] : src.slice();
};

/**
 * Build a 6x7 month grid (42 cells) starting at `weekStartsOn`.
 * Stable layout regardless of month length.
 */
export const monthGrid = (
  month: Date,
  weekStartsOn: WeekStart = 0
): Date[] => {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
};

/** Clamp `n` into `[lo, hi]`. */
export const clamp = (n: number, lo: number, hi: number): number =>
  n < lo ? lo : n > hi ? hi : n;

/**
 * Lay overlapping events out side-by-side within a column.
 * Returns each event with a `columnIndex` and `columnCount` so callers can
 * compute left/width. Pure, deterministic (sorted by start, then end).
 */
export interface PositionedEvent<E> {
  event: E;
  columnIndex: number;
  columnCount: number;
}

export function layoutOverlaps<E>(
  events: E[],
  getStart: (e: E) => number,
  getEnd: (e: E) => number
): PositionedEvent<E>[] {
  const sorted = events
    .map((event) => ({ event, start: getStart(event), end: getEnd(event) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: PositionedEvent<E>[] = [];
  let cluster: { event: E; start: number; end: number }[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    // Greedy column assignment within the cluster.
    const columns: number[] = []; // each holds the end time of its last event
    const assigned: { idx: number; col: number }[] = [];
    cluster.forEach((item, idx) => {
      let placed = -1;
      for (let c = 0; c < columns.length; c++) {
        if (item.start >= columns[c]) {
          columns[c] = item.end;
          placed = c;
          break;
        }
      }
      if (placed === -1) {
        placed = columns.length;
        columns.push(item.end);
      }
      assigned.push({ idx, col: placed });
    });
    const columnCount = columns.length;
    assigned.forEach(({ idx, col }) => {
      result.push({
        event: cluster[idx].event,
        columnIndex: col,
        columnCount,
      });
    });
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const item of sorted) {
    if (cluster.length > 0 && item.start >= clusterEnd) flush();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  flush();

  return result;
}
