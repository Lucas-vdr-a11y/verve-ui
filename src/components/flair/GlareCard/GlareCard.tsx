import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./GlareCard.css";

export interface GlareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max tilt (deg) applied toward the cursor. Defaults `12`. */
  tilt?: number;
  /** Show the iridescent holographic sheen layer. Defaults `true`. */
  holographic?: boolean;
  children?: React.ReactNode;
}

/**
 * A card that tilts toward the cursor while a bright glare highlight and an
 * iridescent holographic sheen sweep across its surface following the pointer
 * (the Aceternity glare card). Pointer position drives CSS variables for both
 * the rotation and the glare/sheen gradient positions.
 *
 * Under reduced motion, tilt is disabled and the glare stays centered & dimmed.
 */
export const GlareCard = forwardRef<HTMLDivElement, GlareCardProps>(
  function GlareCard(
    {
      tilt = 12,
      holographic = true,
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
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        const node = innerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        node.style.setProperty("--nova-glare-x", `${(px * 100).toFixed(2)}%`);
        node.style.setProperty("--nova-glare-y", `${(py * 100).toFixed(2)}%`);
        if (!reduced) {
          node.style.setProperty(
            "--nova-glare-rx",
            `${((0.5 - py) * tilt).toFixed(2)}deg`
          );
          node.style.setProperty(
            "--nova-glare-ry",
            `${((px - 0.5) * tilt).toFixed(2)}deg`
          );
        }
      },
      [onPointerMove, reduced, tilt]
    );

    const setActive = useCallback((on: boolean) => {
      const node = innerRef.current;
      if (!node) return;
      node.style.setProperty("--nova-glare-opacity", on ? "1" : "0");
      if (!on) {
        node.style.setProperty("--nova-glare-rx", "0deg");
        node.style.setProperty("--nova-glare-ry", "0deg");
      }
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
          "nova-glare-card",
          holographic && "nova-glare-card--holo",
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={style}
        {...rest}
      >
        <div className="nova-glare-card__content">{children}</div>
        <div className="nova-glare-card__glare" aria-hidden="true" />
        {holographic && (
          <div className="nova-glare-card__sheen" aria-hidden="true" />
        )}
      </div>
    );
  }
);
