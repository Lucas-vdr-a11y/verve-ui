import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./KanbanBoard.css";

/** Accent color for a column header. */
export type KanbanColumnTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface KanbanCard {
  /** Unique identifier within the board. */
  id: string;
  /** Arbitrary payload — surfaced to the card render-prop. */
  [key: string]: unknown;
}

export interface KanbanColumn<C extends KanbanCard = KanbanCard> {
  /** Unique column identifier. */
  id: string;
  /** Column heading. */
  title: React.ReactNode;
  /** Cards belonging to this column. */
  items: C[];
  /** Accent color for the column header. Defaults to `"neutral"`. */
  tone?: KanbanColumnTone;
}

export interface KanbanBoardProps<C extends KanbanCard = KanbanCard>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  /** Column definitions, each with its own cards. */
  columns: KanbanColumn<C>[];
  /** Render-prop for a single card's content. */
  renderCard: (card: C, column: KanbanColumn<C>) => React.ReactNode;
  /** Fired when a card is activated (click / Enter / Space). */
  onCardClick?: (card: C, column: KanbanColumn<C>) => void;
  /** Show the card count badge in each column header. Defaults to `true`. */
  showCounts?: boolean;
  /** Content shown in a column with no cards. */
  emptyColumnContent?: React.ReactNode;
}

function KanbanBoardInner<C extends KanbanCard = KanbanCard>(
  {
    columns,
    renderCard,
    onCardClick,
    showCounts = true,
    emptyColumnContent,
    className,
    ...rest
  }: KanbanBoardProps<C>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn("nova-kanban", className)} {...rest}>
      {columns.map((column) => {
        const tone = column.tone ?? "neutral";
        return (
          <section
            key={column.id}
            className="nova-kanban__column"
            aria-label={
              typeof column.title === "string" ? column.title : undefined
            }
          >
            <header
              className={cn(
                "nova-kanban__column-header",
                `nova-kanban__column-header--${tone}`
              )}
            >
              <span className="nova-kanban__column-title">{column.title}</span>
              {showCounts && (
                <span className="nova-kanban__count" aria-hidden="true">
                  {column.items.length}
                </span>
              )}
            </header>

            <ul className="nova-kanban__list" role="list">
              {column.items.length === 0 ? (
                <li className="nova-kanban__empty">
                  {emptyColumnContent ?? "No cards"}
                </li>
              ) : (
                column.items.map((card) => {
                  const clickable = Boolean(onCardClick);
                  const handleActivate = () => onCardClick?.(card, column);
                  return (
                    <li key={card.id} className="nova-kanban__card-wrap">
                      <div
                        className={cn(
                          "nova-kanban__card",
                          clickable && "nova-kanban__card--clickable",
                          clickable && "nova-focusable"
                        )}
                        role={clickable ? "button" : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={clickable ? handleActivate : undefined}
                        onKeyDown={
                          clickable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleActivate();
                                }
                              }
                            : undefined
                        }
                      >
                        {renderCard(card, column)}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * KanbanBoard — a display-focused board of columns and cards. Reordering and
 * drag are intentionally out of scope (handled by the dnd category); this keeps
 * a clean, read-only column layout with optional click handling.
 */
export const KanbanBoard = forwardRef(KanbanBoardInner) as <
  C extends KanbanCard = KanbanCard
>(
  props: KanbanBoardProps<C> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
