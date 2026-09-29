import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@shared/lib/format'
import { LoadError } from '../components/LoadError'
import { PackCard } from '../components/PackCard'
import { PageHeader } from '../components/PageHeader'
import { PizzaImage } from '../components/PizzaImage'
import { QuantityStepper } from '../components/QuantityStepper'
import { restaurant } from '../config/restaurant'
import { usePacks } from '../hooks/usePacks'
import { summarize, useOrder } from '../order/useOrder'

export function PacksPage() {
  const { state, retry } = usePacks()
  const order = useOrder()
  const packs = state.status === 'success' ? state.packs : []
  // Premier passage : le premier pack est affiché par défaut.
  const pack = packs.find((p) => p.id === order.packId) ?? packs[0]
  const summary = summarize(pack, pack?.id === order.packId ? order.quantities : {})

  return (
    <>
      <title>{`Nos packs — ${restaurant.name}`}</title>
      <PageHeader
        title="Nos packs"
        intro={`Choisissez votre pack, puis vos pizzas et leurs quantités. Nous venons les préparer sur place, à ${restaurant.zones.join(' et ')}.`}
      />

      <div className="container-page">
        {state.status === 'loading' && <p role="status" className="py-10 text-center text-muted">Chargement des packs…</p>}
        {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
        {state.status === 'success' && packs.length === 0 && (
          <p className="rounded-card bg-surface p-8 text-center ring-1 ring-border">Nos packs sont en cours de préparation. Contactez-nous !</p>
        )}

        {packs.length > 0 && (
          <>
            <h2 className="sr-only">1. Choisissez votre pack</h2>
            <div role="radiogroup" aria-label="Pack" className="grid gap-5 md:grid-cols-2">
              {packs.map((p) => (
                <PackCard key={p.id} pack={p} selected={p.id === pack?.id} onSelect={() => order.selectPack(p.id)} />
              ))}
            </div>
          </>
        )}

        {pack && (
          <section aria-labelledby="pizzas-title" className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="pizzas-title" className="text-3xl font-bold">Vos pizzas · {pack.name}</h2>
              <p aria-live="polite" className={`rounded-full px-4 py-2 font-semibold ${summary.varieties >= pack.maxVarieties ? 'bg-primary text-on-primary' : 'bg-accent-soft text-foreground'}`}>
                Variétés choisies : {summary.varieties}/{pack.maxVarieties}
              </p>
            </div>
            {summary.varieties >= pack.maxVarieties && (
              <p className="mb-4 flex items-center gap-2 text-muted">
                <Info className="size-4 shrink-0" aria-hidden="true" /> Limite atteinte : retirez une variété pour en choisir une autre.
              </p>
            )}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pack.pizzas.map((pizza) => {
                const quantity = (pack.id === order.packId && order.quantities[pizza.id]) || 0
                return (
                  <li key={pizza.id}>
                    <article className={`flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card ring-1 transition-shadow ${quantity > 0 ? 'ring-2 ring-primary' : 'ring-border'}`}>
                      <PizzaImage image={pizza.image} name={pizza.name} />
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h3 className="text-xl font-bold">{pizza.name}</h3>
                        {pizza.description && <p className="flex-1 text-sm text-muted">{pizza.description}</p>}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-muted">Quantité</span>
                          <QuantityStepper
                            label={pizza.name}
                            value={quantity}
                            canIncrease={summary.varieties < pack.maxVarieties}
                            onChange={(q) => {
                              order.selectPack(pack.id)
                              order.setQuantity(pizza.id, q)
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      {/* Récapitulatif collé en bas de l'écran (s'arrête au-dessus du pied de page) */}
      {pack && summary.totalPizzas > 0 && (
        <div className="sticky bottom-0 z-30 mt-10 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(59_10_10/0.25)] backdrop-blur">
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <p className="text-sm sm:text-base" aria-live="polite">
              <strong>{summary.totalPizzas} pizza{summary.totalPizzas > 1 ? 's' : ''}</strong> · {summary.varieties} variété{summary.varieties > 1 ? 's' : ''}
              <span className="block font-display text-xl font-bold text-primary tabular-nums">≈ {formatPrice(String(summary.estimatedTotal))}</span>
            </p>
            <Link to="/reservation" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-on-primary transition-colors hover:bg-primary-hover">
              Réserver <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
