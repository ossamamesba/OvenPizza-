import { RotateCw } from 'lucide-react'

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card bg-surface p-8 text-center ring-1 ring-border">
      <p className="mb-4 font-semibold">{message}</p>
      <button type="button" onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-on-primary transition-colors hover:bg-primary-hover">
        <RotateCw className="size-4" aria-hidden="true" /> Réessayer
      </button>
    </div>
  )
}
