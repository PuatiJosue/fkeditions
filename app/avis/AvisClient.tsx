import MessageForm from './_components/MessageForm'
import LoginPrompt from './_components/LoginPrompt'
import CommentList from './_components/CommentList'
import type { CommentItem } from './_components/CommentCard'

interface Props {
  comments: CommentItem[]
  isLogged: boolean
  userName: string | null
}

export default function AvisClient({ comments, isLogged, userName }: Props) {
  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Vos voix</span>
          <h1 className="section-title">
            Livre <em className="serif-i">d&apos;or</em>
          </h1>
          <p style={{ marginTop: 28, color: 'var(--ink-soft)', fontSize: 18, lineHeight: 1.6, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            Lecteurs, auteurs, ami·e·s de la maison — partagez avec nous ce que
            FK Éditions vous inspire. Chaque message est lu avec attention par
            notre équipe avant publication.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0, paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ maxWidth: 720 }}>
          {isLogged ? <MessageForm userName={userName} /> : <LoginPrompt />}
        </div>
      </section>

      <CommentList comments={comments} />
    </>
  )
}
