# Nova UI — Component Authoring Contract

Every component MUST follow this contract so the library stays consistent no
matter who (or which agent) wrote it.

## File layout
Each component lives in its category folder:

```
src/components/<category>/<ComponentName>/
  <ComponentName>.tsx     # implementation
  <ComponentName>.css     # styles (BEM-ish, prefixed .nova-<name>)
  index.ts                # re-export: export * from "./<ComponentName>"
```

## Styling rules
- **Tokens only.** Use `var(--nova-*)` for every color, space, radius, shadow,
  font, duration. Never hard-code a hex, px spacing, or timing that a token covers.
- **Class prefix.** Root class is `nova-<name>` (kebab). Modifiers use
  `nova-<name>--<modifier>`, elements use `nova-<name>__<part>`.
- **No CSS-in-JS, no Tailwind.** Plain `.css` file imported at top of the `.tsx`.
- **Theme-agnostic.** Must look correct in both light and dark — only reference
  semantic tokens (`--nova-surface`, `--nova-text`, …), never raw `--nova-gray-*`.
- **Motion.** Use `--nova-duration-*` + `--nova-ease*`. Respect reduced-motion
  (handled globally via tokens).

## API rules
- TypeScript, `React.forwardRef` where a DOM ref makes sense.
- Extend the native element props: e.g.
  `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
- Spread `...rest` onto the root node and merge `className` via `cn()`.
- Sizes use the scale: `"sm" | "md" | "lg"` (default `"md"`).
- Variants are a `variant` prop. Document defaults.
- Named exports only (no default exports), plus export the Props type.

## Accessibility
- Correct semantic element or proper `role`.
- Keyboard operable; visible focus via `nova-focusable` class or `:focus-visible`.
- `aria-*` wired for state (expanded, selected, disabled, invalid, etc.).
- Interactive disabled states set `aria-disabled` / `disabled`.

## Quality bar
- No external dependencies beyond React.
- Self-contained, SSR-safe (guard `window`/`document` access).
- Small, composable, predictable. Prefer composition over giant prop lists.

## Example skeleton

```tsx
import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./Thing.css";

export interface ThingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "soft";
  size?: "sm" | "md" | "lg";
}

export const Thing = forwardRef<HTMLDivElement, ThingProps>(function Thing(
  { variant = "solid", size = "md", className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("nova-thing", `nova-thing--${variant}`, `nova-thing--${size}`, className)}
      {...rest}
    />
  );
});
```
