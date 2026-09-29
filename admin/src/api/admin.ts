import type {
  AdminPack,
  AdminPizza,
  AdminReservation,
  LoginResponse,
  PackInput,
  PizzaInput,
  ReservationStatus,
  User,
} from '@shared/api/types'
import { apiFetch } from '../lib/api'

const json = (body: unknown) => JSON.stringify(body)

// Authentification
export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/login', { method: 'POST', body: json({ email, password }) })
export const getMe = (signal?: AbortSignal) => apiFetch<User>('/api/admin/me', { signal })

// Réservations
export interface ReservationFilters {
  status?: ReservationStatus
  date?: string
}
export function listReservations(filters: ReservationFilters = {}, signal?: AbortSignal) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])
  return apiFetch<AdminReservation[]>(`/api/admin/reservations${query.size ? `?${query}` : ''}`, { signal })
}
export const getReservation = (id: number, signal?: AbortSignal) =>
  apiFetch<AdminReservation>(`/api/admin/reservations/${id}`, { signal })
export const updateReservationStatus = (id: number, status: ReservationStatus) =>
  apiFetch<AdminReservation>(`/api/admin/reservations/${id}/status`, { method: 'PATCH', body: json({ status }) })

// Packs
export const listPacks = (signal?: AbortSignal) => apiFetch<AdminPack[]>('/api/admin/packs', { signal })
export const getPack = (id: number, signal?: AbortSignal) => apiFetch<AdminPack>(`/api/admin/packs/${id}`, { signal })
export const createPack = (input: PackInput) => apiFetch<AdminPack>('/api/admin/packs', { method: 'POST', body: json(input) })
export const updatePack = (id: number, input: Partial<PackInput>) =>
  apiFetch<AdminPack>(`/api/admin/packs/${id}`, { method: 'PATCH', body: json(input) })
export const deletePack = (id: number) => apiFetch<void>(`/api/admin/packs/${id}`, { method: 'DELETE' })

// Pizzas
export const listPizzas = (signal?: AbortSignal) => apiFetch<AdminPizza[]>('/api/admin/pizzas', { signal })
export const getPizza = (id: number, signal?: AbortSignal) => apiFetch<AdminPizza>(`/api/admin/pizzas/${id}`, { signal })
export const createPizza = (input: PizzaInput) =>
  apiFetch<AdminPizza>('/api/admin/pizzas', { method: 'POST', body: json(input) })
export const updatePizza = (id: number, input: Partial<PizzaInput>) =>
  apiFetch<AdminPizza>(`/api/admin/pizzas/${id}`, { method: 'PATCH', body: json(input) })
export const deletePizza = (id: number) => apiFetch<void>(`/api/admin/pizzas/${id}`, { method: 'DELETE' })
export function uploadPizzaImage(id: number, file: File) {
  const body = new FormData()
  body.append('image', file)
  return apiFetch<AdminPizza>(`/api/admin/pizzas/${id}/image`, { method: 'POST', body })
}
export const deletePizzaImage = (id: number) =>
  apiFetch<AdminPizza>(`/api/admin/pizzas/${id}/image`, { method: 'DELETE' })
