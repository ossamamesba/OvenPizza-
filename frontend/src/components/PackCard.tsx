import { Check } from 'lucide-react'
import type { PublicPack } from '@shared/api/types'
import { formatPrice, pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../api/client'

interface Props {
  pack: PublicPack
  selected?: boolean
  onSelect?: () => void
}

/** Carte d'un pack : prix par pizza, description et pastilles des pizzas (style des flyers). */
export function PackCard({ pack, selected = false, onSelect }: Props) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold md:text-3xl">{pack.name}</h3>
          {pack.description && <p className="mt-1 text-muted">{pack.description}</p>}
        </div>
        {onSelect && (
          <span className={`grid size-8 shrink-0 place-items-center rounded-full ring-2 ${selected ? 'bg-primary text-white ring-primary' : 'ring-border'}`} aria-hidden="true">
            {selected && <Check className="size-5" />}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-4xl font-bold text-primary tabular-nums">
        {formatPrice(pack.price)} <span className="font-sans text-base font-semibold text-muted">/ pizza</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-muted">
        {pack.pizzas.length} pizzas au choix · {pack.maxVarieties} variétés maximum
      </p>
      <ul className="mt-5 flex -space-x-3" aria-label={`Pizzas du ${pack.name}`}>
        {pack.pizzas.map((pizza) => {
          const url = pizzaImageUrl(pizza.image, API_URL)
          return (
            <li key={pizza.id} title={pizza.name}>
              {url ? (
                <img src={url} alt={pizza.name} loading="lazy" className="size-14 rounded-full object-cover ring-4 ring-surface md:size-16" />
              ) : (
                <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-xs ring-4 ring-surface md:size-16">{pizza.name}</span>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )

  const className = `block h-full w-full rounded-card bg-surface p-6 text-left shadow-card transition-shadow md:p-8 ${selected ? 'ring-2 ring-primary' : 'ring-1 ring-border hover:ring-primary/40'}`

  return onSelect ? (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  )
}
