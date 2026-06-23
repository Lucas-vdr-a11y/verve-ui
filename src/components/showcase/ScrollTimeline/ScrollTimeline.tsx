import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ScrollTimeline.css";

export interface TimelineEntry {
  /** Stable key. */
  id: string | number;
  /** Date / period label (e.g. "2024"). */
  date?: React.ReactNode;
  /** Entry title. */
  title: React.ReactNode;
  /** Body content. */
  content?: React.ReactNode;
  /** Optional media URL rendered alongside the content. */
  media?: string;
}

export interface ScrollTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Ordered timeline entries. */
  entries: TimelineEntry[];
}

/**
 * ScrollTimeline — a vertical timeline whose entries fade/slide in as they enter
 * the viewport, with the connecting spine drawing itself top-to-bottom as you
 * scroll past the section (IntersectionObserver per entry + a rAF scroll read for
 * the line height).
 *
 * SSR-safe: the observer and scroll listener are created in an effect that guards
 * `window`, with full cleanup. Under reduced motion every entry renders revealed
 * and the spine is full-height immediately.
 */
export const ScrollTimeline = forwardRef<HTMLDivElement, ScrollTimelineProps>(
  function ScrollTimeline({ entries, className, style, ...rest }, ref) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();
    const [visible, setVisible] = useState<Set<string | number>>(new Set());
    const [progress, setProgress] = useState(0);
    const frame = useRef<number | null>(null);

    // Reveal entries on intersection.
    useEffect(() => {
      if (reduced) {
        setVisible(new Set(entries.map((e) => e.id)));
        setProgress(1);
        return;
      }
      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        setVisible(new Set(entries.map((e) => e.id)));
        return;
      }
      const wrap = wrapRef.current;
      if (!wrap) return;

      const observer = new IntersectionObserver(
        (records) => {
          setVisible((prev) => {
            let next = prev;
            for (const r of records) {
              if (r.isIntersecting) {
                const id = (r.target as HTMLElement).dataset.id;
                if (id == null) continue;
                if (next === prev) next = new Set(prev);
                // ids are stringified in dataset; match against entries
                const match = entries.find((e) => String(e.id) === id);
                if (match) next.add(match.id);
              }
            }
            return next;
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -15% 0px" }
      );

      wrap
        .querySelectorAll(".nova-scroll-timeline__entry")
        .forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, [entries, reduced]);

    // Draw the spine based on scroll position through the section.
    useEffect(() => {
      if (reduced) return;
      if (typeof window === "undefined") return;
      const wrap = wrapRef.current;
      if (!wrap) return;

      const measure = () => {
        frame.current = null;
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const start = vh * 0.85;
        const total = rect.height + start - vh * 0.15;
        const p = (start - rect.top) / total;
        setProgress(p < 0 ? 0 : p > 1 ? 1 : p);
      };
      const schedule = () => {
        if (frame.current === null) {
          frame.current = window.requestAnimationFrame(measure);
        }
      };
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame.current !== null) {
          window.cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, [reduced]);

    return (
      <div
        ref={mergeRefs(ref, wrapRef)}
        className={cn("nova-scroll-timeline", className)}
        style={
          {
            "--nova-scroll-timeline-progress": progress,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-scroll-timeline__spine" aria-hidden="true">
          <span className="nova-scroll-timeline__spine-fill" />
        </div>
        <ol className="nova-scroll-timeline__list">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="nova-scroll-timeline__entry"
              data-id={String(entry.id)}
              data-visible={visible.has(entry.id) ? "" : undefined}
            >
              <span className="nova-scroll-timeline__dot" aria-hidden="true" />
              <div className="nova-scroll-timeline__card">
                {entry.date && (
                  <span className="nova-scroll-timeline__date">
                    {entry.date}
                  </span>
                )}
                <h3 className="nova-scroll-timeline__title">{entry.title}</h3>
                {entry.media && (
                  <img
                    className="nova-scroll-timeline__media"
                    src={entry.media}
                    alt=""
                    loading="lazy"
                  />
                )}
                {entry.content && (
                  <div className="nova-scroll-timeline__content">
                    {entry.content}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
);

function mergeRefs<T>(
  external: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>
) {
  return (node: T | null) => {
    local.current = node;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  };
}
