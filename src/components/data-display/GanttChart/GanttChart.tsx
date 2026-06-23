import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import type { ChartTone } from "../../charts/utils";
import { clamp, toneColor } from "../../charts/utils";
import "./GanttChart.css";

export interface GanttTask {
  /** Stable unique id. */
  id: string;
  /** Task name shown in the left rail. */
  name: string;
  /** Start date (inclusive). */
  start: Date | string;
  /** End date (inclusive). */
  end: Date | string;
  /** Completion ratio 0–1 for the progress fill. */
  progress?: number;
  /** Ids of tasks this depends on (drawn as connector lines). */
  dependencies?: string[];
  /** Optional grouping label; tasks sharing a group render under a header. */
  group?: string;
  /** Bar tone. Defaults to `"brand"`. */
  tone?: ChartTone;
}

export type GanttScale = "day" | "week";

export interface GanttChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Tasks to plot. */
  tasks: GanttTask[];
  /** Time-axis granularity. Defaults to `"day"`. */
  scale?: GanttScale;
  /** Width of one day column in px. Defaults to `28`. */
  dayWidth?: number;
  /** Height of each task row in px. Defaults to `36`. */
  rowHeight?: number;
  /** Width of the left task-name rail in px. Defaults to `180`. */
  labelWidth?: number;
  /** Draw a vertical marker at today. Defaults to `true`. */
  showToday?: boolean;
  /** "Today" override (mostly for testing / SSR determinism). */
  today?: Date | string;
  /** Fired when a task bar is activated. */
  onTaskClick?: (task: GanttTask) => void;
}

