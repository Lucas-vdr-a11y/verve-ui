import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./SpotlightCard.css";

export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius (px) of the spotlight glow. Defaults `220`. */
  size?: number;
  /** Spotlight color (any CSS color). Defaults to a brand-tinted glow. */
  color?: string;
  /** Light up the border under the cursor too. Defaults `true`. */
  borderGlow?: boolean;
  children?: React.ReactNode;
}

/**
 * A card with a radial spotlight that follows the cursor inside it (the
 * Vercel/Next.js hover effect), with an optional border highlight that tracks
 * the same point. Pointer position is written to CSS variables; the glow fades
 * in/out via opacity so there is no work when the pointer is away.
 *
 * Purely a visual effect — non-interactive content can sit inside. SSR-safe.
 */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard(
    {
      size = 220,
      color,
      borderGlow = true,
      className,
      children,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      style,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        const node = innerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty(
          "--nova-spotlight-x",
          `${event.clientX - rect.left}px`
        );
        node.style.setProperty(
          "--nova-spotlight-y",
          `${event.clientY - rect.top}px`
        );
      },
      [onPointerMove]
    );

    const setActive = useCallback((on: boolean) => {
      innerRef.current?.style.setProperty(
        "--nova-spotlight-opacity",
        on ? "1" : "0"
      );
    }, []);

    const handlePointerEnter = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        setActive(true);
      },
      [onPointerEnter, setActive]
    );

    const handlePointerLeave = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        setActive(false);
      },
      [onPointerLeave, setActive]
    );

    return (
      <div
        ref={innerRef}
        className={cn(
          "nova-spotlight",
          borderGlow && "nova-spotlight--border",
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          {
            "--nova-spotlight-size": `${size}px`,
            ...(color ? { "--nova-spotlight-color": color } : null),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-spotlight__content">{children}</div>
      </div>
    );
  }
);
