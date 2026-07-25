import CommentCard, { type CommentItem } from './CommentCard'

/** En-tête « Récents » + liste des messages (ou état vide). */
export default function CommentList({ comments }: { comments: CommentItem[] }) {
  return (
    <section className="fk-section" style={{ paddingTop: 0 }}>
      <div className="fk-container" style={{ maxWidth: 880 }}>
        <div style={{ marginBottom: 32 }}>
          <span className="kicker">Récents</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--ink)', marginTop: 8 }}>
            {comments.length} message{comments.length > 1 ? 's' : ''}
          </h2>
        </div>

        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-elev)', border: '1px solid var(--line)' }}>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
              Soyez le premier à écrire
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
              Le livre d&apos;or attend votre première contribution.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {comments.map((c) => (
              <CommentCard key={c.id} comment={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
