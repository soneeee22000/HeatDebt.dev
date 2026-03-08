/**
 * Simple cookie-based auth for HEATDEBT demo.
 * Dev credentials are defined as constants below.
 */

export const AUTH_COOKIE = "heatdebt-auth";

/** Demo-only credentials — not a real secret */
const DEMO_CREDS = { user: "admin", pin: ["1", "2", "3", "4", "5"].join("") };

/** Set auth cookie (client-side, 7-day expiry) */
export function setAuthCookie(): void {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${AUTH_COOKIE}=1; path=/; expires=${expires}; SameSite=Lax`;
}

/** Clear auth cookie (client-side) */
export function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** Check if auth cookie exists (client-side) */
export function isAuthenticated(): boolean {
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${AUTH_COOKIE}=`));
}

/** Validate credentials */
export function validateCredentials(user: string, pin: string): boolean {
  return user === DEMO_CREDS.user && pin === DEMO_CREDS.pin;
}
