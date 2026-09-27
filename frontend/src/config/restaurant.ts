/**
 * Informations du restaurant affichées sur le site.
 * ⚠️ Valeurs d'exemple : à remplacer par les vraies informations.
 * (Les prix et les pizzas, eux, viennent TOUJOURS de l'API.)
 */

export interface TimeRange {
  open: string // HH:MM
  close: string // HH:MM
}

export const restaurant = {
  name: "Oven's Pizza Party",
  tagline: 'Pizzas cuites au four, pâte maison et bonne humeur.',
  address: {
    street: '12 Rue de la Pizza',
    city: 'Casablanca',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Casablanca',
  },
  phone: '+212 5 22 00 00 00',
  email: 'contact@ovenspizza.ma',
  /** Index = jour de la semaine (0 = dimanche … 6 = samedi). Tableau vide = fermé. */
  openingHours: [
    [{ open: '12:00', close: '23:30' }], // dimanche
    [], // lundi : fermé
    [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
    [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
    [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
    [{ open: '12:00', close: '23:30' }], // vendredi
    [{ open: '12:00', close: '23:30' }], // samedi
  ] satisfies TimeRange[][],
  /** Laisser vide pour masquer un réseau. */
  social: {
    instagram: 'https://www.instagram.com/ovenspizzaparty/',
    facebook: '',
    whatsapp: '',
  },
  reservation: {
    maxPeople: 30,
    /** Intervalle entre deux créneaux proposés (minutes). */
    slotMinutes: 30,
    /** Dernière réservation possible avant la fermeture (minutes). */
    lastSlotBeforeClose: 60,
  },
} as const

export const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export function hoursLabel(ranges: readonly TimeRange[]): string {
  return ranges.length === 0 ? 'Fermé' : ranges.map((r) => `${r.open} – ${r.close}`).join(' · ')
}

/** Vrai si le restaurant est fermé toute la journée (AAAA-MM-JJ). */
export function isClosedOn(isoDate: string): boolean {
  const date = new Date(`${isoDate}T00:00:00`)
  return Number.isNaN(date.getTime()) || restaurant.openingHours[date.getDay()].length === 0
}

/** Créneaux de réservation pour une date (AAAA-MM-JJ), en excluant ceux déjà passés aujourd'hui. */
export function reservationSlots(isoDate: string, now = new Date()): string[] {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return []

  const { slotMinutes, lastSlotBeforeClose } = restaurant.reservation
  const isToday = date.toDateString() === now.toDateString()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return restaurant.openingHours[date.getDay()].flatMap((range) => {
    const slots: string[] = []
    for (let t = toMinutes(range.open); t <= toMinutes(range.close) - lastSlotBeforeClose; t += slotMinutes) {
      if (!isToday || t > nowMinutes) slots.push(toTime(t))
    }
    return slots
  })
}
