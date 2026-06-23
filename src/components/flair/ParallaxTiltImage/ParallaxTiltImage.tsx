import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ParallaxTiltImage.css";

export interface ParallaxTiltImageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL for the background layer. */
  src: string;
  /** Alt text for the background image. */
  alt?: string;
  /** Max tilt (deg) toward the cursor. Defaults `14`. */
  tilt?: number;
  /** Parallax depth (px) the foreground lifts beyond the background. Defaults `40`. */
  depth?: number;
  /** Foreground content that floats above the image. */
  children?: React.ReactNode;
}

/**
 * An image card with multi-layer parallax tilt: the card rotates toward the
 * cursor in 3D while the background image and the foreground content translate
 * along Z by different amounts, so the foreground "lifts" more than the image
 * for a layered depth effect. Pointer position drives rotation + per-layer
 * shift through CSS variables.
 *
 * Under reduced motion the tilt/parallax is disabled and the card stays flat.
 */
export const ParallaxTiltImage = forwardRef<
  HTMLDivElement,
  ParallaxTiltImageProps
>(function ParallaxTiltImage(
  {
    src,
    alt = "",
    tilt = 14,
    depth = 40,
    className,
    children,
    onPointerMove,
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
      if (reduced) return;
      const node = innerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--nova-pt-rx", `${(-py * tilt).toFixed(2)}deg`);
      node.style.setProperty("--nova-pt-ry", `${(px * tilt).toFixed(2)}deg`);
      node.style.setProperty("--nova-pt-mx", `${(px * 2).toFixed(3)}`);
      node.style.setProperty("--nova-pt-my", `${(py * 2).toFixed(3)}`);
    },
    [onPointerMove, reduced, tilt]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      const node = innerRef.current;
      if (!node) return;
      node.style.setProperty("--nova-pt-rx", "0deg");
      node.style.setProperty("--nova-pt-ry", "0deg");
      node.style.setProperty("--nova-pt-mx", "0");
      node.style.setProperty("--nova-pt-my", "0");
    },
    [onPointerLeave]
  );

  return (
    <div
      ref={innerRef}
      className={cn("nova-parallax-tilt", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--nova-pt-depth": `${depth}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-parallax-tilt__stage">
        <img
          className="nova-parallax-tilt__image"
          src={src}
          alt={alt}
          draggable={false}
        />
        {children != null && (
          <div className="nova-parallax-tilt__content">{children}</div>
        )}
      </div>
    </div>
  );
});
