import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion/useReducedMotion";
import "./ImageTrail.css";

export interface ImageTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URLs cycled through along the cursor path. */
  images: string[];
  /** Minimum pointer distance (px) before dropping the next image. Defaults `70`. */
  threshold?: number;
  /** Lifetime (ms) of each trailing image before it is removed. Defaults `700`. */
  lifetime?: number;
  /** Content rendered inside the trail surface (heading, etc.). */
  children?: React.ReactNode;
}

/**
 * ImageTrail — as the cursor moves across the surface, a trail of thumbnails
 * spawns along the path and fades out (the award-site "image trail"). Images are
 * pooled and recycled; spawning is throttled by pointer distance and each tile is
 * removed after its lifetime, all inside a single effect with full cleanup.
 *
 * SSR-safe (guards `window`/`document`, listeners attached in the effect). Under
 * reduced motion the trail is disabled entirely and only the children render.
 */
export const ImageTrail = forwardRef<HTMLDivElement, ImageTrailProps>(
  function ImageTrail(
    { images, threshold = 70, lifetime = 700, className, children, ...rest },
    ref
  ) {
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();

    useEffect(() => {
      if (reduced) return;
      if (typeof window === "undefined") return;
      const surface = surfaceRef.current;
      if (!surface || images.length === 0) return;

      let lastX = 0;
      let lastY = 0;
      let primed = false;
      let imgIndex = 0;
      const timers = new Set<ReturnType<typeof setTimeout>>();

      const spawn = (x: number, y: number) => {
        const tile = document.createElement("img");
        tile.className = "nova-image-trail__tile";
        tile.src = images[imgIndex % images.length];
        tile.alt = "";
        tile.setAttribute("aria-hidden", "true");
        tile.draggable = false;
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
        // small random rotation for organic feel
        tile.style.setProperty(
          "--nova-image-trail-rot",
          `${(imgIndex % 5) * 4 - 8}deg`
        );
        imgIndex += 1;
        surface.appendChild(tile);
        // force reflow then animate in via class
        void tile.offsetWidth;
        tile.classList.add("nova-image-trail__tile--in");

        const t = setTimeout(() => {
          tile.classList.remove("nova-image-trail__tile--in");
          tile.classList.add("nova-image-trail__tile--out");
          const r = setTimeout(() => {
            tile.remove();
            timers.delete(r);
          }, 300);
          timers.add(r);
          timers.delete(t);
        }, lifetime);
        timers.add(t);
      };

      const onMove = (e: PointerEvent) => {
        const rect = surface.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (!primed) {
          primed = true;
          lastX = x;
          lastY = y;
          spawn(x, y);
          return;
        }
        const dist = Math.hypot(x - lastX, y - lastY);
        if (dist >= threshold) {
          lastX = x;
          lastY = y;
          spawn(x, y);
        }
      };

      const onLeave = () => {
        primed = false;
      };

      surface.addEventListener("pointermove", onMove);
      surface.addEventListener("pointerleave", onLeave);

      return () => {
        surface.removeEventListener("pointermove", onMove);
        surface.removeEventListener("pointerleave", onLeave);
        timers.forEach((t) => clearTimeout(t));
        timers.clear();
        surface
          .querySelectorAll(".nova-image-trail__tile")
          .forEach((n) => n.remove());
      };
    }, [images, threshold, lifetime, reduced]);

    return (
      <div
        ref={ref}
        className={cn("nova-image-trail", className)}
        style={
          { "--nova-image-trail-life": `${lifetime}ms` } as React.CSSProperties
        }
        {...rest}
      >
        <div className="nova-image-trail__surface" ref={surfaceRef} />
        <div className="nova-image-trail__content">{children}</div>
      </div>
    );
  }
);
