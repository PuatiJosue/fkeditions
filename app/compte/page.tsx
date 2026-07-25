'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AccountSidebar from './_components/AccountSidebar'
import PersonalInfoForm from './_components/PersonalInfoForm'
import PasswordForm from './_components/PasswordForm'
import type { UserProfile } from './_components/types'

export default function ComptePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (session === null) router.push('/login?callbackUrl=/compte')
  }, [session, router])

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setProfile(data) })
      .catch(() => {})
  }, [session])

  if (!session) return null

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(32px, 4vh, 48px)' }}>
        <div className="fk-container">
          <span className="kicker">Mon espace</span>
          <h1 className="section-title" style={{ marginTop: 16 }}>
            Mon <em className="serif-i">compte</em>
          </h1>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          <div className="compte-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 3fr', gap: 'clamp(32px, 4vw, 56px)', alignItems: 'start' }}>
            <AccountSidebar profile={profile} setProfile={setProfile} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <PersonalInfoForm profile={profile} setProfile={setProfile} />
              <PasswordForm />
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 880px) {
          .compte-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
