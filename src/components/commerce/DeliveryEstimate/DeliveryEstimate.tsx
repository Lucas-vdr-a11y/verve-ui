import { forwardRef, useRef } from "react";
import { cn } from "../../../utils/cn";
import "./DeliveryEstimate.css";

export interface ShippingOption {
  /** Stable value committed via onChange. */
  value: string;
  /** Method name, e.g. "Standard", "Express". */
  label: string;
  /** Delivery window copy, e.g. "3–5 business days". */
  detail?: string;
  /** Formatted price, e.g. "Free" or "$9.99". */
  price?: React.ReactNode;
  /** Selectable but disabled. */
  disabled?: boolean;
}

export interface DeliveryEstimateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Estimated delivery date or window. A preformatted string, a single Date, or
   * a `[from, to]` tuple of Dates rendered as a range.
   */
  estimate?: string | Date | [Date, Date];
  /** Heading above the estimate. @default "Estimated delivery" */
  label?: string;
  /** BCP 47 locale for date formatting. @default "en-US" */
  locale?: string;
  /** Optional selectable shipping options. */
  options?: ShippingOption[];
  /** Controlled selected shipping option value. */
  value?: string;
  /** Called with the newly selected shipping option value. */
  onChange?: (value: string) => void;
}

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" aria-hidden="true" focusable="false">
    <path
      d="M2.5 6.5h10v8h-10z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 9h4l3 3v2.5h-7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="16.5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="16.5" cy="16.5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

function formatDate(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function renderEstimate(
  estimate: NonNullable<DeliveryEstimateProps["estimate"]>,
  locale: string,
): string {
  if (typeof estimate === "string") return estimate;
  if (Array.isArray(estimate)) {
    return `${formatDate(estimate[0], locale)} – ${formatDate(estimate[1], locale)}`;
  }
  return formatDate(estimate, locale);
}

/**
 * DeliveryEstimate — shows an estimated delivery date/window with a truck icon
 * and an optional radiogroup of shipping options to pick from.
 */
export const DeliveryEstimate = forwardRef<HTMLDivElement, DeliveryEstimateProps>(
  function DeliveryEstimate(
    {
      estimate,
      label = "Estimated delivery",
      locale = "en-US",
      options,
      value,
      onChange,
      className,
      ...rest
    },
    ref,
  ) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const opts = options ?? [];

    const enabledIndexes = opts
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled)
      .map(({ i }) => i);

    const select = (opt: ShippingOption) => {
      if (opt.disabled) return;
      if (opt.value !== value) onChange?.(opt.value);
    };

    const focusAndSelect = (index: number) => {
      refs.current[index]?.focus();
      select(opts[index]);
    };

    const moveFocus = (fromIndex: number, dir: 1 | -1) => {
      if (enabledIndexes.length === 0) return;
      const pos = enabledIndexes.indexOf(fromIndex);
      const start = pos === -1 ? (dir === 1 ? -1 : 0) : pos;
      const nextPos = (start + dir + enabledIndexes.length) % enabledIndexes.length;
      focusAndSelect(enabledIndexes[nextPos]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          moveFocus(index, 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          moveFocus(index, -1);
          break;
        case "Home":
          e.preventDefault();
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[0]);
          break;
        case "End":
          e.preventDefault();
          if (enabledIndexes.length) focusAndSelect(enabledIndexes[enabledIndexes.length - 1]);
          break;
        default:
          break;
      }
    };

    const hasSelection = opts.some((o) => o.value === value);

    return (
      <div ref={ref} className={cn("nova-delivery-estimate", className)} {...rest}>
        {estimate !== undefined && (
          <div className="nova-delivery-estimate__summary">
            <span className="nova-delivery-estimate__icon" aria-hidden="true">
              <TruckIcon />
            </span>
            <span className="nova-delivery-estimate__text">
              <span className="nova-delivery-estimate__label">{label}</span>
              <span className="nova-delivery-estimate__date">
                {renderEstimate(estimate, locale)}
              </span>
            </span>
          </div>
        )}

        {opts.length > 0 && (
          <div
            className="nova-delivery-estimate__options"
            role="radiogroup"
            aria-label="Shipping options"
          >
            {opts.map((opt, index) => {
              const checked = opt.value === value;
              const isTabStop = checked || (!hasSelection && index === enabledIndexes[0]);
              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-disabled={opt.disabled || undefined}
                  tabIndex={isTabStop ? 0 : -1}
                  className={cn(
                    "nova-delivery-estimate__option",
                    checked && "nova-delivery-estimate__option--selected",
                  )}
                  disabled={opt.disabled}
                  onClick={() => select(opt)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  <span className="nova-delivery-estimate__radio" aria-hidden="true" />
                  <span className="nova-delivery-estimate__option-text">
                    <span className="nova-delivery-estimate__option-label">{opt.label}</span>
                    {opt.detail && (
                      <span className="nova-delivery-estimate__option-detail">
                        {opt.detail}
                      </span>
                    )}
                  </span>
                  {opt.price !== undefined && (
                    <span className="nova-delivery-estimate__option-price">{opt.price}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
