import { forwardRef, useMemo } from "react";
import { cn } from "../../../utils/cn";
import "./TagCloud.css";

export interface TagCloudItem {
  /** Display text. */
  label: string;
  /** Weight driving size/color. Alias: `weight`. */
  value?: number;
  /** Weight driving size/color. Alias: `value`. */
  weight?: number;
  /** Optional stable id (defaults to `label`). */
  id?: string | number;
}

export interface TagCloudProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onClick"> {
  /** Tags to render. */
  tags: TagCloudItem[];
  /**
   * Number of size/color buckets weights are mapped into. Defaults to `5`.
   * Clamped to the range 1–5.
   */
  buckets?: number;
  /** Fired when a tag is activated (click / Enter / Space). */
  onTagClick?: (tag: TagCloudItem, index: number) => void;
}

const getWeight = (t: TagCloudItem): number =>
  typeof t.weight === "number"
    ? t.weight
    : typeof t.value === "number"
      ? t.value
      : 1;

export const TagCloud = forwardRef<HTMLUListElement, TagCloudProps>(
  function TagCloud(
    { tags, buckets = 5, onTagClick, className, ...rest },
    ref
  ) {
    const levels = Math.max(1, Math.min(5, Math.round(buckets)));

    const bucketed = useMemo(() => {
      const weights = tags.map(getWeight);
      const min = weights.length ? Math.min(...weights) : 0;
      const max = weights.length ? Math.max(...weights) : 0;
      const span = max - min;
      return tags.map((tag, i) => {
        const w = weights[i];
        // Map weight → bucket index in [0, levels - 1].
        const ratio = span === 0 ? 1 : (w - min) / span;
        const bucket = Math.min(levels - 1, Math.round(ratio * (levels - 1)));
        return { tag, bucket, weight: w };
      });
    }, [tags, levels]);

    const interactive = !!onTagClick;

    return (
      <ul
        ref={ref}
        className={cn("nova-tag-cloud", className)}
        role="list"
        {...rest}
      >
        {bucketed.map(({ tag, bucket, weight }, i) => {
          const key = tag.id ?? tag.label;
          const className = cn(
            "nova-tag-cloud__tag",
            `nova-tag-cloud__tag--level-${bucket}`,
            interactive && "nova-tag-cloud__tag--interactive"
          );
          const title = `${tag.label} (${weight})`;
          if (interactive) {
            return (
              <li key={key} className="nova-tag-cloud__item" role="listitem">
                <button
                  type="button"
                  className={className}
                  title={title}
                  onClick={() => onTagClick!(tag, i)}
                >
                  {tag.label}
                </button>
              </li>
            );
          }
          return (
            <li key={key} className="nova-tag-cloud__item" role="listitem">
              <span className={className} title={title}>
                {tag.label}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
);
