function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

type Props = { progress: number; currentTime: number; totalDuration: number; onSeekPct: (pct: number) => void }

/** Barre de progression cliquable + minutages. */
export default function ProgressBar({ progress, currentTime, totalDuration, onSeekPct }: Props) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        role="slider"
        aria-label="Position"
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onSeekPct((e.clientX - rect.left) / rect.width)
        }}
        style={{ position: 'relative', height: 8, background: 'var(--bg-deep)', cursor: 'pointer', borderRadius: 999, overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width 0.1s linear' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-mute)', fontVariantNumeric: 'tabular-nums' }}>
        <span>{fmt(currentTime)}</span>
        <span>{fmt(totalDuration)}</span>
      </div>
    </div>
  )
}
