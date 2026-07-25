'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Gère l'élément <audio> : lecture, position, vitesse, volume, et
 * sauvegarde/restauration automatique de la progression dans localStorage.
 */
export function useAudioPlayer(bookSlug: string) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(true)

  const storageKey = `fk-audio-pos-${bookSlug}`

  // Restaure la position sauvegardée
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved && audioRef.current) {
      const pos = parseFloat(saved)
      if (!isNaN(pos)) {
        audioRef.current.currentTime = pos
        setCurrentTime(pos)
      }
    }
  }, [bookSlug])

  // Sauvegarde périodique de la position
  useEffect(() => {
    const id = setInterval(() => {
      if (audioRef.current && playing) {
        localStorage.setItem(storageKey, String(audioRef.current.currentTime))
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

  const audioHandlers = {
    onLoadedMetadata: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      setTotalDuration(e.currentTarget.duration)
      setLoading(false)
    },
    onTimeUpdate: (e: React.SyntheticEvent<HTMLAudioElement>) => setCurrentTime(e.currentTarget.currentTime),
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => {
      setPlaying(false)
      localStorage.removeItem(storageKey)
    },
  }

  return {
    audioRef, playing, currentTime, totalDuration, rate, volume, loading, progress,
    togglePlay, skip, seekToPct, changeRate, changeVolume, audioHandlers,
  }
}
