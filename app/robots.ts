import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://fk-editions.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/bibliotheque/', '/compte/', '/reset-password/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
