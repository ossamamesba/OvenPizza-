import type { Reservation, ReservationInput } from '../types/api'
import { apiFetch } from './client'

export const createReservation = (input: ReservationInput) =>
  apiFetch<Reservation>('/api/reservations', { method: 'POST', body: JSON.stringify(input) })
