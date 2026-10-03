import type { ReactNode } from 'react'

/** Petit drapeau italien (vert, blanc, rouge), décoratif. */
export function Tricolor({ className = 'w-12' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-1.5 shrink-0 overflow-hidden rounded-full ring-1 ring-border ${className}`}>
      <span className="flex-1 bg-basil" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-primary" />
    </span>
  )
}

/** Sur-titre de section : drapeau italien + texte en vert basilic. */
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] ${light ? 'text-white' : 'text-basil'}`}>
      <Tricolor /> {children}
    </p>
  )
}
