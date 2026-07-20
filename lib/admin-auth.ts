export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'user';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'password';
export const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN ?? 'change-me-admin-session-token';

export function isValidAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function isAuthenticatedAdmin(cookieValue?: string | null) {
  return cookieValue === ADMIN_SESSION_TOKEN;
}