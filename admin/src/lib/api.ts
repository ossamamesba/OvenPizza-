import { createApiClient } from '@shared/api/client'

export { ApiError } from '@shared/api/client'

export const API_URL = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'ovens-admin-token'

/** Jeton JWT du patron, gardé dans le navigateur (localStorage). */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* navigation privée : la session ne survivra pas au rechargement */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* rien à faire */
    }
  },
}

let onUnauthorized = () => {}
/** Branché par AuthProvider : un jeton refusé par l'API déconnecte le patron. */
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

export const apiFetch = createApiClient({
  baseUrl: API_URL,
  getToken: tokenStorage.get,
  onUnauthorized: () => onUnauthorized(),
})
