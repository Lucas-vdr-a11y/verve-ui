import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./EventCard.css";

export interface EventCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Day number for the date badge, e.g. "21". */
  day: React.ReactNode;
  /** Month abbreviation for the date badge, e.g. "JUN". */
  month: React.ReactNode;
  /** Event title. */
  title: React.ReactNode;
  /** Time string, e.g. "6:00 PM – 9:00 PM". */
  time?: React.ReactNode;
  /** Location string, e.g. "Berlin, DE". */
  location?: React.ReactNode;
  /** Short description. */
  description?: React.ReactNode;
  /** Attendees / avatars slot, rendered near the CTA. */
  attendees?: React.ReactNode;
  /** CTA element (e.g. a button). Takes precedence over `ctaLabel`. */
  cta?: React.ReactNode;
  /** Convenience label rendering a built-in CTA button. */
  ctaLabel?: React.ReactNode;
  /** Called when the built-in CTA button is clicked. */
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 4.5V8l2.5 1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path
      d="M8 14.5s5-4.13 5-8a5 5 0 1 0-10 0c0 3.87 5 8 5 8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="6.5" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * EventCard — date badge, title, time + location with icons, an attendees slot
 * and a CTA. Suited to event listings.
 */
export const EventCard = forwardRef<HTMLElement, EventCardProps>(
  function EventCard(
    {
      day,
      month,
      title,
      time,
      location,
      description,
      attendees,
      cta,
      ctaLabel,
      onCtaClick,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <article ref={ref} className={cn("nova-event-card", className)} {...rest}>
        <div className="nova-event-card__badge" aria-hidden="true">
          <span className="nova-event-card__badge-day">{day}</span>
          <span className="nova-event-card__badge-month">{month}</span>
        </div>

        <div className="nova-event-card__body">
          <h3 className="nova-event-card__title">{title}</h3>

          {(time || location) && (
            <ul className="nova-event-card__details">
              {time && (
                <li className="nova-event-card__detail">
                  <span className="nova-event-card__detail-icon" aria-hidden="true">
                    <ClockIcon />
                  </span>
                  <span>{time}</span>
                </li>
              )}
              {location && (
                <li className="nova-event-card__detail">
                  <span className="nova-event-card__detail-icon" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <span>{location}</span>
                </li>
              )}
            </ul>
          )}

          {description && (
            <p className="nova-event-card__description">{description}</p>
          )}

          {(attendees || cta || ctaLabel) && (
            <div className="nova-event-card__footer">
              {attendees && (
                <div className="nova-event-card__attendees">{attendees}</div>
              )}
              {cta ? (
                <div className="nova-event-card__cta">{cta}</div>
              ) : ctaLabel ? (
                <button
                  type="button"
                  className="nova-event-card__button"
                  onClick={onCtaClick}
                >
                  {ctaLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </article>
    );
  },
);
