import type { CSSProperties } from 'react'

const controlBtnStyle: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'var(--bg-elev)',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s var(--ease-out)',
}

type Props = { playing: boolean; onTogglePlay: () => void; onSkip: (seconds: number) => void }

/** Boutons de lecture : reculer 15s, play/pause, avancer 30s. */
export default function PlayerControls({ playing, onTogglePlay, onSkip }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button onClick={() => onSkip(-15)} aria-label="-15 secondes" style={controlBtnStyle} title="Reculer 15s">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">15</text>
        </svg>
      </button>

      <button
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause' : 'Lecture'}
        style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', transition: 'transform 0.15s var(--ease-out)' }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = '')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
      >
        {playing ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 4 }}>
            <path d="M7 5v14l12-7z" />
          </svg>
        )}
      </button>

      <button onClick={() => onSkip(30)} aria-label="+30 secondes" style={controlBtnStyle} title="Avancer 30s">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
          <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">30</text>
        </svg>
      </button>
    </div>
  )
}
