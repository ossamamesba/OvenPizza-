import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AdminReservation, ReservationStatus } from '@shared/api/types'
import { toIsoDate } from '@shared/lib/format'
import { listReservations } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { PageTitle } from '../components/PageTitle'
import { ReservationCard } from '../components/ReservationCard'
import { EmptyState, ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'

const TABS: { value: ReservationStatus | ''; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'refused', label: 'Refusées' },
  { value: '', label: 'Toutes' },
]

/** Filtres dans l'URL (?status=pending&date=2026-10-01) : on peut partager ou revenir en arrière. */
export function ReservationsPage() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? (params.has('date') ? '' : 'pending')) as ReservationStatus | ''
  const date = params.get('date') ?? ''

  const setFilter = (key: 'status' | 'date', value: string) => {
    const next = new URLSearchParams(params)
    next.set('status', key === 'status' ? value : status)
    if (key === 'date') {
      if (value) next.set('date', value)
      else next.delete('date')
    }
    setParams(next, { replace: true })
  }

  const today = toIsoDate(new Date())

  return (
    <>
      <PageTitle title="Réservations" />

      <div className="mb-6 space-y-4">
        <div role="tablist" aria-label="Statut" className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setFilter('status', tab.value)}
              className={`min-h-11 shrink-0 rounded-full px-5 font-semibold transition-colors ${status === tab.value ? 'bg-foreground text-white' : 'bg-surface ring-1 ring-border hover:ring-foreground/30'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-semibold">Date</label>
            <input
              id="date-filter"
              type="date"
              value={date}
              onChange={(e) => setFilter('date', e.target.value)}
              className="mt-1 min-h-11 rounded-xl border border-border bg-surface px-3"
            />
          </div>
          <button type="button" onClick={() => setFilter('date', today)} className="min-h-11 rounded-full px-4 font-semibold ring-1 ring-border hover:ring-foreground/30">
            Aujourd'hui
          </button>
          {date && (
            <button type="button" onClick={() => setFilter('date', '')} className="min-h-11 rounded-full px-4 font-semibold text-primary hover:underline">
              Toutes les dates
            </button>
          )}
        </div>
      </div>

      <ReservationList status={status} date={date} />
    </>
  )
}

function ReservationList({ status, date }: { status: ReservationStatus | ''; date: string }) {
  const load = useCallback(
    (signal: AbortSignal) => listReservations({ status: status || undefined, date: date || undefined }, signal),
    [status, date],
  )
  const { data, error, loading, reload, setData } = useAsync(load, `reservations:${status}:${date}`)

  const onUpdated = (updated: AdminReservation) =>
    setData((list) =>
      list
        .map((r) => (r.id === updated.id ? updated : r))
        .filter((r) => !status || r.status === status),
    )

  return (
    <div aria-live="polite" aria-busy={loading}>
      {error && <ErrorState message={error} onRetry={reload} />}
      {!data && loading && <Spinner />}
      {data && !error &&
        (data.length === 0 ? (
          <EmptyState>Aucune réservation pour ces filtres.</EmptyState>
        ) : (
          <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.map((reservation) => (
              <li key={reservation.id}><ReservationCard reservation={reservation} onUpdated={onUpdated} /></li>
            ))}
          </ul>
        ))}
    </div>
  )
}
