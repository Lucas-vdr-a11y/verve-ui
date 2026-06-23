import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../../utils/cn";
import { useReducedMotion } from "../../utility/useReducedMotion";
import "./HoverRevealText.css";

export interface HoverRevealItem {
  /** Stable key for the row. */
  id: string | number;
  /** Row label / text. */
  label: React.ReactNode;
  /** Preview image URL revealed near the cursor on hover. */
  image: string;
  /** Optional href — renders the row as a link. */
  href?: string;
}

export interface HoverRevealTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Rows to render. */
  items: HoverRevealItem[];
  /** Preview image width (px). Defaults `220`. */
  imageWidth?: number;
  /** Preview image height (px). Defaults `150`. */
  imageHeight?: number;
}

/**
 * A list of rows where hovering one floats its preview image near the cursor
 * (the "following image on hover" link effect). The single shared preview
 * element tracks the pointer and swaps its source to the active row's image.
 *
 * Rows render as links when `href` is given (keyboard-focusable). The preview
 * is decorative (`aria-hidden`). Under reduced motion the image still appears
 * but does not glide.
 */
export const HoverRevealText = forwardRef<HTMLDivElement, HoverRevealTextProps>(
  function HoverRevealText(
    { items, imageWidth = 220, imageHeight = 150, className, ...rest },
    ref
  ) {
    const reduced = useReducedMotion();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState<HoverRevealItem | null>(null);

    const move = useCallback(
      (event: ReactPointerEvent<HTMLElement>) => {
        const root = rootRef.current;
        const preview = previewRef.current;
        if (!root || !preview) return;
        const rect = root.getBoundingClientRect();
        preview.style.setProperty(
          "--nova-reveal-x",
          `${event.clientX - rect.left}px`
        );
        preview.style.setProperty(
          "--nova-reveal-y",
          `${event.clientY - rect.top}px`
        );
      },
      []
    );

    const enter = useCallback(
      (item: HoverRevealItem) => (event: ReactPointerEvent<HTMLElement>) => {
        setActive(item);
        move(event);
      },
      [move]
    );

    const leave = useCallback(() => setActive(null), []);

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("nova-hover-reveal", className)}
        onPointerLeave={leave}
        {...rest}
      >
        <ul className="nova-hover-reveal__list">
          {items.map((item) => {
            const inner = (
              <span className="nova-hover-reveal__label">{item.label}</span>
            );
            return (
              <li
                key={item.id}
                className={cn(
                  "nova-hover-reveal__row",
                  active?.id === item.id && "nova-hover-reveal__row--active"
                )}
              >
                {item.href ? (
                  <a
                    className="nova-hover-reveal__link"
                    href={item.href}
                    onPointerEnter={enter(item)}
                    onPointerMove={move}
                    onFocus={() => setActive(item)}
                    onBlur={leave}
                  >
                    {inner}
                  </a>
                ) : (
                  <span
                    className="nova-hover-reveal__link"
                    onPointerEnter={enter(item)}
                    onPointerMove={move}
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div
          ref={previewRef}
          className={cn(
            "nova-hover-reveal__preview",
            active && "nova-hover-reveal__preview--on",
            reduced && "nova-hover-reveal__preview--static"
          )}
          aria-hidden="true"
          style={
            {
              "--nova-reveal-w": `${imageWidth}px`,
              "--nova-reveal-h": `${imageHeight}px`,
            } as React.CSSProperties
          }
        >
          {active && (
            <img
              className="nova-hover-reveal__img"
              src={active.image}
              alt=""
              draggable={false}
            />
          )}
        </div>
      </div>
    );
  }
);
