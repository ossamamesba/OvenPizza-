import type { GuestRange, Reservation, ServiceCity } from '../api/types'

export const GUEST_RANGES: { value: GuestRange; label: string }[] = [
  { value: '1-10', label: '1 à 10 invités' },
  { value: '10-20', label: '10 à 20 invités' },
  { value: '20-50', label: '20 à 50 invités' },
  { value: '50-100', label: '50 à 100 invités' },
  { value: '100+', label: 'Plus de 100 invités' },
]

export const CITIES: { value: ServiceCity; label: string }[] = [
  { value: 'casablanca', label: 'Casablanca' },
  { value: 'rabat', label: 'Rabat' },
]

export const cityLabel = (city: ServiceCity | null) => CITIES.find((c) => c.value === city)?.label ?? '—'

/** "35 invités" ou "20 à 50 invités" */
export function guestsLabel(reservation: Pick<Reservation, 'guestRange' | 'numberOfPeople'>): string {
  if (reservation.numberOfPeople) return `${reservation.numberOfPeople} invités`
  return GUEST_RANGES.find((r) => r.value === reservation.guestRange)?.label ?? '—'
}

/** "15 × Margherita · 10 × Pepperoni" */
export function itemsLabel(reservation: Pick<Reservation, 'items'>): string {
  return reservation.items.map((i) => `${i.quantity} × ${i.pizzaName}`).join(' · ')
}
