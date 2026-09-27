/** Logo officiel du restaurant (cercle), en image légère. */
export function LogoMark({ className = 'size-11' }: { className?: string }) {
  return <img src="/logo.webp" alt="" width={256} height={256} className={`${className} shrink-0 rounded-full`} />
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-11 md:size-12" />
      <span className="font-display text-lg font-bold leading-tight sm:text-xl">
        Oven&rsquo;s <span className="text-primary">Pizza Party</span>
      </span>
    </span>
  )
}
