import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Phone, Users } from 'lucide-react'
import type { AdminReservation } from '@shared/api/types'
import { formatDate } from '@shared/lib/format'
import { ReservationActions } from './ReservationActions'
import { StatusBadge } from './ui/StatusBadge'

export function ReservationCard({ reservation, onUpdated }: { reservation: AdminReservation; onUpdated: (r: AdminReservation) => void }) {
  return (
    <article className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold">
            <Link to={`/reservations/${reservation.id}`} className="hover:text-primary hover:underline">{reservation.customerName}</Link>
          </h3>
          <StatusBadge status={reservation.status} />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
          <li className="flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" /><span className="first-letter:uppercase">{formatDate(reservation.date)}</span></li>
          <li className="flex items-center gap-1.5 tabular-nums"><Clock className="size-4" aria-hidden="true" />{reservation.time}</li>
          <li className="flex items-center gap-1.5"><Users className="size-4" aria-hidden="true" />{reservation.numberOfPeople} pers.</li>
          <li>
            <a href={`tel:${reservation.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary">
              <Phone className="size-4" aria-hidden="true" />{reservation.phone}
            </a>
          </li>
        </ul>
      </div>
      <ReservationActions reservation={reservation} onUpdated={onUpdated} />
    </article>
  )
}
