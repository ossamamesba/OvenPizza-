import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Clock, Pizza } from 'lucide-react'
import type { AdminReservation } from '@shared/api/types'
import { formatDate, toIsoDate } from '@shared/lib/format'
import { listPizzas, listReservations } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { PageTitle } from '../components/PageTitle'
import { ReservationCard } from '../components/ReservationCard'
import { EmptyState, ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'

export function DashboardPage() {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [pending, today, pizzas] = await Promise.all([
        listReservations({ status: 'pending' }, signal),
        listReservations({ date: toIsoDate(new Date()) }, signal),
        listPizzas(signal),
      ])
      return { pending, today, pizzas }
    },
    [],
  )
  const { data, error, loading, reload, setData } = useAsync(load, 'dashboard')

  const replace = (updated: AdminReservation) =>
    setData((d) => ({
      ...d,
      pending: d.pending.filter((r) => r.id !== updated.id || updated.status === 'pending'),
      today: d.today.map((r) => (r.id === updated.id ? updated : r)),
    }))

  const today = formatDate(toIsoDate(new Date()))

  return (
    <>
      <PageTitle title="Tableau de bord" subtitle={today.charAt(0).toUpperCase() + today.slice(1)} />

      {error && <ErrorState message={error} onRetry={reload} />}
      {!data && loading && <Spinner />}

      {data && (
        <>
          <section aria-label="Chiffres du jour" className="grid gap-4 sm:grid-cols-3">
            <StatTile Icon={Clock} label="Demandes en attente" value={data.pending.length} to="/reservations?status=pending" highlight={data.pending.length > 0} />
            <StatTile
              Icon={CalendarCheck}
              label="Événements aujourd'hui"
              value={data.today.filter((r) => r.status !== 'refused').length}
              detail={`${data.today.filter((r) => r.status === 'accepted').reduce((sum, r) => sum + r.totalPizzas, 0)} pizzas confirmées à préparer`}
              to={`/reservations?date=${toIsoDate(new Date())}`}
            />
            <StatTile
              Icon={Pizza}
              label="Pizzas disponibles"
              value={data.pizzas.filter((p) => p.isAvailable).length}
              detail={`sur ${data.pizzas.length} au menu`}
              to="/menu"
            />
          </section>

          <section aria-labelledby="pending-title" className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="pending-title" className="text-2xl font-bold">À traiter</h2>
              <Link to="/reservations?status=pending" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline">
                Tout voir <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {data.pending.length === 0 ? (
              <EmptyState>Aucune demande en attente. Tout est à jour !</EmptyState>
            ) : (
              <ul className="space-y-3">
                {data.pending.slice(0, 5).map((reservation) => (
                  <li key={reservation.id}><ReservationCard reservation={reservation} onUpdated={replace} /></li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  )
}

interface StatTileProps {
  Icon: typeof Clock
  label: string
  value: number
  detail?: string
  to: string
  highlight?: boolean
}

function StatTile({ Icon, label, value, detail, to, highlight = false }: StatTileProps) {
  return (
    <Link
      to={to}
      className={`group rounded-card p-5 shadow-card ring-1 transition-colors ${highlight ? 'bg-primary text-on-primary ring-primary' : 'bg-surface ring-border hover:ring-primary/40'}`}
    >
      <Icon className={`size-6 ${highlight ? 'text-on-primary' : 'text-primary'}`} aria-hidden="true" />
      <p className="mt-3 font-display text-4xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 font-semibold">{label}</p>
      {detail && <p className={`text-sm ${highlight ? 'text-white/85' : 'text-muted'}`}>{detail}</p>}
    </Link>
  )
}
