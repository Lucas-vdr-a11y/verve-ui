import { forwardRef, useCallback, useId, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import { RadioContext, type RadioSize } from "./RadioContext";
import "./Radio.css";

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Shared form name for all radios in the group. Auto-generated if omitted. */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  /** Fires with the newly selected value. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Size applied to every radio in the group. Defaults to `"md"`. */
  size?: RadioSize;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Lay options out in a row instead of a column. */
  orientation?: "vertical" | "horizontal";
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      name,
      value,
      defaultValue,
      onChange,
      size = "md",
      disabled,
      orientation = "vertical",
      className,
      children,
      ...rest
    },
    ref
  ) {
    const autoName = useId();
    const resolvedName = name ?? `nova-radio-${autoName}`;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue
    );
    const currentValue = isControlled ? value : internalValue;

    const handleChange = useCallback(
      (next: string, event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next, event);
      },
      [isControlled, onChange]
    );

    const ctx = useMemo(
      () => ({
        name: resolvedName,
        value: currentValue,
        onChange: handleChange,
        size,
        disabled,
      }),
      [resolvedName, currentValue, handleChange, size, disabled]
    );

    return (
      <RadioContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          aria-disabled={disabled || undefined}
          className={cn(
            "nova-radio-group",
            `nova-radio-group--${orientation}`,
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </RadioContext.Provider>
    );
  }
);
