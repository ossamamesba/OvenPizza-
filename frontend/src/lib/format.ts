const priceFormatter = new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** "52.00" → "52 DH", "58.50" → "58,5 DH" */
export function formatPrice(price: string): string {
  return `${priceFormatter.format(Number(price))} DH`
}

export function pizzaImageUrl(image: string | null): string | null {
  return image ? `${import.meta.env.VITE_API_URL ?? ''}/uploads/pizzas/${encodeURIComponent(image)}` : null
}

/** Date locale au format AAAA-MM-JJ (évite le décalage UTC de toISOString). */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
