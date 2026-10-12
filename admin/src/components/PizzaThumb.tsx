import { pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../lib/api'

/** Photo d'une pizza : vignette légère par défaut, « full » pour un grand aperçu. */
export function PizzaThumb({ image, className = 'size-16', size = 'thumb' }: { image: string | null; className?: string; size?: 'thumb' | 'full' }) {
  const url = pizzaImageUrl(image, API_URL, size)
  return url ? (
    <img src={url} alt="" loading="lazy" className={`${className} shrink-0 rounded-xl object-cover`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-xl bg-accent-soft`} aria-hidden="true">
      <img src="/logo.webp" alt="" className="size-3/4 rounded-full opacity-80" />
    </span>
  )
}
