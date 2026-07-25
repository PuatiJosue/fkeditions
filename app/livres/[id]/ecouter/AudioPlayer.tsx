'use client'

import Link from 'next/link'
import { useAudioPlayer } from './_components/useAudioPlayer'
import TrackInfo from './_components/TrackInfo'
import ProgressBar from './_components/ProgressBar'
import PlayerControls from './_components/PlayerControls'
import PlaybackSettings from './_components/PlaybackSettings'

interface Props {
  bookSlug: string
  title: string
  author: string
  coverImage: string | null
  audioUrl: string
  duration: number
}

export default function AudioPlayer({ bookSlug, title, author, coverImage, audioUrl }: Props) {
  const {
    audioRef, playing, currentTime, totalDuration, rate, volume, loading, progress,
    togglePlay, skip, seekToPct, changeRate, changeVolume, audioHandlers,
  } = useAudioPlayer(bookSlug)

  return (
    <section className="fk-section" style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center', paddingTop: 'clamp(40px, 6vh, 80px)' }}>
      <div className="fk-container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href={`/livres/${bookSlug}`} className="link-arrow" style={{ display: 'inline-flex' }}>
            ← Retour à la fiche du livre
          </Link>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(28px, 5vw, 56px)', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center' }}>
          <TrackInfo coverImage={coverImage} title={title} author={author} playing={playing} />
          <ProgressBar progress={progress} currentTime={currentTime} totalDuration={totalDuration} onSeekPct={seekToPct} />
          <PlayerControls playing={playing} onTogglePlay={togglePlay} onSkip={skip} />
          <PlaybackSettings rate={rate} onChangeRate={changeRate} volume={volume} onChangeVolume={changeVolume} />

          <p style={{ fontSize: 12, color: 'var(--ink-mute)', maxWidth: 480 }}>
            Votre progression est sauvegardée automatiquement. Vous pouvez fermer la
            page et reprendre où vous en étiez à tout moment.
          </p>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" {...audioHandlers} style={{ display: 'none' }} />

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--ink-mute)', marginTop: 16, fontSize: 13 }}>
            Chargement de l&apos;audio…
          </p>
        )}
      </div>
    </section>
  )
}
