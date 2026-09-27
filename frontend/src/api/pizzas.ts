import type { Pizza } from '@shared/api/types'
import { apiFetch } from './client'

export const getPizzas = (signal?: AbortSignal) => apiFetch<Pizza[]>('/api/pizzas', { signal })
