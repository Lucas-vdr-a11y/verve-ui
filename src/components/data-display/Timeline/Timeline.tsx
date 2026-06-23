import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Timeline.css";

export type TimelineTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, children, ...rest }, ref) {
    return (
      <ol ref={ref} className={cn("nova-timeline", className)} {...rest}>
        {children}
      </ol>
    );
  }
);

export interface TimelineItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Marker / connector tone. Defaults to `"neutral"`. */
  tone?: TimelineTone;
  /** Custom marker content (icon). Defaults to a filled dot. */
  marker?: React.ReactNode;
  /** Title / headline for the event. */
  title?: React.ReactNode;
  /** Timestamp or meta text shown beside the title. */
  time?: React.ReactNode;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  function TimelineItem(
    { tone = "neutral", marker, title, time, className, children, ...rest },
    ref
  ) {
    return (
      <li
        ref={ref}
        className={cn(
          "nova-timeline__item",
          `nova-timeline__item--${tone}`,
          className
        )}
        {...rest}
      >
        <span className="nova-timeline__marker" aria-hidden="true">
          {marker ?? <span className="nova-timeline__dot" />}
        </span>
        <div className="nova-timeline__content">
          {(title || time) && (
            <div className="nova-timeline__header">
              {title && <span className="nova-timeline__title">{title}</span>}
              {time && <span className="nova-timeline__time">{time}</span>}
            </div>
          )}
          {children && <div className="nova-timeline__body">{children}</div>}
        </div>
      </li>
    );
  }
);
