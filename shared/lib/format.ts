const priceFormatter = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** "52.00" → "52 DH", "58.50" → "58,5 DH" */
export function formatPrice(price: string): string {
  return `${priceFormatter.format(Number(price))} DH`
}

/**
 * URL de la photo d'une pizza (baseUrl = URL de l'API, vide si même domaine).
 * 'thumb' : vignette légère (240 px) pour les petites images rondes ; les photos optimisées par le serveur
 * existent en deux versions, « abc.webp » et « abc-thumb.webp » (voir PizzaImageStorage côté Symfony).
 */
export function pizzaImageUrl(image: string | null, baseUrl = '', size: 'full' | 'thumb' = 'full'): string | null {
  if (!image) return null
  const file = size === 'thumb' && image.endsWith('.webp') ? image.replace(/\.webp$/, '-thumb.webp') : image
  return `${baseUrl}/uploads/pizzas/${encodeURIComponent(file)}`
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

/** "2026-09-29" → "mardi 29 septembre" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`))
}

/** Date locale au format AAAA-MM-JJ (évite le décalage UTC de toISOString). */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
