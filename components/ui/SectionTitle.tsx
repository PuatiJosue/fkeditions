interface SectionTitleProps {
  label: string
  center?: boolean
  light?: boolean
}

export default function SectionTitle({ label, center = false, light = false }: SectionTitleProps) {
  return (
    <div className={center ? 'text-center' : ''}>
      <div className={`flex items-center gap-3 mb-1 ${center ? 'justify-center' : ''}`}>
        <div className="h-px w-8 bg-gold" />
        <span className="text-gold text-xs tracking-widest uppercase font-semibold">
          {label}
        </span>
        <div className="h-px w-8 bg-gold" />
      </div>
    </div>
  )
}
