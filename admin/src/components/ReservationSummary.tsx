import { MapPin, Pizza, Users } from 'lucide-react'
import type { Reservation } from '@shared/api/types'
import { formatPrice } from '@shared/lib/format'
import { cityLabel, guestsLabel, itemsLabel } from '@shared/lib/labels'

/** Ce que le patron doit préparer : pack, pizzas et quantités, invités, lieu, estimation. */
export function ReservationSummary({ reservation }: { reservation: Reservation }) {
  return (
    <div className="space-y-1.5">
      {reservation.items.length > 0 && (
        <p className="flex items-start gap-1.5">
          <Pizza className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <strong>{reservation.packName}</strong> · {itemsLabel(reservation)}
            <span className="text-muted"> — {reservation.totalPizzas} pizzas{reservation.estimatedTotal && <>, ≈ {formatPrice(reservation.estimatedTotal)}</>}</span>
          </span>
        </p>
      )}
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
        <span className="flex items-center gap-1.5"><Users className="size-4" aria-hidden="true" />{guestsLabel(reservation)}</span>
        {reservation.city && (
          <span className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{cityLabel(reservation.city)}</span>
        )}
      </p>
    </div>
  )
}
