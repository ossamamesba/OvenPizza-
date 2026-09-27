interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  /** Texte visible à côté de l'interrupteur. */
  showLabel?: boolean
}

/** Interrupteur accessible (role="switch"), zone de clic ≥ 44 px. */
export function Switch({ checked, onChange, label, disabled, showLabel = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-11 items-center gap-3 disabled:cursor-wait disabled:opacity-60"
    >
      <span className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-foreground/25'}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
      {showLabel && <span className="font-semibold">{label}</span>}
    </button>
  )
}
