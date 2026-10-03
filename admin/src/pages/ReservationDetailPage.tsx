import { useCallback, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Phone } from 'lucide-react'
import { formatDate, formatPrice } from '@shared/lib/format'
import { cityLabel, guestsLabel } from '@shared/lib/labels'
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
  const { data: reservation, error, loading, reload, setData } = useAsync(load, `reservation:${id}`)

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
              <Item label="Invités">{guestsLabel(reservation)}</Item>
              <Item label="Téléphone">{reservation.phone}</Item>
              <Item label="Ville">{cityLabel(reservation.city)}</Item>
              <Item label="Adresse">
                {reservation.address ? (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${reservation.address}, ${cityLabel(reservation.city)}`)}`}
                    target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                    {reservation.address} <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : '—'}
              </Item>
              <Item label="Demande reçue le">{dateTime.format(new Date(reservation.createdAt))}</Item>
            </dl>

            {reservation.items.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-xl font-bold">{reservation.packName} <span className="font-sans text-base font-semibold text-muted">· {reservation.packPrice && formatPrice(reservation.packPrice)} / pizza</span></h2>
                <table className="mt-3 w-full text-left">
                  <caption className="sr-only">Pizzas commandées</caption>
                  <thead className="text-sm text-muted">
                    <tr><th scope="col" className="py-2 font-semibold">Pizza</th><th scope="col" className="py-2 text-right font-semibold">Quantité</th></tr>
                  </thead>
                  <tbody>
                    {reservation.items.map((item) => (
                      <tr key={item.pizzaName} className="border-t border-border">
                        <td className="py-2.5 font-semibold">{item.pizzaName}</td>
                        <td className="py-2.5 text-right text-lg font-bold tabular-nums">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-foreground">
                      <th scope="row" className="py-2.5">Total : {reservation.totalPizzas} pizzas</th>
                      <td className="py-2.5 text-right font-display text-2xl font-bold tabular-nums">{reservation.estimatedTotal && `≈ ${formatPrice(reservation.estimatedTotal)}`}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {reservation.notes && (
              <div className="mt-6 rounded-xl bg-accent-soft p-4">
                <p className="text-sm font-semibold text-muted">Message du client</p>
                <p className="mt-1 whitespace-pre-line">{reservation.notes}</p>
              </div>
            )}

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
