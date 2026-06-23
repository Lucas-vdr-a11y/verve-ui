/**
 * cn — tiny className combiner. Filters out falsy values and joins with a space.
 * Keeps component code readable without pulling in a dependency.
 *
 * @example cn("btn", isActive && "btn--active", undefined) // "btn btn--active"
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  let out = "";
  for (const v of values) {
    if (!v && v !== 0) continue;
    out += (out ? " " : "") + v;
  }
  return out;
}
