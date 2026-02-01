/**
 * Canonical route constants for the application.
 * Using these constants ensures consistent navigation across the app.
 */
export const ROUTES = {
  HOME: '/laboratory',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  UPGRADE: '/upgrade',
} as const;

/**
 * Navigate back safely. If there's browser history, go back.
 * Otherwise, navigate to the canonical home route.
 */
export function getSafeBackPath(): string {
  // If we have enough history entries, we can safely go back
  // window.history.length > 2 accounts for the initial page load
  if (typeof window !== 'undefined' && window.history.length > 2) {
    return 'BACK';
  }
  return ROUTES.HOME;
}
