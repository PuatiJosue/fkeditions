import { prisma } from '@/lib/prisma'

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  target?: string,
  details?: string,
) {
  try {
    await prisma.auditLog.create({ data: { adminId, adminEmail, action, target, details } })
  } catch {}
}

async function getGeoLocation(ip: string): Promise<{ country: string; city: string } | null> {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('::1') || ip.startsWith('192.168.') || ip.startsWith('10.')) return null
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json()
    if (data.status === 'fail') return null
    return { country: data.country ?? '', city: data.city ?? '' }
  } catch {
    return null
  }
}

export async function logLogin(userId: string, ip: string, userAgent: string, success: boolean) {
  try {
    const geo = await getGeoLocation(ip)
    await prisma.loginHistory.create({
      data: { userId, ip, userAgent, success, country: geo?.country, city: geo?.city },
    })
    const old = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 100,
      select: { id: true },
    })
    if (old.length > 0) {
      await prisma.loginHistory.deleteMany({ where: { id: { in: old.map(o => o.id) } } })
    }
  } catch {}
}