const MS_PER_DAY = 86400000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toDate = (d: Date | string): Date => {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00") : new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);

interface Row {
  kind: "group" | "task";
  group?: string;
  task?: GanttTask;
}

export const GanttChart = forwardRef<HTMLDivElement, GanttChartProps>(
  function GanttChart(
    {
      tasks,
      scale = "day",
      dayWidth = 28,
      rowHeight = 36,
      labelWidth = 180,
      showToday = true,
      today,
      onTaskClick,
      className,
      ...rest
    },
    ref
  ) {
    const model = useMemo(() => {
      if (tasks.length === 0) {
        return {
          rows: [] as Row[],
          ticks: [] as { x: number; label: string }[],
          min: toDate(new Date()),
          totalDays: 0,
          rowOf: new Map<string, number>(),
        };
      }

      let min = toDate(tasks[0].start);
      let max = toDate(tasks[0].end);
      for (const t of tasks) {
        const s = toDate(t.start);
        const e = toDate(t.end);
        if (s.getTime() < min.getTime()) min = s;
        if (e.getTime() > max.getTime()) max = e;
      }
      // pad one period on each side
      const pad = scale === "week" ? 7 : 1;
      min = new Date(min.getTime() - pad * MS_PER_DAY);
      max = new Date(max.getTime() + pad * MS_PER_DAY);
      const totalDays = daysBetween(min, max) + 1;

      // group rows preserving first-seen order
      const groups: string[] = [];
      const seen = new Set<string>();
      for (const t of tasks) {
        const g = t.group ?? "";
        if (!seen.has(g)) {
          seen.add(g);
          groups.push(g);
        }
      }
      const hasGroups = groups.some((g) => g !== "");

      const rows: Row[] = [];
      const rowOf = new Map<string, number>();
      for (const g of groups) {
        if (hasGroups) rows.push({ kind: "group", group: g || "Ungrouped" });
        for (const t of tasks) {
          if ((t.group ?? "") === g) {
            rowOf.set(t.id, rows.length);
            rows.push({ kind: "task", task: t });
          }
        }
      }

      // axis ticks
      const ticks: { x: number; label: string }[] = [];
      const step = scale === "week" ? 7 : 1;
      for (let i = 0; i < totalDays; i += step) {
        const d = new Date(min.getTime() + i * MS_PER_DAY);
        const label =
          scale === "week"
            ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
            : d.getDate() === 1 || i === 0
              ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
              : String(d.getDate());
        ticks.push({ x: i * dayWidth, label });
      }

      return { rows, ticks, min, totalDays, rowOf };
    }, [tasks, scale, dayWidth]);

    const gridWidth = model.totalDays * dayWidth;
    const bodyHeight = model.rows.length * rowHeight;

    const todayDate = today ? toDate(today) : toDate(new Date());
    const todayOffset = daysBetween(model.min, todayDate);
    const todayVisible =
      showToday && todayOffset >= 0 && todayOffset < model.totalDays;

    return (
      <div
        ref={ref}
        className={cn("nova-gantt", className)}
        role="group"
        aria-label="Project timeline"
        {...rest}
      >
        <div className="nova-gantt__scroll">
          <div
            className="nova-gantt__inner"
            style={{ minWidth: labelWidth + gridWidth }}
          >
            {/* Header */}
            <div className="nova-gantt__header" style={{ height: rowHeight }}>
              <div
                className="nova-gantt__corner"
                style={{ width: labelWidth }}
              />
              <div
                className="nova-gantt__axis"
                style={{ width: gridWidth }}
              >
                {model.ticks.map((t, i) => (
                  <span
                    key={i}
                    className="nova-gantt__tick"
                    style={{ left: t.x }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="nova-gantt__body">
              <div
                className="nova-gantt__rail"
                style={{ width: labelWidth }}
              >
                {model.rows.map((row, i) =>
                  row.kind === "group" ? (
                    <div
                      key={`g-${i}`}
                      className="nova-gantt__rail-group"
                      style={{ height: rowHeight }}
                    >
                      {row.group}
                    </div>
                  ) : (
                    <div
                      key={row.task!.id}
                      className="nova-gantt__rail-task"
                      style={{ height: rowHeight }}
                      title={row.task!.name}
                    >
                      {row.task!.name}
                    </div>
                  )
                )}
              </div>

              <div
                className="nova-gantt__plot"
                style={{ width: gridWidth, height: bodyHeight }}
              >
                {/* vertical gridlines */}
                <div className="nova-gantt__grid" aria-hidden="true">
                  {model.ticks.map((t, i) => (
                    <span
                      key={i}
                      className="nova-gantt__gridline"
                      style={{ left: t.x }}
                    />
                  ))}
                </div>

                {/* dependency connectors */}
                <svg
                  className="nova-gantt__deps"
                  width={gridWidth}
                  height={bodyHeight}
                  aria-hidden="true"
                  focusable="false"
                >
                  {model.rows.map((row) => {
                    if (row.kind !== "task" || !row.task?.dependencies)
                      return null;
                    const t = row.task;
                    const toRow = model.rowOf.get(t.id);
                    if (toRow == null) return null;
                    const tStartX =
                      daysBetween(model.min, toDate(t.start)) * dayWidth;
                    const toY = toRow * rowHeight + rowHeight / 2;
                    return t.dependencies!.map((depId) => {
                      const fromRow = model.rowOf.get(depId);
                      if (fromRow == null) return null;
                      const dep = tasks.find((x) => x.id === depId);
                      if (!dep) return null;
                      const fromX =
                        (daysBetween(model.min, toDate(dep.end)) + 1) *
                        dayWidth;
                      const fromY = fromRow * rowHeight + rowHeight / 2;
                      const midX = (fromX + tStartX) / 2;
                      return (
                        <path
                          key={`${depId}-${t.id}`}
                          className="nova-gantt__dep"
                          d={`M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${tStartX} ${toY}`}
                          fill="none"
                        />
                      );
                    });
                  })}
                </svg>

                {/* bars */}
                {model.rows.map((row) => {
                  if (row.kind !== "task" || !row.task) return null;
                  const t = row.task;
                  const rowIndex = model.rowOf.get(t.id)!;
                  const startOffset = daysBetween(model.min, toDate(t.start));
                  const span =
                    daysBetween(toDate(t.start), toDate(t.end)) + 1;
                  const x = startOffset * dayWidth;
                  const w = Math.max(span * dayWidth, dayWidth * 0.5);
                  const progress =
                    t.progress != null ? clamp(t.progress, 0, 1) : undefined;
                  const color = toneColor(t.tone, "var(--nova-primary)");
                  const interactive = !!onTaskClick;
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "nova-gantt__bar",
                        interactive && "nova-gantt__bar--interactive"
                      )}
                      role={interactive ? "button" : undefined}
                      tabIndex={interactive ? 0 : undefined}
                      aria-label={`${t.name}${
                        progress != null
                          ? `, ${Math.round(progress * 100)}% complete`
                          : ""
                      }`}
                      title={t.name}
                      style={{
                        left: x,
                        top: rowIndex * rowHeight + rowHeight * 0.18,
                        width: w,
                        height: rowHeight * 0.64,
                        ["--nova-gantt-bar" as string]: color,
                      }}
                      onClick={
                        interactive ? () => onTaskClick?.(t) : undefined
                      }
                      onKeyDown={
                        interactive
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onTaskClick?.(t);
                              }
                            }
                          : undefined
                      }
                    >
                      {progress != null && (
                        <span
                          className="nova-gantt__bar-fill"
                          style={{ width: `${progress * 100}%` }}
                        />
                      )}
                      {progress != null && (
                        <span className="nova-gantt__bar-label">
                          {Math.round(progress * 100)}%
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* today marker */}
                {todayVisible && (
                  <span
                    className="nova-gantt__today"
                    style={{ left: todayOffset * dayWidth + dayWidth / 2 }}
                    aria-hidden="true"
                  >
                    <span className="nova-gantt__today-dot" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
