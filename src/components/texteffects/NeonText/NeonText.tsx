import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./NeonText.css";

export interface NeonTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Neon glow colour (any CSS colour). Defaults to the brand colour. */
  color?: string;
  /** Add a randomised flicker like a failing neon sign. Defaults `false`. */
  flicker?: boolean;
  /** Glow size multiplier. Defaults `1`. */
  intensity?: number;
  children?: React.ReactNode;
}

/**
 * NeonText — glowing neon-sign text built from stacked `text-shadow` halos.
 * Optional flicker animates a few stops to mimic a buzzing tube. Pure CSS;
 * SSR-safe. Under reduced-motion the flicker is disabled and the sign stays
 * lit steadily.
 */
export const NeonText = forwardRef<HTMLSpanElement, NeonTextProps>(
  function NeonText(
    {
      color = "var(--nova-brand-400)",
      flicker = false,
      intensity = 1,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          "nova-neon-text",
          flicker && "nova-neon-text--flicker",
          className
        )}
        style={
          {
            "--nova-neon-color": color,
            "--nova-neon-intensity": intensity,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </span>
    );
  }
);
