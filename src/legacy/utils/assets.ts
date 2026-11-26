/** Public assets served by Next.js, preserving the historical paths. */
export function assetUrl(path: string): string {
  if (!path || /^(?:https?:|data:|blob:)/i.test(path)) return path
  return '/' + path.replace(/^\/+/, '')
}
