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
import "./Collapsible.css";

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
  triggerId: string;
  contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Collapsible>.`);
  }
  return ctx;
}

export interface CollapsibleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the next open state when toggled. */
  onChange?: (open: boolean) => void;
  /** Prevent toggling. */
  disabled?: boolean;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    {
      open: openProp,
      defaultOpen = false,
      onChange,
      disabled = false,
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

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !open;
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    }, [disabled, open, isControlled, onChange]);

    const ctx = useMemo<CollapsibleContextValue>(
      () => ({
        open,
        disabled,
        toggle,
        triggerId: `${baseId}-trigger`,
        contentId: `${baseId}-content`,
      }),
      [open, disabled, toggle, baseId]
    );

    return (
      <CollapsibleContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn("nova-collapsible", className)}
          data-state={open ? "open" : "closed"}
          {...rest}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);

export interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger({ className, children, onClick, ...rest }, ref) {
  const { open, disabled, toggle, triggerId, contentId } =
    useCollapsibleContext("CollapsibleTrigger");

  return (
    <button
      ref={ref}
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={cn("nova-collapsible__trigger", "nova-focusable", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface CollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CollapsibleContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent({ className, children, ...rest }, ref) {
  const { open, triggerId, contentId } =
    useCollapsibleContext("CollapsibleContent");

  return (
    <div
      ref={ref}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn("nova-collapsible__content", className)}
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      {...rest}
    >
      <div className="nova-collapsible__content-clip">
        <div
          className="nova-collapsible__content-inner"
          {...(!open ? { inert: "true" } : {})}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
