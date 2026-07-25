type Props = { coverImage: string | null; title: string; author: string; playing: boolean }

/** Pochette + titre/auteur du livre audio. */
export default function TrackInfo({ coverImage, title, author, playing }: Props) {
  return (
    <>
      <div style={{ width: 'min(280px, 60vw)', aspectRatio: '2 / 3', boxShadow: 'var(--shadow-book)', background: 'var(--bg-deep)', overflow: 'hidden', position: 'relative' }}>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))' }} />
        )}
        {playing && (
          <div style={{ position: 'absolute', top: 10, right: 10, width: 44, height: 44, background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s ease-in-out infinite' }}>
            🎧
          </div>
        )}
      </div>

      <div>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
          Livre audio
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 8 }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-soft)' }}>
          {author}
        </p>
      </div>
    </>
  )
}
