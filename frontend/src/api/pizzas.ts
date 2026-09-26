import type { Pizza } from '../types/api'
import { apiFetch } from './client'

export const getPizzas = (signal?: AbortSignal) => apiFetch<Pizza[]>('/api/pizzas', { signal })
