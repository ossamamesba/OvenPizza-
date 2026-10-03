import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { AdminPizza } from '@shared/api/types'
import { deletePizza, listPacks, listPizzas, updatePizza } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { ApiError } from '../lib/api'
import { PageTitle } from '../components/PageTitle'
import { PizzaThumb } from '../components/PizzaThumb'
import { buttonClass } from '../components/ui/buttonClass'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState, ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { Switch } from '../components/ui/Switch'

export function MenuPage() {
  const load = useCallback(async (signal: AbortSignal) => {
    const [packs, pizzas] = await Promise.all([listPacks(signal), listPizzas(signal)])
    return { packs, pizzas }
  }, [])
  const { data, error, loading, reload, setData: setMenu } = useAsync(load, 'pizzas')
  const pizzas = data?.pizzas
  const setData = (update: (list: AdminPizza[]) => AdminPizza[]) => setMenu((d) => ({ ...d, pizzas: update(d.pizzas) }))
  const [toggling, setToggling] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<AdminPizza | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const replace = (updated: AdminPizza) => setData((list) => list.map((p) => (p.id === updated.id ? updated : p)))

  async function toggleAvailability(pizza: AdminPizza, isAvailable: boolean) {
    setToggling(pizza.id)
    setMessage(null)
    try {
      replace(await updatePizza(pizza.id, { isAvailable }))
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof ApiError ? e.message : 'Modification impossible.' })
    } finally {
      setToggling(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deletePizza(toDelete.id)
      setData((list) => list.filter((p) => p.id !== toDelete.id))
      setMessage({ type: 'success', text: `« ${toDelete.name} » a été supprimée.` })
      setToDelete(null)
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof ApiError ? e.message : 'Suppression impossible.' })
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageTitle title="Pizzas" subtitle="Toutes les pizzas, rangées par pack. Les changements sont visibles immédiatement sur le site." />

      <div aria-live="polite">
        {message && (
          <p role={message.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl p-3 font-semibold ${message.type === 'error' ? 'bg-danger/10 text-danger' : 'bg-success-soft text-success'}`}>
            {message.text}
          </p>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {!pizzas && loading && <Spinner />}

      {data && (
        <>
          <section aria-labelledby="pizzas-title">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
              <h2 id="pizzas-title" className="sr-only">Liste des pizzas</h2>
              <Link to="/menu/new" className={buttonClass('primary', 'sm')}>
                <Plus className="size-4" aria-hidden="true" /> Ajouter une pizza
              </Link>
            </div>
            {data.pizzas.length === 0 && <EmptyState>Aucune pizza pour le moment. Ajoutez la première !</EmptyState>}
            {[...data.packs.map((pack) => ({ key: String(pack.id), title: pack.name, items: data.pizzas.filter((p) => p.packId === pack.id) })),
              { key: 'none', title: 'Sans pack (non proposées aux clients)', items: data.pizzas.filter((p) => !data.packs.some((pack) => pack.id === p.packId)) },
            ]
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <div key={group.key} className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">{group.title}</h3>
                  <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-border">
                    {group.items.map((pizza) => (
                      <li key={pizza.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                        <PizzaThumb image={pizza.image} />
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-bold">
                            <Link to={`/menu/${pizza.id}`} className="hover:text-primary hover:underline">{pizza.name}</Link>
                          </p>
                          {pizza.description && <p className="line-clamp-1 text-sm text-muted">{pizza.description}</p>}
                        </div>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={pizza.isAvailable}
                              label={`${pizza.name} disponible`}
                              disabled={toggling === pizza.id}
                              onChange={(value) => toggleAvailability(pizza, value)}
                            />
                            <span className={`w-24 text-sm font-semibold ${pizza.isAvailable ? 'text-success' : 'text-muted'}`}>
                              {pizza.isAvailable ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Link to={`/menu/${pizza.id}`} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-accent-soft" aria-label={`Modifier ${pizza.name}`}>
                              <Pencil className="size-5" aria-hidden="true" />
                            </Link>
                            <button type="button" onClick={() => setToDelete(pizza)} className="inline-flex size-11 items-center justify-center rounded-full text-danger hover:bg-danger/10" aria-label={`Supprimer ${pizza.name}`}>
                              <Trash2 className="size-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </section>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette pizza ?"
        message={`« ${toDelete?.name ?? ''} » sera retirée définitivement du menu. Pour la masquer temporairement, rendez-la plutôt indisponible.`}
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
