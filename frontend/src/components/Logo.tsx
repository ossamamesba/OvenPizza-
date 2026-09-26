/** Logo : une pizza stylisée (SVG, sans image externe). */
export function PizzaMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#E8A33D" />
      <circle cx="32" cy="32" r="25" fill="#C62828" />
      <circle cx="32" cy="32" r="22" fill="#F6D27A" />
      <circle cx="24" cy="24" r="4.5" fill="#C62828" />
      <circle cx="40" cy="22" r="4" fill="#C62828" />
      <circle cx="38" cy="40" r="4.5" fill="#C62828" />
      <circle cx="23" cy="39" r="3.5" fill="#C62828" />
      <path d="M31 30c2-3 5-3 6-1-2 1-4 2-6 1z" fill="#2F7A3A" />
      <path d="M27 46c2-2 4-2 5 0-2 1-3 1-5 0z" fill="#2F7A3A" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <PizzaMark />
      <span className="font-display text-lg font-bold leading-tight sm:text-xl">
        Oven&rsquo;s <span className="text-primary">Pizza Party</span>
      </span>
    </span>
  )
}
