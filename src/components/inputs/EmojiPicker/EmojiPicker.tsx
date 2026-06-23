import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import "./EmojiPicker.css";

export type EmojiPickerSize = "sm" | "md" | "lg";

export interface EmojiEntry {
  /** The emoji glyph. */
  emoji: string;
  /** Search keywords / accessible name. */
  keywords: string[];
}

export interface EmojiCategory {
  /** Category id. */
  id: string;
  /** Tab label (emoji or short text). */
  label: string;
  /** Emojis in this category. */
  emojis: EmojiEntry[];
}

export interface EmojiPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called with the chosen emoji glyph. */
  onSelect?: (emoji: string) => void;
  /**
   * Override the built-in emoji set. Each category is a tab.
   */
  categories?: EmojiCategory[];
  /** Size on the sm/md/lg scale. Defaults to `"md"`. */
  size?: EmojiPickerSize;
  /** Search placeholder. Defaults to `"Search emoji…"`. */
  searchPlaceholder?: string;
  /** Hide the search field. Defaults to `false`. */
  hideSearch?: boolean;
}

/* A small, dependency-free curated set. */
const DEFAULT_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    label: "😀",
    emojis: [
      { emoji: "😀", keywords: ["grin", "happy", "smile"] },
      { emoji: "😄", keywords: ["happy", "joy"] },
      { emoji: "😁", keywords: ["grin", "teeth"] },
      { emoji: "😂", keywords: ["laugh", "tears", "lol"] },
      { emoji: "🙂", keywords: ["smile", "slight"] },
      { emoji: "😉", keywords: ["wink"] },
      { emoji: "😍", keywords: ["love", "heart", "eyes"] },
      { emoji: "😘", keywords: ["kiss", "love"] },
      { emoji: "😎", keywords: ["cool", "sunglasses"] },
      { emoji: "🤔", keywords: ["think", "hmm"] },
      { emoji: "😐", keywords: ["neutral", "meh"] },
      { emoji: "😴", keywords: ["sleep", "tired"] },
      { emoji: "😢", keywords: ["cry", "sad"] },
      { emoji: "😡", keywords: ["angry", "mad"] },
      { emoji: "🥳", keywords: ["party", "celebrate"] },
      { emoji: "😇", keywords: ["angel", "innocent"] },
    ],
  },
  {
    id: "gestures",
    label: "👍",
    emojis: [
      { emoji: "👍", keywords: ["thumbs", "up", "like", "yes"] },
      { emoji: "👎", keywords: ["thumbs", "down", "dislike", "no"] },
      { emoji: "👏", keywords: ["clap", "applause"] },
      { emoji: "🙌", keywords: ["raise", "hands", "celebrate"] },
      { emoji: "🙏", keywords: ["pray", "thanks", "please"] },
      { emoji: "👋", keywords: ["wave", "hello", "bye"] },
      { emoji: "🤝", keywords: ["handshake", "deal"] },
      { emoji: "✌️", keywords: ["peace", "victory"] },
      { emoji: "🤞", keywords: ["fingers", "crossed", "luck"] },
      { emoji: "💪", keywords: ["muscle", "strong"] },
      { emoji: "👌", keywords: ["ok", "perfect"] },
      { emoji: "🤙", keywords: ["call", "shaka"] },
    ],
  },
  {
    id: "animals",
    label: "🐶",
    emojis: [
      { emoji: "🐶", keywords: ["dog", "puppy"] },
      { emoji: "🐱", keywords: ["cat", "kitten"] },
      { emoji: "🦊", keywords: ["fox"] },
      { emoji: "🐻", keywords: ["bear"] },
      { emoji: "🐼", keywords: ["panda"] },
      { emoji: "🐨", keywords: ["koala"] },
      { emoji: "🦁", keywords: ["lion"] },
      { emoji: "🐯", keywords: ["tiger"] },
      { emoji: "🐸", keywords: ["frog"] },
      { emoji: "🐵", keywords: ["monkey"] },
      { emoji: "🦄", keywords: ["unicorn"] },
      { emoji: "🐝", keywords: ["bee"] },
    ],
  },
  {
    id: "food",
    label: "🍕",
    emojis: [
      { emoji: "🍕", keywords: ["pizza"] },
      { emoji: "🍔", keywords: ["burger", "hamburger"] },
      { emoji: "🍟", keywords: ["fries"] },
      { emoji: "🌮", keywords: ["taco"] },
      { emoji: "🍣", keywords: ["sushi"] },
      { emoji: "🍦", keywords: ["icecream", "dessert"] },
      { emoji: "🍩", keywords: ["donut", "doughnut"] },
      { emoji: "🍪", keywords: ["cookie"] },
      { emoji: "🍎", keywords: ["apple", "fruit"] },
      { emoji: "🍌", keywords: ["banana"] },
      { emoji: "☕", keywords: ["coffee", "tea"] },
      { emoji: "🍺", keywords: ["beer", "drink"] },
    ],
  },
  {
    id: "objects",
    label: "💡",
    emojis: [
      { emoji: "💡", keywords: ["idea", "light", "bulb"] },
      { emoji: "🔥", keywords: ["fire", "hot", "lit"] },
      { emoji: "⭐", keywords: ["star", "favorite"] },
      { emoji: "✨", keywords: ["sparkle", "shiny"] },
      { emoji: "🎉", keywords: ["party", "celebrate", "tada"] },
      { emoji: "❤️", keywords: ["heart", "love", "red"] },
      { emoji: "💯", keywords: ["hundred", "score", "perfect"] },
      { emoji: "✅", keywords: ["check", "done", "yes"] },
      { emoji: "❌", keywords: ["cross", "no", "wrong"] },
      { emoji: "🚀", keywords: ["rocket", "launch", "ship"] },
      { emoji: "🎁", keywords: ["gift", "present"] },
      { emoji: "🏆", keywords: ["trophy", "win", "award"] },
    ],
  },
];

