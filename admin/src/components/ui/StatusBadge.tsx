import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ReservationStatus } from '@shared/api/types'

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  refused: 'Refusée',
}

const styles = {
  pending: { className: 'bg-accent-soft text-accent', Icon: Clock },
  accepted: { className: 'bg-success-soft text-success', Icon: CheckCircle2 },
  refused: { className: 'bg-danger/10 text-danger', Icon: XCircle },
} as const

/** Statut en texte + icône (jamais la couleur seule). */
export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { className, Icon } = styles[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${className}`}>
      <Icon className="size-4" aria-hidden="true" /> {STATUS_LABELS[status]}
    </span>
  )
}
