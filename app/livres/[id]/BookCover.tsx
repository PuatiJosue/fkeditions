'use client'

export default function BookCover({
  src,
  title,
  preOrder,
  price,
}: {
  src: string | null
  title: string
  preOrder: boolean
  price: number
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          aspectRatio: '2 / 3',
          boxShadow: 'var(--shadow-book)',
          overflow: 'hidden',
          background: 'var(--bg-deep)',
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              const parent = t.parentElement
              if (parent) {
                parent.style.background =
                  'linear-gradient(135deg, var(--accent), var(--accent-deep))'
                const placeholder = document.createElement('div')
                placeholder.style.cssText =
                  'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--serif);font-style:italic;font-size:32px;text-align:center;padding:32px;'
                placeholder.textContent = title
                parent.appendChild(placeholder)
              }
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 32,
              color: '#fff',
            }}
          >
            FK
          </div>
        )}
        {/* Reflective gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        />
        {/* Spine shadow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '8%',
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        {/* Price/badge circle */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -16,
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 500,
            transform: 'rotate(8deg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {preOrder ? 'Précom.' : `${price} $`}
        </div>
      </div>
    </div>
  )
}
