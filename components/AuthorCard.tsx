'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Author } from '@/data/authors'

export default function AuthorCard({ author }: { author: Author }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group bg-dark-3 border border-dark-4 hover:border-gold/30 transition-all duration-300 rounded-sm overflow-hidden">
      {/* Photo */}
      <div className="relative h-72 sm:h-80 overflow-hidden bg-dark-4">
        {!imgError ? (
          <Image
            src={author.photo}
            alt={author.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-dark-4 to-dark-3 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-dark-2 border-2 border-gold/30 flex items-center justify-center">
              <span className="font-serif text-3xl text-gold/60">
                {author.name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-3 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-6">
        <p className="text-xs text-gold uppercase tracking-widest mb-1">{author.role}</p>
        <h3 className="font-serif text-xl text-cream mb-3">{author.name}</h3>
        <p className="text-sm text-cream-muted leading-relaxed line-clamp-4">{author.bio}</p>
        <Link
          href={`/auteurs`}
          className="mt-4 inline-block text-xs text-gold border-b border-gold/40 hover:border-gold transition-colors pb-0.5"
        >
          Voir la biographie complète →
        </Link>
      </div>
    </div>
  )
}
