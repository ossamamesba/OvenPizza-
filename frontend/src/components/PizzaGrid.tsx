import { RotateCw } from 'lucide-react'
import { PizzaCard, PizzaCardSkeleton } from './PizzaCard'
import { usePizzas } from '../hooks/usePizzas'

/** Grille du menu avec états chargement / erreur / vide. `limit` pour un aperçu (page d'accueil). */
export function PizzaGrid({ limit }: { limit?: number }) {
  const { state, retry } = usePizzas()

  if (state.status === 'loading') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Chargement du menu">
        {Array.from({ length: limit ?? 6 }, (_, i) => <PizzaCardSkeleton key={i} />)}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="rounded-card bg-surface p-8 text-center ring-1 ring-border">
        <p className="mb-4 font-semibold">{state.message}</p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          <RotateCw className="size-4" aria-hidden="true" /> Réessayer
        </button>
      </div>
    )
  }

  const pizzas = limit ? state.pizzas.slice(0, limit) : state.pizzas
  if (pizzas.length === 0) {
    return <p className="rounded-card bg-surface p-8 text-center ring-1 ring-border">Le menu est en cours de préparation. Revenez bientôt !</p>
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pizzas.map((pizza) => (
        <li key={pizza.id}>
          <PizzaCard pizza={pizza} />
        </li>
      ))}
    </ul>
  )
}
