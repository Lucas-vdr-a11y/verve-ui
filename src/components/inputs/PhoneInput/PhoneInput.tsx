import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./PhoneInput.css";

export type PhoneInputSize = "sm" | "md" | "lg";

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 code, e.g. "US". */
  iso2: string;
  /** Display name, e.g. "United States". */
  name: string;
  /** International dial code without the leading "+", e.g. "1". */
  dialCode: string;
  /** Flag emoji. */
  flag: string;
}

export interface PhoneInputValue {
  /** ISO 3166-1 alpha-2 code of the selected country. */
  country: string;
  /** Dial code (no leading "+"), e.g. "1". */
  dialCode: string;
  /** National number digits the user typed (no dial code, no formatting). */
  number: string;
  /** Best-effort E.164 string, e.g. "+12025550123". */
  e164: string;
}

export interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: PhoneInputSize;
  /** Marks the field as invalid; wires `aria-invalid` and error styling. */
  invalid?: boolean;
  /** Controlled value. */
  value?: PhoneInputValue;
  /** Uncontrolled initial value. */
  defaultValue?: Partial<PhoneInputValue>;
  /** Called with the full aggregate value whenever country or number changes. */
  onChange?: (value: PhoneInputValue) => void;
  /** Default country (ISO2) when none is provided. Defaults to `"US"`. */
  defaultCountry?: string;
  /** Override the built-in country list. */
  countries?: PhoneCountry[];
}

/** A small, dependency-free list of ~30 common countries. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: "US", name: "United States", dialCode: "1", flag: "🇺🇸" },
  { iso2: "CA", name: "Canada", dialCode: "1", flag: "🇨🇦" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44", flag: "🇬🇧" },
  { iso2: "IE", name: "Ireland", dialCode: "353", flag: "🇮🇪" },
  { iso2: "FR", name: "France", dialCode: "33", flag: "🇫🇷" },
  { iso2: "DE", name: "Germany", dialCode: "49", flag: "🇩🇪" },
  { iso2: "NL", name: "Netherlands", dialCode: "31", flag: "🇳🇱" },
  { iso2: "BE", name: "Belgium", dialCode: "32", flag: "🇧🇪" },
  { iso2: "ES", name: "Spain", dialCode: "34", flag: "🇪🇸" },
  { iso2: "PT", name: "Portugal", dialCode: "351", flag: "🇵🇹" },
  { iso2: "IT", name: "Italy", dialCode: "39", flag: "🇮🇹" },
  { iso2: "CH", name: "Switzerland", dialCode: "41", flag: "🇨🇭" },
  { iso2: "AT", name: "Austria", dialCode: "43", flag: "🇦🇹" },
  { iso2: "SE", name: "Sweden", dialCode: "46", flag: "🇸🇪" },
  { iso2: "NO", name: "Norway", dialCode: "47", flag: "🇳🇴" },
  { iso2: "DK", name: "Denmark", dialCode: "45", flag: "🇩🇰" },
  { iso2: "FI", name: "Finland", dialCode: "358", flag: "🇫🇮" },
  { iso2: "PL", name: "Poland", dialCode: "48", flag: "🇵🇱" },
  { iso2: "RU", name: "Russia", dialCode: "7", flag: "🇷🇺" },
  { iso2: "UA", name: "Ukraine", dialCode: "380", flag: "🇺🇦" },
  { iso2: "TR", name: "Turkey", dialCode: "90", flag: "🇹🇷" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971", flag: "🇦🇪" },
  { iso2: "IN", name: "India", dialCode: "91", flag: "🇮🇳" },
  { iso2: "CN", name: "China", dialCode: "86", flag: "🇨🇳" },
  { iso2: "JP", name: "Japan", dialCode: "81", flag: "🇯🇵" },
  { iso2: "KR", name: "South Korea", dialCode: "82", flag: "🇰🇷" },
  { iso2: "SG", name: "Singapore", dialCode: "65", flag: "🇸🇬" },
  { iso2: "AU", name: "Australia", dialCode: "61", flag: "🇦🇺" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64", flag: "🇳🇿" },
  { iso2: "BR", name: "Brazil", dialCode: "55", flag: "🇧🇷" },
  { iso2: "MX", name: "Mexico", dialCode: "52", flag: "🇲🇽" },
  { iso2: "ZA", name: "South Africa", dialCode: "27", flag: "🇿🇦" },
];

/** Keep only digits from a string. */
function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Format a national number loosely for readability: groups of 3-3-4, falling
 * back to 2/3/4 sized chunks. This is intentionally light — not locale-perfect.
 */
