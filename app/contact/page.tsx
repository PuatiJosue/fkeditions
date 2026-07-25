import ContactInfo from './_components/ContactInfo'
import ContactForm from './_components/ContactForm'

export default function ContactPage() {
  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Nous contacter</span>
          <h1 className="section-title">
            Échangeons <em className="serif-i">ensemble</em>
          </h1>
          <p style={{ marginTop: 28, color: 'var(--ink-soft)', fontSize: 18, lineHeight: 1.6, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Une question, une collaboration ou simplement envie d&apos;échanger ?
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'start' }}>
            <ContactInfo />
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
