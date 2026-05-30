'use client'

export default function AuthorPortrait({
  photo,
  name,
}: {
  photo: string | null
  name: string
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 380,
        background: 'var(--bg-deep)',
        overflow: 'hidden',
      }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            filter: 'grayscale(0.3) contrast(1.05)',
          }}
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const parent = t.parentElement
            if (parent) {
              const span = document.createElement('span')
              span.style.cssText =
                'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-style:italic;font-size:120px;color:var(--line);'
              span.textContent = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
              parent.appendChild(span)
            }
          }}
        />
      ) : (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 120,
            color: 'var(--line)',
          }}
        >
          {name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
        </span>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.2))',
          opacity: 0.6,
        }}
      />
    </div>
  )
}
