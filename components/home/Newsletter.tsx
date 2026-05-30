'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 2400)
  }

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="fk-container">
        <div className="newsletter-inner reveal">
          <span className="kicker">Restez informé·e</span>
          <h2>
            Ne manquez <em>rien</em>.
          </h2>
          <p>
            Inscrivez-vous à notre newsletter et recevez en avant-première nos
            actualités, nouvelles parutions et événements à Kinshasa et ailleurs.
          </p>
          <form className="newsletter-form" onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">{submitted ? 'Merci ✓' : "S'inscrire"}</button>
          </form>
          <p className="newsletter-fine">Une lettre par mois. Désinscription en un clic.</p>
        </div>
      </div>
    </section>
  )
}
