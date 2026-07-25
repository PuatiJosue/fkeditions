const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2]

const labelStyle = { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 } as const

type Props = {
  rate: number
  onChangeRate: (r: number) => void
  volume: number
  onChangeVolume: (v: number) => void
}

/** Réglages de vitesse de lecture et de volume. */
export default function PlaybackSettings({ rate, onChangeRate, volume, onChangeVolume }: Props) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={labelStyle}>Vitesse</span>
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => onChangeRate(r)}
            style={{ padding: '4px 8px', fontSize: 12, background: rate === r ? 'var(--accent)' : 'transparent', color: rate === r ? '#fff' : 'var(--ink-soft)', border: rate === r ? '1px solid var(--accent)' : '1px solid var(--line)', cursor: 'pointer', fontWeight: 600, borderRadius: 4 }}
          >
            {r}×
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={labelStyle}>🔊</span>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => onChangeVolume(parseFloat(e.target.value))} style={{ width: 100, accentColor: 'var(--accent)' }} />
      </div>
    </div>
  )
}
