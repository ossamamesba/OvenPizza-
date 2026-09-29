/**
 * Types des données renvoyées par l'API Symfony — partagés par le site client, le dashboard et l'app mobile.
 * À garder alignés avec les groupes de sérialisation du backend (pizza:read, pack:read, reservation:read…).
 */

export interface Pizza {
  id: number
  name: string
  description: string | null
  /** Nom du fichier image (servi depuis /uploads/pizzas/), ou null. */
  image: string | null
  isAvailable: boolean
  /** Pack auquel appartient la pizza (le prix est celui du pack). */
  packId: number | null
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
  isAvailable: boolean
  packId: number | null
}

/** Formule du traiteur : un prix (par pizza) et des pizzas au choix. */
export interface Pack {
  id: number
  name: string
  description: string | null
  /** Prix en DH par pizza, toujours en texte pour rester exact (ex. "100.00"). */
  price: string
  /** Nombre maximum de variétés de pizzas que le client peut choisir. */
  maxVarieties: number
  isActive: boolean
  position: number
}

/** Pack affiché sur le site client (GET /api/packs), avec ses pizzas disponibles. */
export interface PublicPack extends Pack {
  pizzas: Pizza[]
}

/** Pack vu par le patron. */
export interface AdminPack extends Pack {
  pizzaCount: number
}

export type PackInput = Omit<Pack, 'id' | 'price'> & { price: string | number }

export type ReservationStatus = 'pending' | 'accepted' | 'refused'
export type GuestRange = '1-10' | '10-20' | '20-50' | '50-100' | '100+'
export type ServiceCity = 'casablanca' | 'rabat'

export interface ReservationItemInput {
  pizzaId: number
  quantity: number
}

/** Demande envoyée par le site client (POST /api/reservations). */
export interface ReservationInput {
  customerName: string
  phone: string
  /** AAAA-MM-JJ */
  date: string
  /** HH:MM */
  time: string
  city: ServiceCity
  address: string
  /** Une tranche OU un nombre exact (l'autre à null). */
  guestRange: GuestRange | null
  numberOfPeople: number | null
  notes: string | null
  packId: number
  items: ReservationItemInput[]
}

export interface ReservationItem {
  pizzaId: number | null
  pizzaName: string
  quantity: number
}

export interface Reservation {
  id: number
  customerName: string
  phone: string
  date: string
  time: string
  city: ServiceCity | null
  address: string | null
  guestRange: GuestRange | null
  numberOfPeople: number | null
  notes: string | null
  /** Nom et prix du pack au moment de la demande. */
  packName: string | null
  packPrice: string | null
  items: ReservationItem[]
  totalPizzas: number
  /** Nombre de pizzas × prix du pack (estimation). */
  estimatedTotal: string | null
  status: ReservationStatus
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
