import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./TeamMemberCard.css";

export interface TeamMemberCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "role"> {
  /** Photo slot (e.g. an <img> or initials element). */
  photo?: React.ReactNode;
  /** Member's name. */
  name: React.ReactNode;
  /** Role / title. */
  role?: React.ReactNode;
  /** Short bio. */
  bio?: React.ReactNode;
  /** Social links slot, rendered in a row at the bottom. */
  social?: React.ReactNode;
  /** Horizontal alignment of the content. @default "center" */
  align?: "center" | "start";
}

/**
 * TeamMemberCard — photo, name, role, bio and a row of social links.
 * Suited to "meet the team" grids.
 */
export const TeamMemberCard = forwardRef<HTMLDivElement, TeamMemberCardProps>(
  function TeamMemberCard(
    { photo, name, role, bio, social, align = "center", className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "nova-team-member-card",
          `nova-team-member-card--${align}`,
          className,
        )}
        {...rest}
      >
        {photo && (
          <span className="nova-team-member-card__photo" aria-hidden="true">
            {photo}
          </span>
        )}

        <div className="nova-team-member-card__identity">
          <span className="nova-team-member-card__name">{name}</span>
          {role && <span className="nova-team-member-card__role">{role}</span>}
        </div>

        {bio && <p className="nova-team-member-card__bio">{bio}</p>}

        {social && (
          <div className="nova-team-member-card__social">{social}</div>
        )}
      </div>
    );
  },
);
