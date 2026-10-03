import { pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../api/client'
import { LogoMark } from './Logo'

/** Photo d'une pizza (ou le logo si elle n'a pas encore de photo). */
export function PizzaImage({ image, name, className = 'aspect-[4/3] w-full' }: { image: string | null; name: string; className?: string }) {
  const url = pizzaImageUrl(image, API_URL)
  return url ? (
    <img src={url} alt={`Pizza ${name}`} loading="lazy" draggable={false} width={640} height={480} className={`${className} object-cover`} />
  ) : (
    <div className={`${className} grid place-items-center bg-accent-soft`}>
      <LogoMark className="size-1/2 max-h-28 max-w-28 opacity-90" />
    </div>
  )
}
