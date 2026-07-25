import { initials, timeAgo } from './format'

export interface CommentItem {
  id: string
  content: string
  createdAt: string
  user: { name: string | null; avatar: string | null }
}

/** Carte d'un message du livre d'or (avatar, auteur, date, contenu). */
export default function CommentCard({ comment: c }: { comment: CommentItem }) {
  return (
    <article style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(20px, 3vw, 32px)', display: 'flex', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 600, overflow: 'hidden' }}>
        {c.user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.user.avatar} alt={c.user.name ?? 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials(c.user.name)
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink)', fontWeight: 600 }}>
            {c.user.name || 'Anonyme'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>· {timeAgo(c.createdAt)}</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{c.content}</p>
      </div>
    </article>
  )
}
