import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../../utils/cn";
import { useControllableState } from "../useControllableState";

/** Theme preference; `"system"` follows the OS via `prefers-color-scheme`. */
export type Theme = "light" | "dark" | "system";
/** The concrete theme actually applied to the DOM. */
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** Current preference (may be `"system"`). */
  theme: Theme;
  /** Concrete theme applied to `data-theme` (`"light"` or `"dark"`). */
  resolvedTheme: ResolvedTheme;
  /** Set the preference. */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark based on the resolved theme. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** App content. */
  children: ReactNode;
  /** Initial preference in uncontrolled mode. Defaults to `"system"`. */
  defaultTheme?: Theme;
  /** Controlled preference. When provided, the provider is controlled. */
  theme?: Theme;
  /** Called whenever the preference changes. */
  onThemeChange?: (theme: Theme) => void;
  /**
   * localStorage key used to persist the preference. Pass `null` to disable
   * persistence. Defaults to `"nova-theme"`.
   */
  storageKey?: string | null;
}

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function readStoredTheme(storageKey: string | null): Theme | undefined {
  if (!storageKey || typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // localStorage can throw (private mode, disabled). Ignore.
  }
  return undefined;
}

/**
 * Provides theme context and renders a `div.nova-root` carrying `data-theme`.
 *
 * - Controlled via `theme` or uncontrolled via `defaultTheme`.
 * - Persists the preference to `localStorage` (SSR-safe; key configurable).
 * - When the preference is `"system"`, follows `prefers-color-scheme` live.
 *
 * All `window` / `localStorage` / `matchMedia` access is guarded behind
 * effects so the component is safe to render on the server.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  theme: controlledTheme,
  onThemeChange,
  storageKey = "nova-theme",
  className,
  ...rest
}: ThemeProviderProps) {
  const [theme, setThemeState] = useControllableState<Theme>({
    value: controlledTheme,
    // Stored preference (if any) wins over `defaultTheme` on first render in
    // uncontrolled mode. Read lazily so the function only runs client-side.
    defaultValue: () => readStoredTheme(storageKey) ?? defaultTheme,
    onChange: onThemeChange,
  });

  // Resolve system theme reactively. Start with a guess; correct after mount.
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setSystemTheme(getSystemTheme());

    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(MEDIA_QUERY);
    const update = () => setSystemTheme(mql.matches ? "dark" : "light");

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  // Persist preference whenever it changes (uncontrolled or controlled).
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme, storageKey]);

  const setTheme = useCallback(
    (next: Theme) => setThemeState(next),
    [setThemeState]
  );

  const toggle = useCallback(() => {
    setThemeState(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemeState]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={cn("nova-root", className)}
        data-theme={resolvedTheme}
        {...rest}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Access the current theme context.
 *
 * @throws if called outside a {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>.");
  }
  return context;
}
