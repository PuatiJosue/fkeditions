'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookData } from './types'

function autoSlug(title: string) {
  return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function fileNameFrom(path?: string) {
  return path ? path.split('/').pop() ?? '' : ''
}

/** Lit une réponse en JSON sans planter si le corps est vide ou non-JSON
 *  (évite l'erreur cryptique « Unexpected end of JSON input »). */
async function safeJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

/** Gère l'état, les fichiers et la soumission (création + uploads) du formulaire livre. */
export function useBookForm(initial?: Partial<BookData>) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  const coverInputRef = useRef<HTMLInputElement>(null)
  const epubInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const featuredInputRef = useRef<HTMLInputElement>(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage ?? '')
  const [featuredFile, setFeaturedFile] = useState<File | null>(null)
  const [featuredPreview, setFeaturedPreview] = useState(initial?.featuredImage ?? '')
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [epubName, setEpubName] = useState(fileNameFrom(initial?.epubFile))
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioName, setAudioName] = useState(fileNameFrom(initial?.audioFile))

  const [form, setForm] = useState<BookData>({
    id: initial?.id ?? '', slug: initial?.slug ?? '', title: initial?.title ?? '',
    description: initial?.description ?? '', content: initial?.content ?? '',
    price: initial?.price ?? '', pricePhysical: initial?.pricePhysical ?? '',
    priceAudio: initial?.priceAudio ?? '', category: initial?.category ?? 'Roman',
    type: initial?.type ?? 'EBOOK', stock: initial?.stock ?? '',
    year: initial?.year ?? '', pages: initial?.pages ?? '', audioDuration: initial?.audioDuration ?? '',
    coverImage: initial?.coverImage ?? '', pdfFile: initial?.pdfFile ?? '', epubFile: initial?.epubFile ?? '',
    audioFile: initial?.audioFile ?? '',
    published: initial?.published ?? true, preOrder: initial?.preOrder ?? false,
    releaseDate: initial?.releaseDate ?? '', authorId: initial?.authorId ?? '',
    coAuthors: initial?.coAuthors ?? '',
    isMagazine: initial?.isMagazine ?? false, tier: initial?.tier ?? '',
    featuredName: initial?.featuredName ?? '', featuredImage: initial?.featuredImage ?? '',
    featuredEvent: initial?.featuredEvent ?? '',
  })

  const set = (key: keyof BookData, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  function setTitle(value: string) {
    set('title', value)
    if (!isEdit) set('slug', autoSlug(value))
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCoverFile(file); setCoverPreview(URL.createObjectURL(file))
  }

  function onFeaturedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setFeaturedFile(file); setFeaturedPreview(URL.createObjectURL(file))
  }

  function onEpubChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setEpubFile(file); setEpubName(file.name)
  }

  function onAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setAudioFile(file); setAudioName(file.name)
    // Tente d'extraire la durée du fichier
    try {
      const audio = new Audio(URL.createObjectURL(file))
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio.duration)) set('audioDuration', String(Math.round(audio.duration)))
      })
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setUploadStatus('')
    try {
      const url = isEdit ? `/api/admin/books/${form.id}` : '/api/admin/books'
      const contentArray = form.content.trim()
        ? form.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : null
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content: contentArray }),
      })
      if (!res.ok) {
        const d = await safeJson(res)
        throw new Error((d.error as string) || `Erreur serveur (${res.status}). Vérifiez la base de données.`)
      }
      const created = await safeJson(res)
      const bookId = created.id as string | undefined
      if (!bookId) throw new Error('Réponse inattendue du serveur (aucun identifiant renvoyé).')
      if (coverFile) {
        setUploadStatus('Upload de la couverture…')
        await fetch(`/api/admin/books/${bookId}/cover`, { method: 'POST', headers: { 'Content-Type': coverFile.type }, body: coverFile })
      }
      if (featuredFile) {
        setUploadStatus('Upload de la photo vedette…')
        await fetch(`/api/admin/books/${bookId}/featured`, { method: 'POST', headers: { 'Content-Type': featuredFile.type }, body: featuredFile })
      }
      if (epubFile) {
        setUploadStatus('Upload du fichier ePub…')
        await fetch(`/api/admin/books/${bookId}/epub`, { method: 'POST', headers: { 'Content-Type': 'application/epub+zip' }, body: epubFile })
      }
      if (audioFile) {
        setUploadStatus('Upload du fichier audio…')
        await fetch(`/api/admin/books/${bookId}/audio`, { method: 'POST', headers: { 'Content-Type': audioFile.type || 'audio/mpeg' }, body: audioFile })
      }
      router.push(form.isMagazine ? '/admin/magazine' : '/admin/livres'); router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setSaving(false); setUploadStatus('')
    }
  }

  return {
    form, set, setTitle, isEdit, saving, error, uploadStatus,
    coverInputRef, epubInputRef, audioInputRef, featuredInputRef,
    coverFile, coverPreview, setCoverPreview, featuredFile, featuredPreview,
    epubName, epubFile, audioName, audioFile,
    onCoverChange, onFeaturedChange, onEpubChange, onAudioChange,
    handleSubmit, back: () => router.back(),
  }
}
