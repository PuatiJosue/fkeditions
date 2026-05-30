'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Props {
  bookSlug: string
  title: string
  author: string
  coverImage: string | null
  audioUrl: string
  duration: number
}

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

export default function AudioPlayer({ bookSlug, title, author, coverImage, audioUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(true)

  // Restore position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`fk-audio-pos-${bookSlug}`)
    if (saved && audioRef.current) {
      const pos = parseFloat(saved)
      if (!isNaN(pos)) {
        audioRef.current.currentTime = pos
        setCurrentTime(pos)
      }
    }
  }, [bookSlug])

  // Save position periodically
  useEffect(() => {
    const id = setInterval(() => {
      if (audioRef.current && playing) {
        localStorage.setItem(`fk-audio-pos-${bookSlug}`, String(audioRef.current.currentTime))
      }
    }, 5000)
    return () => clearInterval(id)
  }, [playing, bookSlug])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
  }

  function skip(seconds: number) {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(totalDuration, audioRef.current.currentTime + seconds))
  }

  function seekToPct(pct: number) {
    if (!audioRef.current || !totalDuration) return
    audioRef.current.currentTime = pct * totalDuration
  }

  function changeRate(r: number) {
    if (audioRef.current) audioRef.current.playbackRate = r
    setRate(r)
  }

  function changeVolume(v: number) {
    if (audioRef.current) audioRef.current.volume = v
    setVolume(v)
  }

  const progress = totalDuration ? currentTime / totalDuration : 0

  return (
    <section
      className="fk-section"
      style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center', paddingTop: 'clamp(40px, 6vh, 80px)' }}
    >
      <div className="fk-container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            href={`/livres/${bookSlug}`}
            className="link-arrow"
            style={{ display: 'inline-flex' }}
          >
            ← Retour à la fiche du livre
          </Link>
        </div>

        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            padding: 'clamp(28px, 5vw, 56px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Cover */}
          <div
            style={{
              width: 'min(280px, 60vw)',
              aspectRatio: '2 / 3',
              boxShadow: 'var(--shadow-book)',
              background: 'var(--bg-deep)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                }}
              />
            )}
            {playing && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 44,
                  height: 44,
                  background: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                🎧
              </div>
            )}
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Livre audio
            </p>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(26px, 4vw, 38px)',
                fontWeight: 500,
                color: 'var(--ink)',
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 18,
                color: 'var(--ink-soft)',
              }}
            >
              {author}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              role="slider"
              aria-label="Position"
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seekToPct((e.clientX - rect.left) / rect.width)
              }}
              style={{
                position: 'relative',
                height: 8,
                background: 'var(--bg-deep)',
                cursor: 'pointer',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${progress * 100}%`,
                  background: 'var(--accent)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-mute)', fontVariantNumeric: 'tabular-nums' }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => skip(-15)}
              aria-label="-15 secondes"
              style={controlBtnStyle}
              title="Reculer 15s"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">15</text>
              </svg>
            </button>

            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Lecture'}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.15s var(--ease-out)',
              }}
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

            <button
              onClick={() => skip(30)}
              aria-label="+30 secondes"
              style={controlBtnStyle}
              title="Avancer 30s"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
                <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">30</text>
              </svg>
            </button>
          </div>

          {/* Speed + Volume */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>
                Vitesse
              </span>
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => changeRate(r)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    background: rate === r ? 'var(--accent)' : 'transparent',
                    color: rate === r ? '#fff' : 'var(--ink-soft)',
                    border: rate === r ? '1px solid var(--accent)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    borderRadius: 4,
                  }}
                >
                  {r}×
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>
                🔊
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                style={{ width: 100, accentColor: 'var(--accent)' }}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--ink-mute)', maxWidth: 480 }}>
            Votre progression est sauvegardée automatiquement. Vous pouvez fermer la
            page et reprendre où vous en étiez à tout moment.
          </p>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const a = e.currentTarget
            setTotalDuration(a.duration)
            setLoading(false)
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            localStorage.removeItem(`fk-audio-pos-${bookSlug}`)
          }}
          style={{ display: 'none' }}
        />

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--ink-mute)', marginTop: 16, fontSize: 13 }}>
            Chargement de l&apos;audio…
          </p>
        )}
      </div>
    </section>
  )
}

const controlBtnStyle: React.CSSProperties = {
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
