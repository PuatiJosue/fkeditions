'use client'

import { useState } from 'react'
import PasswordStrength, { isPasswordValid } from '@/components/auth/PasswordStrength'
import { Banner, Field } from '@/components/auth/AuthForm'
import type { Msg } from './types'

/** Formulaire autonome de changement de mot de passe. */
export default function PasswordForm() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<Msg | null>(null)

  const canSubmit = !loading && isPasswordValid(newPw) && newPw === confirmPw

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      setMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (!isPasswordValid(newPw)) {
      setMsg({ type: 'err', text: 'Le mot de passe ne respecte pas les critères de sécurité.' })
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'ok', text: 'Mot de passe modifié avec succès.' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(24px, 3vw, 36px)' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 6 }}>
        Changer le mot de passe
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 24 }}>
        Pour votre sécurité, choisissez un mot de passe difficile à deviner.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <Field label="Mot de passe actuel" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" required />
        <div>
          <Field
            label="Nouveau mot de passe"
            type={showNewPw ? 'text' : 'password'}
            value={newPw}
            onChange={setNewPw}
            placeholder="Créez un mot de passe sécurisé"
            required
            suffix={
              <button type="button" onClick={() => setShowNewPw((v) => !v)} tabIndex={-1} style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  {showNewPw ? (
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <>
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            }
          />
          <PasswordStrength password={newPw} />
        </div>
        <Field label="Confirmer le nouveau mot de passe" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" required />
        {confirmPw && (
          <p style={{ fontSize: 12, color: confirmPw === newPw ? '#16a34a' : '#dc2626' }}>
            {confirmPw === newPw ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
          </p>
        )}
        {msg && <Banner kind={msg.type === 'ok' ? 'success' : 'error'}>{msg.text}</Banner>}
        <button type="submit" disabled={!canSubmit} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: canSubmit ? 1 : 0.4, padding: '12px 28px' }}>
          <span>{loading ? 'Modification…' : 'Modifier le mot de passe'}</span>
          <span className="shimmer" />
        </button>
        {newPw && !isPasswordValid(newPw) && (
          <p style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
            Respectez tous les critères obligatoires pour activer le bouton.
          </p>
        )}
      </form>
    </div>
  )
}
