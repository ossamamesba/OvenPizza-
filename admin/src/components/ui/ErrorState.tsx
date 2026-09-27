import type { ReactNode } from 'react'
import { RotateCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-card bg-surface p-8 text-center ring-1 ring-border">
      <p className="font-semibold">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" /> Réessayer
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-card bg-surface p-8 text-center text-muted ring-1 ring-border">{children}</div>
}
