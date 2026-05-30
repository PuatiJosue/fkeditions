'use client'

import { useState, useMemo } from 'react'
import CheckoutSection from '@/components/CheckoutSection'

type FormatKey = 'ebook' | 'physical' | 'audio'

interface Props {
  bookId: string
  bookTitle: string
  price: number
  pricePhysical?: number | null
  priceAudio?: number | null
  preOrder: boolean
  releaseDate?: string
  successParam?: string
  cancelledParam?: string
}

export default function BookFormatSelector({
  bookId,
  bookTitle,
  price,
  pricePhysical,
  priceAudio,
  preOrder,
  releaseDate,
  successParam,
  cancelledParam,
}: Props) {
  const formats = useMemo(
    () =>
      (
        [
          { value: 'ebook' as FormatKey, label: 'Ebook', icon: '📖', price, available: price > 0 },
          { value: 'physical' as FormatKey, label: 'Livre physique', icon: '📚', price: pricePhysical ?? 0, available: !!pricePhysical && pricePhysical > 0 },
          { value: 'audio' as FormatKey, label: 'Livre audio', icon: '🎧', price: priceAudio ?? 0, available: !!priceAudio && priceAudio > 0 },
        ] as const
      ).filter((f) => f.available),
    [price, pricePhysical, priceAudio]
  )

  const [format, setFormat] = useState<FormatKey>(formats[0]?.value ?? 'ebook')
  const active = formats.find((f) => f.value === format) ?? formats[0]
  const activeTitle =
    formats.length > 1 ? `${bookTitle} — ${active?.label}` : bookTitle

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sélecteur de format */}
      {formats.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              fontWeight: 600,
            }}
          >
            Choisir le format
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${formats.length}, 1fr)`,
              gap: 8,
            }}
          >
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                style={{
                  padding: '12px 8px',
                  border: format === f.value ? '2px solid var(--accent)' : '1px solid var(--line)',
                  background: format === f.value ? 'var(--accent-soft)' : 'var(--paper)',
                  color: format === f.value ? 'var(--accent-deep)' : 'var(--ink)',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontWeight: format === f.value ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s var(--ease-out)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span>{f.label}</span>
                <span
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  {f.price} $
                </span>
              </button>
            ))}
          </div>
          {format === 'physical' && (
            <p style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
              Notre équipe vous contactera pour organiser la livraison à Kinshasa.
            </p>
          )}
          {format === 'audio' && (
            <p style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
              🎧 Lecture audio illimitée depuis votre bibliothèque, sur tous vos appareils.
            </p>
          )}
        </div>
      )}

      {/* Prix */}
      <div>
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Prix
        </p>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 40,
            color: 'var(--accent)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
          }}
        >
          {active?.price} ${' '}
          <span
            style={{
              fontSize: 14,
              color: 'var(--ink-mute)',
              fontWeight: 400,
              fontStyle: 'normal',
            }}
          >
            USD
          </span>
        </p>
      </div>

      <CheckoutSection
        bookId={bookId}
        bookTitle={activeTitle}
        price={active?.price ?? price}
        successParam={successParam}
        cancelledParam={cancelledParam}
        preOrder={preOrder}
        releaseDate={releaseDate}
      />
    </div>
  )
}
