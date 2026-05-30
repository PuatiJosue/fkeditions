import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-gold font-serif text-8xl font-bold leading-none mb-6">404</p>
        <h1 className="font-serif text-2xl text-cream mb-3">Page introuvable</h1>
        <p className="text-sm text-cream-muted leading-relaxed mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Revenez à l&apos;accueil pour continuer votre exploration.
        </p>
        <Link
          href="/"
          className="inline-block bg-gold hover:bg-gold-light text-dark font-semibold py-3 px-8 text-xs uppercase tracking-widest transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/livres" className="text-xs text-cream-muted hover:text-gold transition-colors">
            Nos livres
          </Link>
          <Link href="/auteurs" className="text-xs text-cream-muted hover:text-gold transition-colors">
            Nos auteurs
          </Link>
          <Link href="/contact" className="text-xs text-cream-muted hover:text-gold transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </div>
  )
}
