import { useCallback, useState } from "react";

export interface CookieOptions {
  /** Lifetime in days. Mutually convenient with `expires`. */
  days?: number;
  /** Explicit expiry date. Takes precedence over `days`. */
  expires?: Date;
  /** Cookie path. Defaults to `"/"`. */
  path?: string;
  /** Cookie domain. */
  domain?: string;
  /** Restrict to HTTPS. */
  secure?: boolean;
  /** SameSite policy. */
  sameSite?: "strict" | "lax" | "none";
}

export type UseCookieReturn = [
  string | null,
  (value: string, options?: CookieOptions) => void,
  (options?: Pick<CookieOptions, "path" | "domain">) => void,
];

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(match.indexOf("=") + 1));
}

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const parts: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
  ];

  let expires = options.expires;
  if (!expires && options.days !== undefined) {
    expires = new Date(Date.now() + options.days * 864e5);
  }
  if (expires) parts.push(`expires=${expires.toUTCString()}`);

  parts.push(`path=${options.path ?? "/"}`);
  if (options.domain) parts.push(`domain=${options.domain}`);
  if (options.secure) parts.push("secure");
  if (options.sameSite) parts.push(`samesite=${options.sameSite}`);

  return parts.join("; ");
}

/**
 * Reads and writes a single cookie via `document.cookie`.
 *
 * SSR-safe: returns `null` on the server (guards `document`). Cookie names and
 * values are URL-encoded. Returns `[value, setCookie, removeCookie]`.
 * `removeCookie` expires the cookie immediately (pass matching `path`/`domain`
 * so the browser targets the right cookie).
 */
export function useCookie(name: string): UseCookieReturn {
  const [value, setValue] = useState<string | null>(() => readCookie(name));

  const setCookie = useCallback(
    (next: string, options?: CookieOptions) => {
      if (typeof document !== "undefined") {
        document.cookie = serializeCookie(name, next, options);
      }
      setValue(next);
    },
    [name]
  );

  const removeCookie = useCallback(
    (options?: Pick<CookieOptions, "path" | "domain">) => {
      if (typeof document !== "undefined") {
        document.cookie = serializeCookie(name, "", {
          ...options,
          expires: new Date(0),
        });
      }
      setValue(null);
    },
    [name]
  );

  return [value, setCookie, removeCookie];
}
