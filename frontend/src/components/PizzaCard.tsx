import { PizzaMark } from './Logo'
import { formatPrice, pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../api/client'
import type { Pizza } from '@shared/api/types'

export function PizzaCard({ pizza }: { pizza: Pizza }) {
  const image = pizzaImageUrl(pizza.image, API_URL)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-border">
      <div className="bg-accent-soft">
        {image ? (
          <img src={image} alt={`Pizza ${pizza.name}`} loading="lazy" width={640} height={480} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="grid aspect-[4/3] w-full place-items-center">
            <PizzaMark className="size-28 opacity-90" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">{pizza.name}</h3>
          <p className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-bold tabular-nums text-on-primary">
            {formatPrice(pizza.price)}
          </p>
        </div>
        {pizza.description && <p className="text-muted">{pizza.description}</p>}
      </div>
    </article>
  )
}

export function PizzaCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card bg-surface ring-1 ring-border" aria-hidden="true">
      <div className="aspect-[4/3] bg-border/60" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-2/3 rounded bg-border/80" />
        <div className="h-4 w-full rounded bg-border/60" />
        <div className="h-4 w-4/5 rounded bg-border/60" />
      </div>
    </div>
  )
}
