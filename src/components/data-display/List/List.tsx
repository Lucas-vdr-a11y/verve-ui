import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./List.css";

export type ListVariant = "ordered" | "unordered" | "plain";

export interface ListProps extends React.HTMLAttributes<HTMLElement> {
  /** Marker style / element. `ordered` → ol, others → ul. Defaults to `"plain"`. */
  variant?: ListVariant;
  /** Add dividers between items. */
  divided?: boolean;
}

export const List = forwardRef<HTMLElement, ListProps>(function List(
  { variant = "plain", divided = false, className, children, ...rest },
  ref
) {
  const Tag = variant === "ordered" ? "ol" : "ul";
  return (
    <Tag
      ref={ref as React.Ref<HTMLOListElement & HTMLUListElement>}
      className={cn(
        "nova-list",
        `nova-list--${variant}`,
        divided && "nova-list--divided",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Leading slot (icon, avatar, marker). */
  leading?: React.ReactNode;
  /** Trailing slot (meta, action, chevron). */
  trailing?: React.ReactNode;
  /** Render as an interactive option (button semantics, hover, focus). */
  interactive?: boolean;
  /** Marks an interactive item as selected. */
  selected?: boolean;
  /** Disable an interactive item. */
  disabled?: boolean;
  /** Click handler — implies interactive styling when set. */
  onSelect?: (event: React.MouseEvent<HTMLLIElement>) => void;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    {
      leading,
      trailing,
      interactive = false,
      selected = false,
      disabled = false,
      onSelect,
      onClick,
      onKeyDown,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const isInteractive = interactive || !!onSelect;

    const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
      if (disabled) return;
      onSelect?.(e);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
      onKeyDown?.(e);
      if (disabled || !isInteractive) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Route through the same click path so onSelect + onClick fire once.
        e.currentTarget.click();
      }
    };

    return (
      <li
        ref={ref}
        className={cn(
          "nova-list__item",
          isInteractive && "nova-list__item--interactive",
          selected && "nova-list__item--selected",
          disabled && "nova-list__item--disabled",
          className
        )}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-selected={isInteractive ? selected : undefined}
        aria-disabled={isInteractive && disabled ? true : undefined}
        onClick={isInteractive ? handleClick : onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {leading && <span className="nova-list__leading">{leading}</span>}
        <span className="nova-list__content">{children}</span>
        {trailing && <span className="nova-list__trailing">{trailing}</span>}
      </li>
    );
  }
);
