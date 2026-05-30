const store = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  limit: number    // nombre max de requêtes
  window: number   // fenêtre en secondes
}

export function rateLimit(ip: string, key: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const storeKey = `${key}:${ip}`
  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + options.window * 1000 })
    return true // autorisé
  }

  if (entry.count >= options.limit) {
    return false // bloqué
  }

  entry.count++
  return true // autorisé
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
