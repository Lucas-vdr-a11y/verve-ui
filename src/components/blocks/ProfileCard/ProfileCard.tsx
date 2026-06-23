import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./ProfileCard.css";

export interface ProfileStat {
  /** Stat label, e.g. "Followers". */
  label: React.ReactNode;
  /** Stat value, e.g. "1.2k". */
  value: React.ReactNode;
}

export interface ProfileCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Avatar slot (e.g. an <img> or initials element). */
  avatar?: React.ReactNode;
  /** Person's name. */
  name: React.ReactNode;
  /** Role / title. */
  role?: React.ReactNode;
  /** Short bio. */
  bio?: React.ReactNode;
  /** Stats row, e.g. followers / following. */
  stats?: ProfileStat[];
  /** Action slot (e.g. follow/message buttons). */
  actions?: React.ReactNode;
  /** Social links slot. */
  social?: React.ReactNode;
}

/**
 * ProfileCard — avatar, identity, bio, optional stats row and action/social
 * slots. Suited to team/member/profile grids.
 */
export const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  function ProfileCard(
    { avatar, name, role, bio, stats, actions, social, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn("nova-profile-card", className)} {...rest}>
        {avatar && (
          <span className="nova-profile-card__avatar" aria-hidden="true">
            {avatar}
          </span>
        )}

        <div className="nova-profile-card__identity">
          <span className="nova-profile-card__name">{name}</span>
          {role && <span className="nova-profile-card__role">{role}</span>}
        </div>

        {bio && <p className="nova-profile-card__bio">{bio}</p>}

        {stats && stats.length > 0 && (
          <dl className="nova-profile-card__stats">
            {stats.map((s, i) => (
              <div key={i} className="nova-profile-card__stat">
                <dt className="nova-profile-card__stat-value">{s.value}</dt>
                <dd className="nova-profile-card__stat-label">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}

        {social && <div className="nova-profile-card__social">{social}</div>}

        {actions && (
          <div className="nova-profile-card__actions">{actions}</div>
        )}
      </div>
    );
  },
);
