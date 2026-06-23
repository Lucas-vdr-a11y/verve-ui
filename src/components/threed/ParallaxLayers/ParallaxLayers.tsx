import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./ParallaxLayers.css";

export interface ParallaxLayer {
  /** Layer content. */
  content: ReactNode;
  /**
   * Depth of the layer. Positive pops toward the viewer, negative recedes.
   * Used both for `translateZ` and parallax magnitude. @default index-based
   */
  depth?: number;
}

export interface ParallaxLayersProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Stacked layers, back to front. */
  layers: ParallaxLayer[];
  /** Max tilt of the card in degrees. @default 12 */
  maxTilt?: number;
  /** Base px between layer depths when `depth` is omitted. @default 40 */
  spacing?: number;
  /** Parallax shift strength (px per unit depth at edge). @default 12 */
  strength?: number;
}

/**
 * A multi-layer 3D depth card. Layers sit at different `translateZ` depths and
 * shift parallax-style as the card tilts toward the cursor. Tilt + parallax
 * freeze under reduced-motion while layers stay legible.
 */
export const ParallaxLayers = forwardRef<HTMLDivElement, ParallaxLayersProps>(
  function ParallaxLayers(
    {
      layers,
      maxTilt = 12,
      spacing = 40,
      strength = 12,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const reduced = useReducedMotion();
    const sceneRef = useRef<HTMLDivElement | null>(null);
    // Normalised pointer position from -0.5..0.5 on each axis.
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const node = sceneRef.current;
      if (node == null || reduced) return;

      let frame = 0;
      const apply = (clientX: number, clientY: number) => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;
        setPos({ x, y });
      };

      const onMove = (e: PointerEvent) => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          apply(e.clientX, e.clientY);
        });
      };
      const onLeave = () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        setPos({ x: 0, y: 0 });
      };

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
        if (frame) window.cancelAnimationFrame(frame);
      };
    }, [reduced]);

    const tiltX = reduced ? 0 : -pos.y * maxTilt * 2;
    const tiltY = reduced ? 0 : pos.x * maxTilt * 2;

    const sceneVars: CSSProperties = {
      ["--nova-parallax-tilt-x" as string]: `${tiltX}deg`,
      ["--nova-parallax-tilt-y" as string]: `${tiltY}deg`,
    };

    return (
      <div
        ref={ref}
        className={cn("nova-parallax", className)}
        style={style}
        {...rest}
      >
        <div
          ref={sceneRef}
          className="nova-parallax__scene"
          style={sceneVars}
        >
          {layers.map((layer, i) => {
            // Depth ladder: explicit depth, else an even spacing per index.
            const z = layer.depth != null ? layer.depth : i * spacing;
            const shift = (z / spacing) * strength;
            const layerVars: CSSProperties = {
              ["--nova-parallax-z" as string]: `${z}px`,
              ["--nova-parallax-shift-x" as string]: `${
                reduced ? 0 : -pos.x * shift
              }px`,
              ["--nova-parallax-shift-y" as string]: `${
                reduced ? 0 : -pos.y * shift
              }px`,
            };
            return (
              <div
                key={i}
                className="nova-parallax__layer"
                style={layerVars}
              >
                {layer.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
