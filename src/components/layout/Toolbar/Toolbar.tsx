import { forwardRef, useCallback } from "react";
import { cn } from "../../../utils/cn";
import "./Toolbar.css";

export type ToolbarAlign = "start" | "center" | "end";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lay items out horizontally or vertically. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Allow items to wrap onto multiple lines. @default true */
  wrap?: boolean;
  /**
   * Enable roving arrow-key navigation between focusable controls in the
   * toolbar. @default false
   */
  keyboardNav?: boolean;
}

export interface ToolbarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Alignment region within the toolbar. @default "start" */
  align?: ToolbarAlign;
}

/** A focusable, enabled control inside the toolbar. */
function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hasAttribute("disabled")) return false;
  if (el.getAttribute("aria-disabled") === "true") return false;
  return el.tabIndex >= 0 || el.matches("a[href], button, input, select, textarea");
}

/**
 * Toolbar — a horizontal (or vertical) strip of control groups with
 * `start`/`center`/`end` alignment regions and optional wrapping. Carries
 * `role="toolbar"`. With `keyboardNav`, arrow keys move focus between the
 * enabled controls (Home/End jump to the ends).
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar(
    {
      orientation = "horizontal",
      wrap = true,
      keyboardNav = false,
      className,
      onKeyDown,
      children,
      ...rest
    },
    ref,
  ) {
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (!keyboardNav || event.defaultPrevented) return;

        const next = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
        const prev = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
        const { key } = event;
        if (key !== next && key !== prev && key !== "Home" && key !== "End") {
          return;
        }

        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>("*"),
        ).filter(isFocusable);
        if (items.length === 0) return;

        const current = items.indexOf(
          document.activeElement as HTMLElement,
        );
        let index: number;
        if (key === "Home") index = 0;
        else if (key === "End") index = items.length - 1;
        else if (key === next)
          index = current < 0 ? 0 : (current + 1) % items.length;
        else index = current <= 0 ? items.length - 1 : current - 1;

        event.preventDefault();
        items[index]?.focus();
      },
      [keyboardNav, orientation, onKeyDown],
    );

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-orientation={orientation}
        className={cn(
          "nova-toolbar",
          `nova-toolbar--${orientation}`,
          wrap && "nova-toolbar--wrap",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/**
 * ToolbarGroup — a cluster of related controls within a `Toolbar`, placed in a
 * `start`, `center` or `end` alignment region.
 */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  function ToolbarGroup({ align = "start", className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "nova-toolbar__group",
          `nova-toolbar__group--${align}`,
          className,
        )}
        {...rest}
      />
    );
  },
);

export interface ToolbarSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/** ToolbarSeparator — a visual divider between toolbar groups/items. */
export const ToolbarSeparator = forwardRef<
  HTMLDivElement,
  ToolbarSeparatorProps
>(function ToolbarSeparator({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={cn("nova-toolbar__separator", className)}
      {...rest}
    />
  );
});
