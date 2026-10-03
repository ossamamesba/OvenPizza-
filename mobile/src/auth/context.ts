import { createContext } from 'react'
import type { User } from '@shared/api/types'

export type AuthState = { status: 'loading' } | { status: 'anonymous' } | { status: 'authenticated'; user: User }

export interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
