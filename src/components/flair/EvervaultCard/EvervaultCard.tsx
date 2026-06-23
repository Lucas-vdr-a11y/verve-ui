import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./EvervaultCard.css";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/{}[]()=+-*&^%$#@!";

function randomString(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}

export interface EvervaultCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Content shown on top of the encrypted field (e.g. a label or icon). */
  children?: React.ReactNode;
  /** Number of scramble characters in the field. Defaults `1500`. */
  charCount?: number;
  /** Radius (px) of the cursor reveal mask. Defaults `180`. */
  revealRadius?: number;
}

/**
 * An "encrypt on hover" card (Aceternity Evervault): a dense field of random
 * characters constantly re-scrambles and is revealed only through a radial mask
 * that follows the cursor, over a brand gradient. The front content sits above.
 *
 * SSR-safe — the scramble interval runs in an effect and is cleared on unmount
 * / when not hovered. Under reduced motion the characters do not re-scramble.
 */
export const EvervaultCard = forwardRef<HTMLDivElement, EvervaultCardProps>(
  function EvervaultCard(
    {
      children,
      charCount = 1500,
      revealRadius = 180,
      className,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);
    const [hovered, setHovered] = useState(false);
    const [text, setText] = useState(() => randomString(charCount));

    // Re-scramble while hovered (skipped under reduced motion).
    useEffect(() => {
      if (!hovered || reduced) return;
      const id = window.setInterval(() => {
        setText(randomString(charCount));
      }, 60);
      return () => window.clearInterval(id);
    }, [hovered, reduced, charCount]);

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        const node = innerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty(
          "--nova-evervault-x",
          `${event.clientX - rect.left}px`
        );
        node.style.setProperty(
          "--nova-evervault-y",
          `${event.clientY - rect.top}px`
        );
      },
      [onPointerMove]
    );

    const handlePointerEnter = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        setHovered(true);
      },
      [onPointerEnter]
    );

    const handlePointerLeave = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        setHovered(false);
      },
      [onPointerLeave]
    );

    const mask = useMemo(
      () => `radial-gradient(${revealRadius}px circle at var(--nova-evervault-x) var(--nova-evervault-y), #000 0%, transparent 100%)`,
      [revealRadius]
    );

    return (
      <div
        ref={innerRef}
        className={cn("nova-evervault-card", className)}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...rest}
      >
        <div className="nova-evervault-card__gradient" aria-hidden="true" />
        <div
          className="nova-evervault-card__cipher"
          aria-hidden="true"
          style={{
            opacity: hovered ? 1 : 0,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          {text}
        </div>
        <div className="nova-evervault-card__content">{children}</div>
      </div>
    );
  }
);
