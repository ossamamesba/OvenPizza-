import type { PublicPack } from '@shared/api/types'
import { apiFetch } from './client'

export const getPacks = (signal?: AbortSignal) => apiFetch<PublicPack[]>('/api/packs', { signal })
