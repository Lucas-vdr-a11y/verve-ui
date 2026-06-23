import { forwardRef, useCallback, useId, useState } from "react";
import { cn } from "../../../utils/cn";
import "./Disclosure.css";

export interface DisclosureRenderProps {
  /** Whether the content is currently shown. */
  open: boolean;
  /** Toggle the open state. */
  toggle: () => void;
  /** Props to spread on the toggle button for correct a11y wiring. */
  triggerProps: {
    id: string;
    type: "button";
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  };
  /** Props to spread on the content element for correct a11y wiring. */
  contentProps: {
    id: string;
    role: "region";
    "aria-labelledby": string;
    hidden: boolean;
  };
}

export interface DisclosureProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "children"
  > {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the next open state when toggled. */
  onChange?: (open: boolean) => void;
  /** Label for the built-in trigger. Ignored when using the render-prop form. */
  label?: React.ReactNode;
  /** Label shown on the built-in trigger while open. Defaults to `label`. */
  openLabel?: React.ReactNode;
  /**
   * Render-prop children for full control, or plain nodes shown/hidden by the
   * built-in trigger.
   */
  children?:
    | React.ReactNode
    | ((props: DisclosureRenderProps) => React.ReactNode);
}

export const Disclosure = forwardRef<HTMLDivElement, DisclosureProps>(
  function Disclosure(
    {
      open: openProp,
      defaultOpen = false,
      onChange,
      label = "Show more",
      openLabel,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const baseId = useId();
    const isControlled = openProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const open = isControlled ? openProp : uncontrolled;

    const triggerId = `${baseId}-trigger`;
    const contentId = `${baseId}-content`;

    const toggle = useCallback(() => {
      const next = !open;
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    }, [open, isControlled, onChange]);

    if (typeof children === "function") {
      const renderProps: DisclosureRenderProps = {
        open,
        toggle,
        triggerProps: {
          id: triggerId,
          type: "button",
          "aria-expanded": open,
          "aria-controls": contentId,
          onClick: toggle,
        },
        contentProps: {
          id: contentId,
          role: "region",
          "aria-labelledby": triggerId,
          hidden: !open,
        },
      };
      return (
        <div
          ref={ref}
          className={cn("nova-disclosure", className)}
          data-state={open ? "open" : "closed"}
          {...rest}
        >
          {children(renderProps)}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("nova-disclosure", className)}
        data-state={open ? "open" : "closed"}
        {...rest}
      >
        <button
          id={triggerId}
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          className="nova-disclosure__trigger nova-focusable"
          onClick={toggle}
        >
          <span className="nova-disclosure__label">
            {open ? openLabel ?? label : label}
          </span>
          <span className="nova-disclosure__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="m6 9 6 6 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className="nova-disclosure__content"
          hidden={!open}
        >
          {children}
        </div>
      </div>
    );
  }
);
