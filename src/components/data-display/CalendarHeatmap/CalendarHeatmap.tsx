import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./CalendarHeatmap.css";

export interface HeatmapValue {
  /** ISO date string `YYYY-MM-DD`. */
  date: string;
  /** Contribution count for that day. */
  count: number;
}

export type CalendarHeatmapTone = "primary" | "success" | "info";

export interface CalendarHeatmapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Day-by-day values. Missing days render as empty (level 0). */
  values: HeatmapValue[];
  /** First day shown. Defaults to one year before `endDate`. */
  startDate?: Date | string;
  /** Last day shown. Defaults to today. */
  endDate?: Date | string;
  /** Color tone for filled cells. Defaults to `"primary"`. */
  tone?: CalendarHeatmapTone;
  /** Bucket thresholds; a count >= threshold[i] gets level i+1. */
  thresholds?: number[];
  /** Show month labels above the grid. Defaults to `true`. */
  showMonthLabels?: boolean;
  /** Show the weekday labels column. Defaults to `true`. */
  showWeekdayLabels?: boolean;
  /** Builds the per-cell `title` tooltip. */
  getTooltip?: (date: string, count: number) => string;
}

const MS_PER_DAY = 86400000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDate = (d: Date | string): Date => {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00") : new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const toKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const levelFor = (count: number, thresholds: number[]): number => {
  if (count <= 0) return 0;
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (count >= thresholds[i]) level = i + 2;
  }
  return Math.min(level, thresholds.length + 1);
};

export const CalendarHeatmap = forwardRef<HTMLDivElement, CalendarHeatmapProps>(
  function CalendarHeatmap(
    {
      values,
      startDate,
      endDate,
      tone = "primary",
      thresholds = [3, 6, 9],
      showMonthLabels = true,
      showWeekdayLabels = true,
      getTooltip,
      className,
      ...rest
    },
    ref
  ) {
    const { weeks, monthLabels } = useMemo(() => {
      const end = endDate ? toDate(endDate) : toDate(new Date());
      const start = startDate
        ? toDate(startDate)
        : toDate(new Date(end.getTime() - 364 * MS_PER_DAY));

      // Align grid start to the Sunday on/before `start`.
      const gridStart = new Date(start);
      gridStart.setDate(gridStart.getDate() - gridStart.getDay());

      const counts = new Map<string, number>();
      for (const v of values) {
        counts.set(v.date, (counts.get(v.date) ?? 0) + v.count);
      }

      const cols: { date: Date | null; key: string; count: number; level: number }[][] = [];
      const months: { col: number; label: string }[] = [];
      let cursor = new Date(gridStart);
      let col = 0;
      let lastMonth = -1;

      while (cursor.getTime() <= end.getTime()) {
        const week: { date: Date | null; key: string; count: number; level: number }[] = [];
        for (let dow = 0; dow < 7; dow++) {
          if (cursor.getTime() < start.getTime() || cursor.getTime() > end.getTime()) {
            week.push({ date: null, key: `pad-${col}-${dow}`, count: 0, level: 0 });
          } else {
            const key = toKey(cursor);
            const count = counts.get(key) ?? 0;
            week.push({ date: new Date(cursor), key, count, level: levelFor(count, thresholds) });
            if (dow === 0 || months.length === 0) {
              const m = cursor.getMonth();
              if (m !== lastMonth && cursor.getDate() <= 7) {
                months.push({ col, label: MONTHS[m] });
                lastMonth = m;
              }
            }
          }
          // Increment by calendar day (not +24h) so DST transitions, where a
          // local day spans 23h/25h, don't repeat or skip a date key.
          cursor = new Date(cursor);
          cursor.setDate(cursor.getDate() + 1);
        }
        cols.push(week);
        col++;
      }

      return { weeks: cols, monthLabels: months };
    }, [values, startDate, endDate, thresholds]);

    const tooltipFor = (key: string, count: number): string =>
      getTooltip
        ? getTooltip(key, count)
        : `${count} ${count === 1 ? "contribution" : "contributions"} on ${key}`;

    return (
      <div
        ref={ref}
        className={cn(
          "nova-calendar-heatmap",
          `nova-calendar-heatmap--${tone}`,
          className
        )}
        {...rest}
      >
        {showMonthLabels && (
          <div className="nova-calendar-heatmap__months">
            {showWeekdayLabels && (
              <div className="nova-calendar-heatmap__weekday-spacer" aria-hidden="true" />
            )}
            <div className="nova-calendar-heatmap__months-track">
              {monthLabels.map((m, i) => (
                <span
                  key={`${m.label}-${i}`}
                  className="nova-calendar-heatmap__month"
                  style={{ gridColumnStart: m.col + 1 }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="nova-calendar-heatmap__body">
          {showWeekdayLabels && (
            <div className="nova-calendar-heatmap__weekdays" aria-hidden="true">
              {WEEKDAYS.map((w, i) => (
                <span
                  key={w}
                  className="nova-calendar-heatmap__weekday"
                  style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {w}
                </span>
              ))}
            </div>
          )}

          <div className="nova-calendar-heatmap__grid" role="img" aria-label="Contribution activity">
            {weeks.map((week, ci) => (
              <div className="nova-calendar-heatmap__week" key={ci}>
                {week.map((cell) =>
                  cell.date ? (
                    <span
                      key={cell.key}
                      className="nova-calendar-heatmap__cell"
                      data-level={cell.level}
                      title={tooltipFor(cell.key, cell.count)}
                    />
                  ) : (
                    <span
                      key={cell.key}
                      className="nova-calendar-heatmap__cell nova-calendar-heatmap__cell--empty"
                      aria-hidden="true"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
