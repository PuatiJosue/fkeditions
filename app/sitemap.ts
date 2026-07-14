import { MetadataRoute } from 'next'
import { books } from '@/data/books'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? 'https://fk-editions.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                    priority: 1,   changeFrequency: 'weekly'  },
    { url: `${base}/livres`,        priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${base}/auteurs`,       priority: 0.8, changeFrequency: 'monthly' },
    { url: `${base}/evenements`,    priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${base}/flysys`,        priority: 0.7, changeFrequency: 'monthly' },
    { url: `${base}/contact`,       priority: 0.5, changeFrequency: 'yearly'  },
  ]

  const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${base}/livres/${book.id}`,
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  return [...staticPages, ...bookPages]
}
