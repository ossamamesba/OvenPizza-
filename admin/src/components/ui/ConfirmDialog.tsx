import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Boîte de confirmation (élément <dialog> natif : focus, Échap et accessibilité gérés par le navigateur). */
export function ConfirmDialog({ open, title, message, confirmLabel, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-card bg-surface p-6 text-foreground shadow-card backdrop:bg-foreground/50"
    >
      <h2 id="confirm-title" className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button variant="primary" className="bg-danger hover:bg-danger/90" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </dialog>
  )
}
