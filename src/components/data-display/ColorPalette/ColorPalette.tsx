import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import "./ColorPalette.css";

export interface PaletteSwatch {
  /** CSS color value used for the swatch fill (e.g. "#6366f1", "var(--x)"). */
  value: string;
  /** Display name / token name. */
  label?: React.ReactNode;
  /** Value shown + copied on click. Defaults to `value`. */
  copyValue?: string;
}

export interface PaletteScale {
  /** Scale heading (e.g. "Brand", "Gray"). */
  name: React.ReactNode;
  /** Swatches within this scale. */
  swatches: PaletteSwatch[];
}

export interface ColorPaletteProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** A flat list of swatches. Provide this OR `scales`. */
  swatches?: PaletteSwatch[];
  /** Grouped scales, each rendered under its own heading. */
  scales?: PaletteScale[];
  /** Copy the value to the clipboard on swatch click. Defaults to `true`. */
  copyable?: boolean;
  /** Size of each swatch tile. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
}

const CopiedBadge = () => (
  <span className="nova-color-palette__copied" aria-hidden="true">
    <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false">
      <path
        d="M3.5 8.5l3 3 6-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

function Swatch({
  swatch,
  copyable,
  copiedKey,
  onCopy,
  swatchKey,
}: {
  swatch: PaletteSwatch;
  copyable: boolean;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  swatchKey: string;
}) {
  const text = swatch.copyValue ?? swatch.value;
  const isCopied = copiedKey === swatchKey;

  const content = (
    <>
      <span
        className="nova-color-palette__swatch"
        style={{ background: swatch.value }}
        aria-hidden="true"
      >
        {isCopied && <CopiedBadge />}
      </span>
      <span className="nova-color-palette__meta">
        {swatch.label != null && (
          <span className="nova-color-palette__label">{swatch.label}</span>
        )}
        <span className="nova-color-palette__value">
          {isCopied ? "Copied" : text}
        </span>
      </span>
    </>
  );

  if (!copyable) {
    return <div className="nova-color-palette__item">{content}</div>;
  }

  return (
    <button
      type="button"
      className="nova-color-palette__item nova-color-palette__item--button nova-focusable"
      onClick={() => onCopy(swatchKey, text)}
      aria-label={`Copy ${text}`}
    >
      {content}
    </button>
  );
}

/**
 * ColorPalette — displays color swatches with labels + values, with copy-on-click
 * (clipboard guarded for SSR). Pass `swatches` for a flat grid or `scales` for
 * grouped token scales.
 */
export const ColorPalette = forwardRef<HTMLDivElement, ColorPaletteProps>(
  function ColorPalette(
    { swatches, scales, copyable = true, size = "md", className, ...rest },
    ref
  ) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      []
    );

    const handleCopy = useCallback((key: string, text: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedKey(key);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopiedKey(null), 1500);
        },
        () => {
          /* clipboard rejected — leave state unchanged */
        }
      );
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-color-palette",
          `nova-color-palette--${size}`,
          className
        )}
        {...rest}
      >
        {scales?.map((scale, si) => (
          <section key={si} className="nova-color-palette__scale">
            <h4 className="nova-color-palette__scale-name">{scale.name}</h4>
            <div className="nova-color-palette__grid">
              {scale.swatches.map((sw, i) => (
                <Swatch
                  key={i}
                  swatch={sw}
                  copyable={copyable}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                  swatchKey={`s${si}-${i}`}
                />
              ))}
            </div>
          </section>
        ))}

        {swatches && swatches.length > 0 && (
          <div className="nova-color-palette__grid">
            {swatches.map((sw, i) => (
              <Swatch
                key={i}
                swatch={sw}
                copyable={copyable}
                copiedKey={copiedKey}
                onCopy={handleCopy}
                swatchKey={`flat-${i}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
