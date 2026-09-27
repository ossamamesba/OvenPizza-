import { useCallback, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Phone } from 'lucide-react'
import { formatDate } from '@shared/lib/format'
import { getReservation } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { PageTitle } from '../components/PageTitle'
import { ReservationActions } from '../components/ReservationActions'
import { buttonClass } from '../components/ui/buttonClass'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'

const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function ReservationDetailPage() {
  const id = Number(useParams().id)
  const load = useCallback((signal: AbortSignal) => getReservation(id, signal), [id])
  const { data: reservation, error, loading, reload, setData } = useAsync(load)

  return (
    <>
      <Link to="/reservations" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Réservations
      </Link>

      {error && <ErrorState message={error} onRetry={reload} />}
      {!reservation && loading && <Spinner />}

      {reservation && (
        <>
          <PageTitle title={reservation.customerName} actions={<StatusBadge status={reservation.status} />} />
          <div className="rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Item label="Date"><span className="first-letter:uppercase">{formatDate(reservation.date)}</span></Item>
              <Item label="Heure"><span className="tabular-nums">{reservation.time}</span></Item>
              <Item label="Nombre de personnes">{reservation.numberOfPeople}</Item>
              <Item label="Téléphone">{reservation.phone}</Item>
              <Item label="Demande reçue le">{dateTime.format(new Date(reservation.createdAt))}</Item>
            </dl>
            <div className="mt-8 flex flex-wrap items-start gap-3 border-t border-border pt-6">
              <a href={`tel:${reservation.phone.replace(/\s/g, '')}`} className={buttonClass('secondary')}>
                <Phone className="size-4" aria-hidden="true" /> Appeler le client
              </a>
              <ReservationActions reservation={reservation} onUpdated={(updated) => setData(() => updated)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold">{children}</dd>
    </div>
  )
}
