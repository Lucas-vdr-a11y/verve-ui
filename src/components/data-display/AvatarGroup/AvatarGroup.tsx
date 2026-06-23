import { forwardRef, Children, isValidElement, cloneElement } from "react";
import { cn } from "../../../utils/cn";
import { Avatar, type AvatarProps, type AvatarSize } from "../Avatar";
import "./AvatarGroup.css";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before collapsing into a `+N` overflow chip. */
  max?: number;
  /** Size applied to all avatars and the overflow chip. Defaults to `"md"`. */
  size?: AvatarSize;
  /** Custom overflow renderer given the hidden count. */
  renderOverflow?: (overflow: number) => React.ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    { max, size = "md", renderOverflow, className, children, ...rest },
    ref
  ) {
    const items = Children.toArray(children).filter(isValidElement);
    const total = items.length;
    const limit = max && max > 0 ? max : total;
    const visible = items.slice(0, limit);
    const overflow = total - visible.length;

    return (
      <div
        ref={ref}
        className={cn("nova-avatar-group", `nova-avatar-group--${size}`, className)}
        role="group"
        {...rest}
      >
        {visible.map((child, i) => (
          <span className="nova-avatar-group__item" key={child.key ?? i}>
            {isValidElement<AvatarProps>(child)
              ? cloneElement(child, { size: child.props.size ?? size })
              : child}
          </span>
        ))}
        {overflow > 0 && (
          <span className="nova-avatar-group__item">
            {renderOverflow ? (
              renderOverflow(overflow)
            ) : (
              <Avatar
                size={size}
                aria-label={`${overflow} more`}
                className="nova-avatar-group__overflow"
              >
                +{overflow}
              </Avatar>
            )}
          </span>
        )}
      </div>
    );
  }
);
