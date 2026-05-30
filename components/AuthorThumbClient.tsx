'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  photo: string
  name: string
}

export default function AuthorThumbClient({ photo, name }: Props) {
  const [error, setError] = useState(false)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gold/30 bg-dark-4">
        {!error ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="56px"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-3">
            <span className="font-serif text-lg text-gold/60">{initials}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-cream-muted">{name.split(' ')[0]}</p>
    </div>
  )
}
