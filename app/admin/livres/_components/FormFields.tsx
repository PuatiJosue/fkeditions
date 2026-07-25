import { inputCls, labelCls } from './styles'

/** Champ texte/number libellé. */
export function Field({
  label, value, onChange, type = 'text', placeholder = '', note = '', required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  note?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} placeholder:text-cream-muted/40`}
      />
      {note && <p className="text-[11px] text-cream-muted/60">{note}</p>}
    </div>
  )
}

/** Liste déroulante libellée. */
export function Select({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/** Case à cocher libellée. */
export function Checkbox({
  id, label, checked, onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-gold" />
      <label htmlFor={id} className="text-sm text-cream-dim cursor-pointer">{label}</label>
    </div>
  )
}
