import type { Pizza } from '@shared/api/types'
import { PizzaImage } from './PizzaImage'

/** Carte d'une pizza : photo, nom, pack (le prix est celui du pack) et description. */
export function PizzaCard({ pizza, packName }: { pizza: Pizza; packName?: string }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-border">
      <PizzaImage image={pizza.image} name={pizza.name} />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">{pizza.name}</h3>
          {packName && (
            <p className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">{packName}</p>
          )}
        </div>
        {pizza.description && <p className="text-muted">{pizza.description}</p>}
      </div>
    </article>
  )
}
