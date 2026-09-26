/**
 * Types des données renvoyées par l'API Symfony.
 * À garder alignés avec les groupes de sérialisation du backend (pizza:read, reservation:read).
 */

export interface Pizza {
  id: number
  name: string
  description: string | null
  /** Prix en DH, toujours en texte pour rester exact (ex. "52.00"). */
  price: string
  /** Nom du fichier image (servi depuis /uploads/pizzas/), ou null. */
  image: string | null
  isAvailable: boolean
}

export type ReservationStatus = 'pending' | 'accepted' | 'refused'

/** Données envoyées par le formulaire de réservation. */
export interface ReservationInput {
  customerName: string
  phone: string
  /** AAAA-MM-JJ */
  date: string
  /** HH:MM */
  time: string
  numberOfPeople: number
}

export interface Reservation extends ReservationInput {
  id: number
  status: ReservationStatus
}

/** Format commun des erreurs de l'API. */
export interface ApiErrorBody {
  error: string
  violations?: Record<string, string[]>
}
