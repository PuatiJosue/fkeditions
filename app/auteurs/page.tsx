import { getAuthorsDetail } from '@/lib/services/authors'
import AuthorCard from './_components/AuthorCard'
import AboutFK from './_components/AboutFK'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nos auteurs — FK Éditions' }

export default async function AuteursPage() {
  const authors = await getAuthorsDetail()

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>La famille FK Éditions</span>
          <h1 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Nos <em className="serif-i">auteurs</em>
          </h1>
          <p style={{ marginTop: 28, color: 'var(--ink-soft)', fontSize: 18, lineHeight: 1.6, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Rencontrez les voix qui donnent vie à notre catalogue — des hommes et
            des femmes qui ont choisi de partager leur monde avec vous.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          {authors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--ink)' }}>
                Aucun auteur pour le moment
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 8 }}>Revenez bientôt.</p>
            </div>
          ) : (
            authors.map((author) => <AuthorCard key={author.id} author={author} />)
          )}

          <AboutFK />
        </div>
      </section>
    </>
  )
}
