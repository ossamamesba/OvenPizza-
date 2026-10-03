import type { AdminReservation, ReservationStatus } from '@shared/api/types'
import { http } from './http'

export interface ReservationFilters {
  status?: ReservationStatus
  /** AAAA-MM-JJ */
  date?: string
}

export function listReservations(filters: ReservationFilters = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
  return http.request<AdminReservation[]>(`/api/admin/reservations${query ? `?${query}` : ''}`)
}

export const getReservation = (id: number) => http.request<AdminReservation>(`/api/admin/reservations/${id}`)

export const updateReservationStatus = (id: number, status: ReservationStatus) =>
  http.request<AdminReservation>(`/api/admin/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
