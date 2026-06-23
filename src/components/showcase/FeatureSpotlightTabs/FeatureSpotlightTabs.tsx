import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./FeatureSpotlightTabs.css";

export interface FeatureSpotlightItem {
  /** Stable identity. */
  id: string;
  /** Feature title in the list. */
  title: React.ReactNode;
  /** Supporting copy under the title. */
  description?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Media / screenshot revealed when this feature is active. */
  media: React.ReactNode;
}

export interface FeatureSpotlightTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Features to showcase. */
  items: FeatureSpotlightItem[];
  /** Initially active item id. Defaults the first item. */
  defaultActiveId?: string;
  /** Auto-advance interval, ms. Set `0` to disable. Defaults `5000`. */
  interval?: number;
  /** Which side the media panel sits on. Defaults `"right"`. */
  mediaSide?: "left" | "right";
  /** Notified when the active feature changes. */
  onChange?: (id: string) => void;
}

/**
 * Tabbed feature showcase: a vertical list of features on one side, the active
 * feature's media on the other. The active feature auto-advances on a timer
 * (with a per-item progress bar); hovering the list pauses advancement, and
 * selecting an item resets the timer.
 *
 * Built with `role="tablist"`/`role="tab"` + `tabpanel`. Arrow/Home/End keys
 * move between features. The timer lives in an effect with cleanup; SSR-safe and
 * reduced-motion aware (auto-advance is disabled and the progress bar hidden).
 */
export const FeatureSpotlightTabs = forwardRef<
  HTMLDivElement,
  FeatureSpotlightTabsProps
>(function FeatureSpotlightTabs(
  {
    items,
    defaultActiveId,
    interval = 5000,
    mediaSide = "right",
    onChange,
    className,
    ...rest
  },
  ref
) {
  const [activeId, setActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? ""
  );
  const [paused, setPaused] = useState(false);
  // Bumping this key restarts the progress animation on (re)selection.
  const [cycle, setCycle] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.id === activeId)
  );

  const select = useCallback(
    (id: string) => {
      setActiveId(id);
      setCycle((c) => c + 1);
      onChange?.(id);
    },
    [onChange]
  );

  // Auto-advance timer.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (paused || interval <= 0 || items.length <= 1) return;

    const id = window.setTimeout(() => {
      const next = items[(activeIndex + 1) % items.length];
      select(next.id);
    }, interval);
    return () => window.clearTimeout(id);
  }, [activeIndex, interval, paused, items, select, cycle]);

  const moveFocus = (from: number, dir: 1 | -1) => {
    const n = items.length;
    const idx = (from + dir + n) % n;
    tabRefs.current[idx]?.focus();
    select(items[idx].id);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        moveFocus(index, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(index, -1);
        break;
      case "Home":
        e.preventDefault();
        tabRefs.current[0]?.focus();
        select(items[0].id);
        break;
      case "End":
        e.preventDefault();
        tabRefs.current[items.length - 1]?.focus();
        select(items[items.length - 1].id);
        break;
      default:
        break;
    }
  };

  const autoAdvancing = interval > 0 && items.length > 1;

  return (
    <div
      ref={ref}
      className={cn(
        "nova-feature-tabs",
        `nova-feature-tabs--media-${mediaSide}`,
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...rest}
    >
      <div
        className="nova-feature-tabs__list"
        role="tablist"
        aria-orientation="vertical"
      >
        {items.map((item, i) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`nova-feature-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`nova-feature-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "nova-feature-tabs__tab",
                "nova-focusable",
                selected && "nova-feature-tabs__tab--active"
              )}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.icon && (
                <span className="nova-feature-tabs__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="nova-feature-tabs__copy">
                <span className="nova-feature-tabs__title">{item.title}</span>
                {item.description && (
                  <span className="nova-feature-tabs__desc">
                    {item.description}
                  </span>
                )}
              </span>
              {selected && autoAdvancing && !paused && (
                <span
                  key={cycle}
                  className="nova-feature-tabs__progress"
                  aria-hidden="true"
                  style={
                    {
                      "--nova-feature-tabs-interval": `${interval}ms`,
                    } as React.CSSProperties
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="nova-feature-tabs__stage">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <div
              key={item.id}
              role="tabpanel"
              id={`nova-feature-panel-${item.id}`}
              aria-labelledby={`nova-feature-tab-${item.id}`}
              aria-hidden={!selected}
              className={cn(
                "nova-feature-tabs__panel",
                selected && "nova-feature-tabs__panel--active"
              )}
            >
              {item.media}
            </div>
          );
        })}
      </div>
    </div>
  );
});
