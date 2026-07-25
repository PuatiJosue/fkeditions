import type { CSSProperties, ReactNode } from 'react'

/** Section numérotée d'un document légal. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontSize: 20 }}>{id}.</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Paragraphe de corps de texte légal. */
export function P({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, ...style }}>{children}</p>
}

/** Liste à puces « terme — description ». */
export function BulletList({ items }: { items: [string, string][] }) {
  return (
    <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(([bold, rest], i) => (
        <li key={i} style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, paddingLeft: 24, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, top: 12, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
          <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{bold}</strong> — {rest}
        </li>
      ))}
    </ul>
  )
}

/** Lien inline dans le style « accent ». */
export const accentLink = { color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 } as const
