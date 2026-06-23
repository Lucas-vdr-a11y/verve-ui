import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Accordion.css";

export type AccordionType = "single" | "multiple";
export type AccordionVariant = "contained" | "separated" | "ghost";

interface AccordionContextValue {
  type: AccordionType;
  variant: AccordionVariant;
  values: string[];
  toggle: (value: string) => void;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Accordion>.`);
  }
  return ctx;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionItemContext(
  component: string
): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <AccordionItem>.`);
  }
  return ctx;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** `"single"` allows one open item, `"multiple"` allows many. Defaults to `"single"`. */
  type?: AccordionType;
  /** Visual style. Defaults to `"contained"`. */
  variant?: AccordionVariant;
  /** Controlled open value(s). A string for `single`, an array for `multiple`. */
  value?: string | string[];
  /** Initial open value(s) when uncontrolled. */
  defaultValue?: string | string[];
  /** Called with the new open value(s) when items toggle. */
  onChange?: (value: string | string[]) => void;
  /** For `single`, allow closing the open item by clicking it. Defaults to `true`. */
  collapsible?: boolean;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      type = "single",
      variant = "contained",
      value: valueProp,
      defaultValue,
      onChange,
      collapsible = true,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string[]>(() =>
      toArray(defaultValue)
    );
    const values = isControlled ? toArray(valueProp) : uncontrolled;

    const emit = useCallback(
      (next: string[]) => {
        if (!isControlled) setUncontrolled(next);
        onChange?.(type === "single" ? next[0] ?? "" : next);
      },
      [isControlled, onChange, type]
    );

    const toggle = useCallback(
      (itemValue: string) => {
        const isOpen = values.includes(itemValue);
        if (type === "single") {
          if (isOpen) {
            emit(collapsible ? [] : values);
          } else {
            emit([itemValue]);
          }
        } else {
          emit(
            isOpen
              ? values.filter((v) => v !== itemValue)
              : [...values, itemValue]
          );
        }
      },
      [values, type, collapsible, emit]
    );

    const ctx = useMemo<AccordionContextValue>(
      () => ({ type, variant, values, toggle, collapsible }),
      [type, variant, values, toggle, collapsible]
    );

    return (
      <AccordionContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(
            "nova-accordion",
            `nova-accordion--${variant}`,
            className
          )}
          data-type={type}
          {...rest}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

export interface AccordionItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "value"> {
  /** Unique value identifying this item. */
  value: string;
  /** Disable opening/closing this item. */
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    { value, disabled = false, className, children, ...rest },
    ref
  ) {
    const { values } = useAccordionContext("AccordionItem");
    const baseId = useId();
    const open = values.includes(value);

    const ctx = useMemo<AccordionItemContextValue>(
      () => ({
        value,
        open,
        disabled,
        triggerId: `${baseId}-trigger`,
        panelId: `${baseId}-panel`,
      }),
      [value, open, disabled, baseId]
    );

    return (
      <AccordionItemContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(
            "nova-accordion__item",
            open && "nova-accordion__item--open",
            disabled && "nova-accordion__item--disabled",
            className
          )}
          data-state={open ? "open" : "closed"}
          {...rest}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
}

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(function AccordionTrigger(
  { icon, className, children, onClick, onKeyDown, ...rest },
  ref
) {
  const { toggle } = useAccordionContext("AccordionTrigger");
  const { value, open, disabled, triggerId, panelId } =
    useAccordionItemContext("AccordionTrigger");

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;

      const root = event.currentTarget.closest(".nova-accordion");
      if (!root) return;
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          ".nova-accordion__trigger:not(:disabled)"
        )
      );
      const idx = triggers.indexOf(event.currentTarget);
      if (idx === -1) return;

      let next = -1;
      if (event.key === "ArrowDown") next = (idx + 1) % triggers.length;
      else if (event.key === "ArrowUp")
        next = (idx - 1 + triggers.length) % triggers.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = triggers.length - 1;

      if (next !== -1) {
        event.preventDefault();
        triggers[next]?.focus();
      }
    },
    []
  );

  return (
    <h3 className="nova-accordion__heading">
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className={cn(
          "nova-accordion__trigger",
          "nova-focusable",
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) toggle(value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) handleKeyDown(event);
        }}
        {...rest}
      >
        {icon && (
          <span className="nova-accordion__trigger-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="nova-accordion__trigger-label">{children}</span>
        <span className="nova-accordion__chevron" aria-hidden="true">
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
    </h3>
  );
});

/** Alias for `AccordionTrigger`. */
export const AccordionHeader = AccordionTrigger;
export type AccordionHeaderProps = AccordionTriggerProps;

export interface AccordionPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ className, children, ...rest }, ref) {
    const { open, triggerId, panelId } =
      useAccordionItemContext("AccordionPanel");

    return (
      <div
        ref={ref}
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn("nova-accordion__panel", className)}
        data-state={open ? "open" : "closed"}
        aria-hidden={!open}
        {...rest}
      >
        <div className="nova-accordion__panel-clip">
          {/* `inert` keeps collapsed content out of the tab order. */}
          <div
            className="nova-accordion__panel-inner"
            {...(!open ? { inert: "true" } : {})}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
