import { forwardRef, useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
import "./Avatar.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image source. When it fails or is absent, initials/fallback render. */
  src?: string;
  /** Alt text for the image; also used to derive initials when none given. */
  alt?: string;
  /** Explicit initials to show as fallback. Derived from `name` when omitted. */
  initials?: string;
  /** Full name used to derive initials when `initials` is not provided. */
  name?: string;
  /** Size on the xs/sm/md/lg/xl scale. Defaults to `"md"`. */
  size?: AvatarSize;
  /** Shape. Defaults to `"circle"`. */
  shape?: AvatarShape;
  /** Renders a presence status dot when set. */
  status?: AvatarStatus;
}

function deriveInitials(name?: string, alt?: string): string {
  const source = (name ?? alt ?? "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    alt,
    initials,
    name,
    size = "md",
    shape = "circle",
    status,
    className,
    children,
    ...rest
  },
  ref
) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = !!src && !failed;
  const fallback = initials ?? deriveInitials(name, alt);

  return (
    <span
      ref={ref}
      className={cn(
        "nova-avatar",
        `nova-avatar--${size}`,
        `nova-avatar--${shape}`,
        className
      )}
      {...rest}
    >
      {showImage ? (
        <img
          className="nova-avatar__img"
          src={src}
          alt={alt ?? name ?? ""}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="nova-avatar__fallback" aria-hidden={!alt && !name}>
          {children ?? (fallback || null)}
        </span>
      )}
      {status && (
        <span
          className={cn("nova-avatar__status", `nova-avatar__status--${status}`)}
          role="status"
          aria-label={status}
        />
      )}
    </span>
  );
});
