import type { LoginResponse, User } from '@shared/api/types'
import { http } from './http'

export const login = (email: string, password: string) =>
  http.anonymous<LoginResponse>('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const getMe = () => http.request<User>('/api/admin/me')
