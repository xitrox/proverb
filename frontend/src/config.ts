/**
 * Get the API base URL
 * - In local development (localhost), use production API
 * - In production, use same origin
 */
export function getApiBase(): string {
  const hostname = window.location.hostname
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

  return isLocal
    ? 'https://proverb.vercel.app'
    : window.location.origin
}
