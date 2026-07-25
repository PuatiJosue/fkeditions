import type { Metadata } from 'next'
import { Cormorant_Garamond, Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Topbar from '@/components/layout/Topbar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from '@/components/layout/Providers'
import GlobalEffects from '@/components/layout/GlobalEffects'
import { getSettings } from '@/lib/settings'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = 'https://fk-editions.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FK Éditions — Livres, Magazines & FLYSYS à Kinshasa',
    template: '%s — FK Éditions',
  },
  description:
    "Maison d'édition indépendante basée à Kinshasa, RDC. Découvrez nos livres numériques et notre revue littéraire mensuelle. Fondée par Fortune Khonde.",
  keywords: [
    'FK Éditions',
    'livres',
    'Kinshasa',
    'littérature',
    'ebooks',
    'Congo',
    'Fortune Khonde',
    'revue',
  ],
  authors: [{ name: 'FK Éditions', url: SITE_URL }],
  creator: 'FK Éditions',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CD',
    url: SITE_URL,
    siteName: 'FK Éditions',
    title: 'FK Éditions — Livres, Magazines & FLYSYS à Kinshasa',
    description:
      "Maison d'édition indépendante basée à Kinshasa, RDC. Découvrez nos livres numériques et notre revue littéraire mensuelle. Fondée par Fortune Khonde.",
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: "FK Éditions — Maison d'édition de Kinshasa",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FK Éditions — Livres, Magazines & FLYSYS à Kinshasa',
    description:
      "Maison d'édition indépendante basée à Kinshasa, RDC. Découvrez nos livres numériques et notre revue littéraire mensuelle.",
    images: ['/images/og-image.png'],
  },
}

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('fk-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="fk min-h-screen flex flex-col">
        <Providers>
          <GlobalEffects />
          <Topbar message={settings.topbar_message} />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </Providers>
      </body>
    </html>
  )
}
