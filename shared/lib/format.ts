const priceFormatter = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** "52.00" → "52 DH", "58.50" → "58,5 DH" */
export function formatPrice(price: string): string {
  return `${priceFormatter.format(Number(price))} DH`
}

/** URL de la photo d'une pizza (baseUrl = URL de l'API, vide si même domaine). */
export function pizzaImageUrl(image: string | null, baseUrl = ''): string | null {
  return image ? `${baseUrl}/uploads/pizzas/${encodeURIComponent(image)}` : null
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
