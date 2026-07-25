import Image from 'next/image'
import type { RefObject } from 'react'
import type { BookData } from './types'
import { inputCls, labelCls, pickBtnCls } from './styles'

type Props = {
  form: BookData
  set: (key: keyof BookData, value: string | boolean) => void
  featuredInputRef: RefObject<HTMLInputElement | null>
  featuredPreview: string
  featuredFile: File | null
  onFeaturedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/** Champs de la vedette (joueur/club) affichée dans la galerie /magazine. */
export default function MagazineFeaturedFields({ form, set, featuredInputRef, featuredPreview, featuredFile, onFeaturedChange }: Props) {
  return (
    <div className="flex flex-col gap-3 border border-gold/30 bg-gold/5 p-4">
      <p className="text-xs text-gold uppercase tracking-widest">Galerie Magazine — Vedette</p>
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Nom du joueur / club</label>
        <input type="text" value={form.featuredName} onChange={(e) => set('featuredName', e.target.value)}
          placeholder="ex : Lionel Messi" className={`${inputCls} placeholder:text-cream-muted/40`} />
        <p className="text-[11px] text-cream-muted/60">Les éditions Premium et Gold d&apos;un même joueur doivent porter <strong className="text-cream-dim">exactement le même nom</strong> pour être regroupées sur la même page.</p>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Niveau (édition)</label>
        <select value={form.tier} onChange={(e) => set('tier', e.target.value)} className={inputCls}>
          <option value="">— Aucun (édition unique) —</option>
          <option value="PREMIUM">Premium</option>
          <option value="GOLD">Gold</option>
        </select>
        <p className="text-[11px] text-cream-muted/60">Détermine le badge et l&apos;ordre d&apos;affichage sur la page de choix (Premium puis Gold).</p>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Rencontre / événement (optionnel)</label>
        <input type="text" value={form.featuredEvent} onChange={(e) => set('featuredEvent', e.target.value)}
          placeholder="ex : Interview prévue le 15 juillet 2026" className={`${inputCls} placeholder:text-cream-muted/40`} />
        <p className="text-[11px] text-cream-muted/60">Affiché en bas de la photo dans la galerie.</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelCls}>Photo du joueur / club</label>
        <div className="flex gap-4 items-start">
          {featuredPreview && (
            <div className="relative w-16 h-20 shrink-0 border border-dark-4 overflow-hidden">
              <Image src={featuredPreview} alt="Vedette" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <input ref={featuredInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFeaturedChange} className="hidden" />
            <button type="button" onClick={() => featuredInputRef.current?.click()} className={pickBtnCls}>
              {featuredFile ? featuredFile.name : featuredPreview ? 'Changer la photo' : 'Choisir la photo de la vedette'}
            </button>
            <p className="text-[11px] text-cream-muted/60 mt-1">Affichée dans la galerie de l&apos;espace Magazine. Si vide, on utilise la couverture.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