export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(
  function EmojiPicker(
    {
      onSelect,
      categories = DEFAULT_CATEGORIES,
      size = "md",
      searchPlaceholder = "Search emoji…",
      hideSearch = false,
      className,
      ...rest
    },
    ref
  ) {
    const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
    const [query, setQuery] = useState("");

    const searching = query.trim().length > 0;

    const results = useMemo(() => {
      if (!searching) {
        const cat = categories.find((c) => c.id === activeCat) ?? categories[0];
        return cat?.emojis ?? [];
      }
      const q = query.trim().toLowerCase();
      const seen = new Set<string>();
      const out: EmojiEntry[] = [];
      for (const cat of categories) {
        for (const e of cat.emojis) {
          if (seen.has(e.emoji)) continue;
          if (e.keywords.some((k) => k.toLowerCase().includes(q))) {
            out.push(e);
            seen.add(e.emoji);
          }
        }
      }
      return out;
    }, [searching, query, categories, activeCat]);

    return (
      <div
        ref={ref}
        className={cn(
          "nova-emojipicker",
          `nova-emojipicker--${size}`,
          className
        )}
        {...rest}
      >
        {!hideSearch && (
          <div className="nova-emojipicker__search">
            <svg
              className="nova-emojipicker__search-icon"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              className="nova-emojipicker__search-input"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
        )}

        {!searching && (
          <div
            className="nova-emojipicker__tabs"
            role="tablist"
            aria-label="Emoji categories"
          >
            {categories.map((cat) => {
              const isActive = cat.id === activeCat;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={cat.id}
                  tabIndex={isActive ? 0 : -1}
                  className={cn(
                    "nova-emojipicker__tab nova-focusable",
                    isActive && "nova-emojipicker__tab--active"
                  )}
                  onClick={() => setActiveCat(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const idx = categories.findIndex((c) => c.id === activeCat);
                      const dir = e.key === "ArrowRight" ? 1 : -1;
                      const next =
                        categories[
                          (idx + dir + categories.length) % categories.length
                        ];
                      if (next) {
                        setActiveCat(next.id);
                        (
                          e.currentTarget.parentElement?.children[
                            (idx + dir + categories.length) % categories.length
                          ] as HTMLElement | undefined
                        )?.focus();
                      }
                    }
                  }}
                >
                  <span aria-hidden="true">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {results.length === 0 ? (
          <div className="nova-emojipicker__empty">No emoji found</div>
        ) : (
          <div className="nova-emojipicker__grid" role="grid">
            {results.map((e) => (
              <button
                key={e.emoji}
                type="button"
                className="nova-emojipicker__cell nova-focusable"
                title={e.keywords[0]}
                aria-label={e.keywords[0] ?? e.emoji}
                onClick={() => onSelect?.(e.emoji)}
              >
                <span aria-hidden="true">{e.emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
