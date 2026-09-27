import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 py-10 text-muted">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" /> {label}
    </p>
  )
}
