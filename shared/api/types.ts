/**
 * Types des données renvoyées par l'API Symfony — partagés par le site client, le dashboard et l'app mobile.
 * À garder alignés avec les groupes de sérialisation du backend (pizza:read, pizza:admin, reservation:read…).
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

/** Pizza vue par le patron (groupe pizza:admin). */
export interface AdminPizza extends Pizza {
  createdAt: string
  updatedAt: string
}

/** Données modifiables d'une pizza (la photo passe par un envoi de fichier séparé). */
export interface PizzaInput {
  name: string
  description: string | null
  price: string | number
  isAvailable: boolean
}

/** Réservation vue par le patron (groupe reservation:admin). */
export interface AdminReservation extends Reservation {
  createdAt: string
}

export interface User {
  id: number
  email: string
  roles: string[]
}

export interface LoginResponse {
  token: string
  user: User
}

/** Format commun des erreurs de l'API. */
export interface ApiErrorBody {
  error: string
  violations?: Record<string, string[]>
}
