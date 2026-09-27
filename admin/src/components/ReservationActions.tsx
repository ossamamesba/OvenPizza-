import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { AdminReservation, ReservationStatus } from '@shared/api/types'
import { updateReservationStatus } from '../api/admin'
import { ApiError } from '../lib/api'
import { Button } from './ui/Button'

interface Props {
  reservation: AdminReservation
  onUpdated: (reservation: AdminReservation) => void
}

/** Boutons Accepter / Refuser (on peut aussi changer d'avis après coup). */
export function ReservationActions({ reservation, onUpdated }: Props) {
  const [busy, setBusy] = useState<ReservationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function change(status: ReservationStatus) {
    setBusy(status)
    setError(null)
    try {
      onUpdated(await updateReservationStatus(reservation.id, status))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {reservation.status !== 'accepted' && (
          <Button variant="success" size="sm" loading={busy === 'accepted'} disabled={busy !== null} onClick={() => change('accepted')}>
            <Check className="size-4" aria-hidden="true" /> Accepter
          </Button>
        )}
        {reservation.status !== 'refused' && (
          <Button variant="danger" size="sm" loading={busy === 'refused'} disabled={busy !== null} onClick={() => change('refused')}>
            <X className="size-4" aria-hidden="true" /> Refuser
          </Button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{error}</p>}
    </div>
  )
}
