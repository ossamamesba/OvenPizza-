import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  label: string
  /** Empêche d'ajouter une nouvelle variété (limite du pack atteinte). */
  canIncrease?: boolean
  max?: number
}

/** Sélecteur de quantité : − [nombre] + (zones de clic de 44 px, saisie directe possible). */
export function QuantityStepper({ value, onChange, label, canIncrease = true, max = 500 }: Props) {
  const button = 'grid size-11 place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-background p-1 ring-1 ring-border" role="group" aria-label={label}>
      <button type="button" className={`${button} hover:bg-accent-soft`} onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label={`Retirer une ${label}`}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        aria-label={`Quantité de ${label}`}
        onChange={(e) => {
          const next = Math.max(0, Math.min(max, Math.floor(Number(e.target.value) || 0)))
          if (next === 0 || value > 0 || canIncrease) onChange(next)
        }}
        className="w-12 bg-transparent text-center text-lg font-bold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        className={`${button} bg-foreground text-white hover:bg-primary`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max || (value === 0 && !canIncrease)}
        aria-label={`Ajouter une ${label}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
