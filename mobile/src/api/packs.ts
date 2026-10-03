import type { AdminPack, PackInput } from '@shared/api/types'
import { http } from './http'

export const listPacks = () => http.request<AdminPack[]>('/api/admin/packs')
export const getPack = (id: number) => http.request<AdminPack>(`/api/admin/packs/${id}`)
export const updatePack = (id: number, input: Partial<PackInput>) =>
  http.request<AdminPack>(`/api/admin/packs/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
