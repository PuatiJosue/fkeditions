import crypto from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET!
const TTL = 30 * 60 * 1000 // 30 minutes

export function createToken(userId: string, resource: string): string {
  const expires = Date.now() + TTL
  const payload = `${userId}|${resource}|${expires}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}|${sig}`).toString('base64url')
}

export function verifyToken(token: string, userId: string, resource: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const parts = decoded.split('|')
    if (parts.length !== 4) return false
    const [tUserId, tResource, tExpires, sig] = parts
    if (tUserId !== userId || tResource !== resource) return false
    if (Date.now() > parseInt(tExpires)) return false
    const payload = `${tUserId}|${tResource}|${tExpires}`
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}
