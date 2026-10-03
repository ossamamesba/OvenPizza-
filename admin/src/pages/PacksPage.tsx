import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import type { AdminPack, AdminPizza } from '@shared/api/types'
import { formatPrice } from '@shared/lib/format'
import { listPacks, listPizzas } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { PageTitle } from '../components/PageTitle'
import { PizzaThumb } from '../components/PizzaThumb'
import { buttonClass } from '../components/ui/buttonClass'
import { EmptyState, ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'

/** Vue d'ensemble : chaque pack avec son prix et ses pizzas. */
export function PacksPage() {
  const load = useCallback(async (signal: AbortSignal) => {
    const [packs, pizzas] = await Promise.all([listPacks(signal), listPizzas(signal)])
    return { packs, pizzas }
  }, [])
  const { data, error, loading, reload } = useAsync(load)

  return (
    <>
      <PageTitle
        title="Packs"
        subtitle="Prix par pizza et pizzas proposées dans chaque pack."
        actions={
          <Link to="/packs/new" className={buttonClass('primary')}>
            <Plus className="size-5" aria-hidden="true" /> Ajouter un pack
          </Link>
        }
      />
      {error && <ErrorState message={error} onRetry={reload} />}
      {!data && loading && <Spinner />}
      {data && data.packs.length === 0 && <EmptyState>Aucun pack. Créez-en un pour proposer vos pizzas aux clients.</EmptyState>}
      {data && (
        <div className="space-y-6">
          {data.packs.map((pack) => (
            <PackSection key={pack.id} pack={pack} pizzas={data.pizzas.filter((p) => p.packId === pack.id)} />
          ))}
        </div>
      )}
    </>
  )
}

function PackSection({ pack, pizzas }: { pack: AdminPack; pizzas: AdminPizza[] }) {
  return (
    <section aria-labelledby={`pack-${pack.id}`} className="overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-border">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 md:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={`pack-${pack.id}`} className="text-2xl font-bold">{pack.name}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pack.isActive ? 'bg-success-soft text-success' : 'bg-foreground/10 text-muted'}`}>
              {pack.isActive ? 'Visible sur le site' : 'Masqué'}
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-primary tabular-nums">
            {formatPrice(pack.price)} <span className="font-sans text-sm font-semibold text-muted">/ pizza · {pack.maxVarieties} variétés max.</span>
          </p>
          {pack.description && <p className="mt-1 text-muted">{pack.description}</p>}
        </div>
        <Link to={`/packs/${pack.id}`} className={buttonClass('secondary', 'sm')}>
          <Pencil className="size-4" aria-hidden="true" /> Modifier le pack
        </Link>
      </div>

      {pizzas.length === 0 ? (
        <p className="p-5 text-muted">Aucune pizza dans ce pack.</p>
      ) : (
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          {pizzas.map((pizza) => (
            <li key={pizza.id} className="bg-surface">
              <Link to={`/menu/${pizza.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-accent-soft/50">
                <PizzaThumb image={pizza.image} className="size-14" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{pizza.name}</span>
                  <span className={`text-sm font-semibold ${pizza.isAvailable ? 'text-success' : 'text-muted'}`}>
                    {pizza.isAvailable ? 'Disponible' : 'Indisponible'}
                  </span>
                </span>
                <Pencil className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <span className="sr-only">Modifier {pizza.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-border p-4">
        <Link to={`/menu/new?packId=${pack.id}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">
          <Plus className="size-4" aria-hidden="true" /> Ajouter une pizza à ce pack
        </Link>
      </div>
    </section>
  )
}
