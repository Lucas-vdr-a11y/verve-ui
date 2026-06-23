import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Lightbox.css";

export interface LightboxImage {
  /** Image source URL. */
  src: string;
  /** Accessible alt text. */
  alt?: string;
  /** Optional caption shown beneath the image. */
  caption?: ReactNode;
}

export interface LightboxProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the viewer is visible. */
  open: boolean;
  /** Images to page through. */
  images: LightboxImage[];
  /** Controlled current index. */
  index?: number;
  /** Initial index for uncontrolled usage. Defaults to `0`. */
  defaultIndex?: number;
  /** Notified when the active index changes. */
  onIndexChange?: (index: number) => void;
  /** Called on Esc, overlay click, or the close button. */
  onClose?: () => void;
  /** Close when the backdrop is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(
  function Lightbox(
    {
      open,
      images,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      onClose,
      closeOnOverlayClick = true,
      className,
      ...rest
    },
    ref
  ) {
    const isControlled = indexProp !== undefined;
    const [internalIndex, setInternalIndex] = useState(defaultIndex);
    const index = isControlled ? indexProp : internalIndex;
    const count = images.length;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const goTo = useCallback(
      (next: number) => {
        if (count === 0) return;
        const wrapped = (next + count) % count;
        if (!isControlled) setInternalIndex(wrapped);
        onIndexChange?.(wrapped);
      },
      [count, isControlled, onIndexChange]
    );

    const prev = useCallback(() => goTo(index - 1), [goTo, index]);
    const next = useCallback(() => goTo(index + 1), [goTo, index]);

    // Keyboard: Esc closes, arrows page.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
        else if (e.key === "ArrowLeft") prev();
        else if (e.key === "ArrowRight") next();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, prev, next]);

    // Focus management + scroll lock.
    useEffect(() => {
      if (!open || !canUseDOM()) return;
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      (closeRef.current ?? rootRef.current)?.focus();
      const { body } = document;
      const previousOverflow = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = previousOverflow;
        restoreFocusRef.current?.focus?.();
      };
    }, [open]);

    if (!open || !canUseDOM() || count === 0) return null;

    const safeIndex = Math.max(0, Math.min(index, count - 1));
    const current = images[safeIndex];

    const overlay = (
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabIndex={-1}
        className={cn("nova-lightbox", className)}
        onMouseDown={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.();
        }}
        {...rest}
      >
        <button
          ref={closeRef}
          type="button"
          className="nova-lightbox__close"
          aria-label="Close"
          onClick={() => onClose?.()}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {count > 1 && (
          <button
            type="button"
            className="nova-lightbox__nav nova-lightbox__nav--prev"
            aria-label="Previous image"
            onClick={prev}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <figure className="nova-lightbox__figure">
          <img
            className="nova-lightbox__image"
            src={current.src}
            alt={current.alt ?? ""}
          />
          {current.caption != null && (
            <figcaption className="nova-lightbox__caption">
              {current.caption}
            </figcaption>
          )}
        </figure>

        {count > 1 && (
          <button
            type="button"
            className="nova-lightbox__nav nova-lightbox__nav--next"
            aria-label="Next image"
            onClick={next}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {count > 1 && (
          <div className="nova-lightbox__counter" aria-live="polite">
            {safeIndex + 1} / {count}
          </div>
        )}
      </div>
    );

    return ReactDOM.createPortal(overlay, document.body);
  }
);