function formatNational(digits: string): string {
  const d = digits.slice(0, 15);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 10)
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)} ${d.slice(10)}`;
}

function buildValue(country: PhoneCountry, number: string): PhoneInputValue {
  const num = digitsOnly(number);
  return {
    country: country.iso2,
    dialCode: country.dialCode,
    number: num,
    e164: num ? `+${country.dialCode}${num}` : "",
  };
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      size = "md",
      invalid = false,
      value,
      defaultValue,
      onChange,
      defaultCountry = "US",
      countries = PHONE_COUNTRIES,
      disabled,
      className,
      id: idProp,
      placeholder,
      ...rest
    },
    ref
  ) {
    const isControlled = value !== undefined;

    const findCountry = (iso2?: string) =>
      countries.find((c) => c.iso2 === iso2) ?? countries[0]!;

    const [internal, setInternal] = useState<PhoneInputValue>(() =>
      buildValue(
        findCountry(defaultValue?.country ?? defaultCountry),
        defaultValue?.number ?? ""
      )
    );

    const current = isControlled ? value : internal;
    const currentCountry = findCountry(current.country);

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const reactId = useId();
    const baseId = idProp ?? `nova-phone-${reactId}`;
    const listId = `${baseId}-list`;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const displayNumber = useMemo(
      () => formatNational(current.number),
      [current.number]
    );

    const emit = (next: PhoneInputValue) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const selectCountry = (c: PhoneCountry) => {
      emit(buildValue(c, current.number));
      setOpen(false);
      setActiveIndex(-1);
      triggerRef.current?.focus();
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      emit(buildValue(currentCountry, e.target.value));
    };

    // Keep the active option in view.
    useEffect(() => {
      if (!open || activeIndex < 0) return;
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${activeIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    // Click-outside to close.
    useEffect(() => {
      if (!open) return;
      const handle = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    const move = (from: number, dir: 1 | -1) => {
      if (countries.length === 0) return -1;
      return (from + dir + countries.length) % countries.length;
    };

    const handleTriggerKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>
    ) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setActiveIndex(
              Math.max(
                0,
                countries.findIndex((c) => c.iso2 === current.country)
              )
            );
          } else {
            setActiveIndex((i) => move(i, 1));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (open) setActiveIndex((i) => move(i, -1));
          break;
        case "Enter":
        case " ":
          if (open && activeIndex >= 0) {
            e.preventDefault();
            selectCountry(countries[activeIndex]!);
          } else if (!open) {
            e.preventDefault();
            setOpen(true);
            setActiveIndex(
              Math.max(
                0,
                countries.findIndex((c) => c.iso2 === current.country)
              )
            );
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
            setActiveIndex(-1);
          }
          break;
        default:
          break;
      }
    };

    const activeId =
      open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined;

    return (
      <div
        ref={rootRef}
        className={cn(
          "nova-phone",
          `nova-phone--${size}`,
          invalid && "nova-phone--invalid",
          disabled && "nova-phone--disabled",
          className
        )}
        data-disabled={disabled || undefined}
      >
        <button
          ref={triggerRef}
          type="button"
          className="nova-phone__trigger nova-focusable"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeId}
          aria-label={`Country: ${currentCountry.name} (+${currentCountry.dialCode})`}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
            setActiveIndex(
              Math.max(
                0,
                countries.findIndex((c) => c.iso2 === current.country)
              )
            );
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="nova-phone__flag" aria-hidden="true">
            {currentCountry.flag}
          </span>
          <span className="nova-phone__dial">+{currentCountry.dialCode}</span>
          <span className="nova-phone__chevron" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <input
          {...rest}
          ref={ref}
          id={baseId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className="nova-phone__field nova-focusable"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={displayNumber}
          onChange={handleNumberChange}
          placeholder={placeholder ?? "Phone number"}
        />

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Select country"
            className="nova-phone__list"
          >
            {countries.map((c, index) => {
              const active = index === activeIndex;
              const selected = c.iso2 === current.country;
              return (
                <li
                  key={c.iso2}
                  id={`${baseId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "nova-phone__option",
                    active && "nova-phone__option--active"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCountry(c);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="nova-phone__option-flag" aria-hidden="true">
                    {c.flag}
                  </span>
                  <span className="nova-phone__option-name">{c.name}</span>
                  <span className="nova-phone__option-dial">+{c.dialCode}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
