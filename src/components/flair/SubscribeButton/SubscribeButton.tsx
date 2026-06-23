import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./SubscribeButton.css";

export interface SubscribeButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled subscribed state. Omit for uncontrolled. */
  subscribed?: boolean;
  /** Initial subscribed state when uncontrolled. Defaults `false`. */
  defaultSubscribed?: boolean;
  /** Called with the next subscribed state on toggle. */
  onChange?: (subscribed: boolean) => void;
  /** Label shown when not subscribed. Defaults `"Subscribe"`. */
  idleLabel?: React.ReactNode;
  /** Label shown when subscribed. Defaults `"Subscribed"`. */
  subscribedLabel?: React.ReactNode;
}

const POP_MS = 600;

/**
 * An animated subscribe/follow button that morphs its label and color on
 * subscribe while a check pops in, and reverses cleanly on unsubscribe. The
 * check-pop animation flag is cleared via a tracked timer on unmount.
 * Controlled via `subscribed` or uncontrolled via `defaultSubscribed`.
 *
 * Real `<button>` with `aria-pressed`. The pop is skipped under reduced motion;
 * the state still changes instantly.
 */
export const SubscribeButton = forwardRef<
  HTMLButtonElement,
  SubscribeButtonProps
>(function SubscribeButton(
  {
    subscribed: subProp,
    defaultSubscribed = false,
    onChange,
    idleLabel = "Subscribe",
    subscribedLabel = "Subscribed",
    className,
    onClick,
    type,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();
  const isControlled = subProp !== undefined;
  const [internal, setInternal] = useState(defaultSubscribed);
  const subscribed = isControlled ? subProp : internal;

  const [popping, setPopping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const next = !subscribed;
      if (!isControlled) setInternal(next);
      onChange?.(next);

      if (next && !reduced) {
        setPopping(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setPopping(false), POP_MS);
      }
    },
    [isControlled, onChange, onClick, reduced, subscribed]
  );

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "nova-subscribe",
        subscribed && "nova-subscribe--on",
        popping && "nova-subscribe--pop",
        className
      )}
      onClick={handleClick}
      aria-pressed={subscribed}
      {...rest}
    >
      <span className="nova-subscribe__check" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            className="nova-subscribe__check-path"
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="nova-subscribe__label">
        {subscribed ? subscribedLabel : idleLabel}
      </span>
    </button>
  );
});
