import {
  forwardRef,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import "./Spoiler.css";

export type SpoilerMode = "blur" | "block";

export interface SpoilerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onReveal"> {
  /** How the hidden content is obscured. Defaults to `"blur"`. */
  mode?: SpoilerMode;
  /** Controlled hidden state. When set, the component is controlled. */
  hidden?: boolean;
  /** Initial hidden state for uncontrolled usage. Defaults to `true`. */
  defaultHidden?: boolean;
  /** Called when the user reveals the content. */
  onReveal?: () => void;
  /**
   * Allow hiding the content again after it has been revealed.
   * Defaults to `false` (reveal is one-way).
   */
  reHide?: boolean;
  /** Accessible label for the reveal control. Defaults to `"Reveal hidden content"`. */
  revealLabel?: string;
  /** The content to obscure. */
  children?: ReactNode;
}

/**
 * Spoiler — obscures sensitive content (spoilers, secrets) behind a blur or
 * solid block, revealing it on click. The whole region is an accessible button
 * while hidden so it is keyboard operable.
 */
export const Spoiler = forwardRef<HTMLSpanElement, SpoilerProps>(
  function Spoiler(
    {
      mode = "blur",
      hidden: hiddenProp,
      defaultHidden = true,
      onReveal,
      reHide = false,
      revealLabel = "Reveal hidden content",
      className,
      children,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const isControlled = hiddenProp !== undefined;
    const [internalHidden, setInternalHidden] = useState(defaultHidden);
    const isHidden = isControlled ? hiddenProp : internalHidden;

    const reveal = useCallback(() => {
      if (!isControlled) setInternalHidden(false);
      onReveal?.();
    }, [isControlled, onReveal]);

    const hide = useCallback(() => {
      if (!isControlled) setInternalHidden(true);
    }, [isControlled]);

    const toggle = useCallback(() => {
      if (isHidden) reveal();
      else if (reHide) hide();
    }, [isHidden, reveal, hide, reHide]);

    const interactive = isHidden || reHide;

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLSpanElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !interactive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      },
      [onKeyDown, interactive, toggle]
    );

    return (
      <span
        ref={ref}
        className={cn(
          "nova-spoiler",
          `nova-spoiler--${mode}`,
          isHidden ? "nova-spoiler--hidden" : "nova-spoiler--revealed",
          interactive && "nova-focusable",
          className
        )}
        data-state={isHidden ? "hidden" : "revealed"}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-pressed={interactive ? !isHidden : undefined}
        aria-label={isHidden ? revealLabel : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && interactive) toggle();
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span
          className="nova-spoiler__content"
          aria-hidden={isHidden || undefined}
          {...(isHidden ? { inert: "true" } : {})}
        >
          {children}
        </span>
      </span>
    );
  }
);
