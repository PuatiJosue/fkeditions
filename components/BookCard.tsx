'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export interface BookItem {
  slug: string
  title: string
  price: number
  coverImage: string | null
  category: string
  author?: string | null
  preOrder?: boolean
  releaseDate?: string | Date | null
}

interface BookCardProps {
  book: BookItem
  showBuyButton?: boolean
  variant?: 'dark' | 'light'
}

export default function BookCard({ book, showBuyButton = true, variant = 'dark' }: BookCardProps) {
  const isLight = variant === 'light'
  const [imgError, setImgError] = useState(false)

  const coverColors: Record<string, string> = {
    'elles-ont-ecrit': 'from-pink-900 via-pink-700 to-pink-900',
    'porteur-de-promesses': 'from-amber-900 via-orange-700 to-amber-900',
    'le-rap': 'from-red-950 via-red-800 to-red-950',
  }

  const gradient = coverColors[book.slug] || 'from-dark-3 via-dark-4 to-dark-3'

  return (
    <div className={`group flex flex-col border transition-all duration-300 book-shadow rounded-sm overflow-hidden ${
      isLight
        ? 'bg-white border-[#e0d8cc] hover:border-gold/50 hover:shadow-lg'
        : 'bg-dark-3 border-dark-4 hover:border-gold/30'
    }`}>
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-dark-4">
        {book.coverImage && !imgError ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-b ${gradient} flex flex-col items-center justify-center p-4 gap-3`}>
            <div className="w-px h-8 bg-gold/40" />
            <p className="text-xs text-center text-white/80 font-serif leading-tight px-2">{book.title}</p>
            <div className="w-8 h-px bg-gold/40" />
            <p className="text-xs text-gold/60 tracking-widest uppercase">FK Éditions</p>
          </div>
        )}
        {book.preOrder && (
          <div className="absolute top-2 left-2 bg-gold text-dark text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
            Pré-commande
          </div>
        )}
        <div className="absolute top-2 right-2 bg-dark/90 border border-gold/40 px-2 py-0.5">
          <span className="text-gold text-xs font-semibold">{book.price} $</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <Link href={`/livres/${book.slug}`}>
            <h3 className={`font-serif text-sm leading-snug line-clamp-2 hover:underline underline-offset-2 ${isLight ? 'text-[#1a1a1a]' : 'text-cream'}`}>
              {book.title}
            </h3>
          </Link>
          <p className={`text-xs mt-1.5 font-medium ${isLight ? 'text-[#5a4a2a]' : 'text-gold'}`}>
            {book.price} $ USD
          </p>
        </div>

        {showBuyButton && (
          <div className="mt-auto">
            {isLight ? (
              <Link
                href={`/livres/${book.slug}`}
                className="block w-full text-center py-2 text-xs bg-transparent border border-[#baa87a] hover:bg-gold hover:border-gold hover:text-dark text-[#8a6a2a] font-medium transition-colors tracking-wide uppercase"
              >
                Voir le livre
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href={`/livres/${book.slug}`} className="flex-1 text-center py-2 text-xs border border-dark-4 hover:border-gold/40 text-cream-muted hover:text-cream transition-colors">
                  Détails
                </Link>
                <Link href={`/livres/${book.slug}`} className="flex-1 text-center py-2 text-xs bg-gold hover:bg-gold-light text-dark font-semibold transition-colors">
                  {book.preOrder ? 'Pré-commander' : 'Acheter'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
