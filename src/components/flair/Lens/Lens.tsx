import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import "./Lens.css";

export interface LensProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter (px) of the circular lens. Defaults `160`. */
  lensSize?: number;
  /** Magnification factor of the area under the lens. Defaults `1.6`. */
  zoom?: number;
  /** Keep the lens visible (and centered) even without hovering. Defaults `false`. */
  always?: boolean;
  children?: React.ReactNode;
}

/**
 * A circular magnifying lens that follows the cursor over its children,
 * showing a zoomed copy of the content under the glass. Pointer position is
 * written to CSS variables and the zoomed layer is a duplicate of the content
 * scaled + translated so the same point stays under the cursor.
 *
 * Purely visual. SSR-safe (all reads happen inside pointer handlers).
 */
export const Lens = forwardRef<HTMLDivElement, LensProps>(function Lens(
  {
    lensSize = 160,
    zoom = 1.6,
    always = false,
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
  const [active, setActive] = useState(false);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const node = innerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      node.style.setProperty("--nova-lens-x", `${x}px`);
      node.style.setProperty("--nova-lens-y", `${y}px`);
    },
    [onPointerMove]
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      setActive(true);
    },
    [onPointerEnter]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      setActive(false);
    },
    [onPointerLeave]
  );

  const shown = active || always;

  return (
    <div
      ref={innerRef}
      className={cn("nova-lens", shown && "nova-lens--active", className)}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--nova-lens-size": `${lensSize}px`,
          "--nova-lens-zoom": String(zoom),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="nova-lens__base">{children}</div>
      <div className="nova-lens__glass" aria-hidden="true">
        <div className="nova-lens__zoomed">{children}</div>
      </div>
    </div>
  );
});
