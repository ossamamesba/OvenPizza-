import type { ReactNode } from 'react'

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <title>{`${title} — Dashboard Oven's Pizza`}</title>
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}
