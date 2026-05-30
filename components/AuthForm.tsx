'use client'

export function Banner({
  kind,
  children,
}: {
  kind: 'success' | 'error'
  children: React.ReactNode
}) {
  const colors =
    kind === 'success'
      ? { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.3)', text: 'rgb(22, 163, 74)' }
      : { bg: 'rgba(220, 38, 38, 0.08)', border: 'rgba(220, 38, 38, 0.3)', text: 'rgb(220, 38, 38)' }
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: 13,
        padding: '12px 16px',
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  suffix,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  suffix?: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          fontWeight: 600,
          display: 'block',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            fontSize: 15,
            padding: suffix ? '14px 44px 14px 18px' : '14px 18px',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-soft)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {suffix && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}
