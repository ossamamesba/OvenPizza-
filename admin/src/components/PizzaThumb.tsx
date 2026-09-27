import { pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../lib/api'

export function PizzaThumb({ image, className = 'size-16' }: { image: string | null; className?: string }) {
  const url = pizzaImageUrl(image, API_URL)
  return url ? (
    <img src={url} alt="" loading="lazy" className={`${className} shrink-0 rounded-xl object-cover`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-xl bg-accent-soft`} aria-hidden="true">
      <img src="/favicon.svg" alt="" className="size-1/2 opacity-80" />
    </span>
  )
}
