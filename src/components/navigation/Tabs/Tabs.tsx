import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Tabs.css";

export type TabsVariant = "line" | "solid" | "soft";
export type TabsSize = "sm" | "md" | "lg";
export type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  baseId: string;
  value: string | undefined;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  setValue: (value: string) => void;
  registerTab: (value: string) => void;
  tabValues: React.MutableRefObject<string[]>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Tabs>.`);
  }
  return ctx;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled selected tab value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value when the selection changes. */
  onChange?: (value: string) => void;
  /** Visual style. Defaults to `"line"`. */
  variant?: TabsVariant;
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: TabsSize;
  /** Layout orientation. Defaults to `"horizontal"`. */
  orientation?: TabsOrientation;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue,
    onChange,
    variant = "line",
    size = "md",
    orientation = "horizontal",
    className,
    children,
    ...rest
  },
  ref
) {
  const baseId = useId();
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(
    defaultValue
  );
  const value = isControlled ? valueProp : uncontrolled;
  const tabValues = useRef<string[]>([]);

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const registerTab = useCallback((tabValue: string) => {
    if (!tabValues.current.includes(tabValue)) {
      tabValues.current.push(tabValue);
    }
  }, []);

  const ctx = useMemo<TabsContextValue>(
    () => ({
      baseId,
      value,
      variant,
      size,
      orientation,
      setValue,
      registerTab,
      tabValues,
    }),
    [baseId, value, variant, size, orientation, setValue, registerTab]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cn(
          "nova-tabs",
          `nova-tabs--${variant}`,
          `nova-tabs--${size}`,
          `nova-tabs--${orientation}`,
          className
        )}
        data-orientation={orientation}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the tablist. */
  "aria-label"?: string;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { className, children, onKeyDown, ...rest },
  ref
) {
  const { orientation, tabValues, value, setValue } =
    useTabsContext("TabList");
  const innerRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const values = tabValues.current;
      if (values.length === 0) return;

      const horizontal = orientation === "horizontal";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";

      let nextValue: string | undefined;
      const current = value ?? values[0];
      const idx = values.indexOf(current);

      if (event.key === nextKey) {
        nextValue = values[(idx + 1) % values.length];
      } else if (event.key === prevKey) {
        nextValue = values[(idx - 1 + values.length) % values.length];
      } else if (event.key === "Home") {
        nextValue = values[0];
      } else if (event.key === "End") {
        nextValue = values[values.length - 1];
      }

      if (nextValue !== undefined) {
        event.preventDefault();
        setValue(nextValue);
        const node = innerRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-value="${CSS.escape(nextValue)}"]`
        );
        node?.focus();
      }
    },
    [onKeyDown, orientation, tabValues, value, setValue]
  );

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="tablist"
      aria-orientation={orientation}
      className={cn("nova-tabs__list", className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface TabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Unique value identifying this tab. */
  value: string;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, icon, className, children, disabled, onClick, ...rest },
  ref
) {
  const { baseId, value: selected, setValue, registerTab } =
    useTabsContext("Tab");

  if (!disabled) registerTab(value);

  const isSelected = selected === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      data-tab-value={value}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={cn(
        "nova-tabs__tab",
        "nova-focusable",
        isSelected && "nova-tabs__tab--selected",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setValue(value);
      }}
      {...rest}
    >
      {icon && (
        <span className="nova-tabs__tab-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children != null && (
        <span className="nova-tabs__tab-label">{children}</span>
      )}
    </button>
  );
});

export interface TabPanelsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabPanels = forwardRef<HTMLDivElement, TabPanelsProps>(
  function TabPanels({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("nova-tabs__panels", className)} {...rest}>
        {children}
      </div>
    );
  }
);

export interface TabPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "value"> {
  /** Value of the tab this panel belongs to. */
  value: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel({ value, className, children, ...rest }, ref) {
    const { baseId, value: selected } = useTabsContext("TabPanel");
    const isSelected = selected === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        hidden={!isSelected}
        tabIndex={0}
        className={cn("nova-tabs__panel", "nova-focusable", className)}
        {...rest}
      >
        {isSelected ? children : null}
      </div>
    );
  }
);
