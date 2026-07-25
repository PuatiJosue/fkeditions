import { prisma } from '@/lib/prisma'
import { DEFAULT_MPESA_NUMBER, DEFAULT_AIRTEL_NUMBER } from '@/lib/constants'

/**
 * Default values used when a setting is not set in the database.
 * The admin can override any of these via /admin/parametres.
 */
export const SETTING_DEFAULTS = {
  // Mobile Money
  mpesa_number: DEFAULT_MPESA_NUMBER,
  airtel_number: DEFAULT_AIRTEL_NUMBER,

  // General contact
  contact_email: 'editionsfk@gmail.com',
  contact_phone: '+243 829 082 048',
  contact_address: 'Kinshasa, République Démocratique du Congo',
  contact_city_short: 'Kinshasa, RDC',

  // Social URLs
  social_facebook: 'https://www.facebook.com/fkeditions',
  social_instagram: 'https://www.instagram.com/fkeditions',
  social_whatsapp_channel: 'https://whatsapp.com/channel/0029Vb8KostEawdvoq0VyX0S',
  social_messenger: 'https://m.me/fkeditions',

  // Site content
  topbar_message: "Maison d'édition indépendante — depuis 2020 à Kinshasa",
  hero_kicker: 'À la une',
  footer_about:
    "Maison d'édition indépendante basée à Kinshasa, engagée pour la littérature de qualité depuis 2020.",

  // Revue subscription prices (already used by /revue page)
  plan_1m_price: '4',
  plan_3m_price: '8',
  plan_6m_price: '16',
  plan_12m_price: '20',
} as const

export type SettingKey = keyof typeof SETTING_DEFAULTS
export type SiteSettings = Record<SettingKey, string>

/**
 * Read all site settings from DB, falling back to defaults.
 * Safe to call from Server Components.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany()
    const map: Record<string, string> = {}
    rows.forEach((r) => {
      map[r.key] = r.value
    })

    const result = { ...SETTING_DEFAULTS } as Record<string, string>
    for (const key of Object.keys(SETTING_DEFAULTS) as SettingKey[]) {
      if (map[key] !== undefined && map[key] !== '') {
        result[key] = map[key]
      }
    }
    return result as SiteSettings
  } catch {
    return { ...SETTING_DEFAULTS } as SiteSettings
  }
}
