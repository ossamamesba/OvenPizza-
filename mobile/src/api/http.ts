import { API_URL } from '../config/env'
import { sessionStorage } from '../storage/secureSessionStorage'
import { createSessionHttpClient } from './sessionHttpClient'

let sessionExpiredListener = () => {}

/** Branché par AuthProvider : session expirée → retour à l'écran de connexion. */
export function onSessionExpired(listener: () => void) {
  sessionExpiredListener = listener
}

/** Instance unique utilisée par tous les modules d'API (composition faite ici, une seule fois). */
export const http = createSessionHttpClient({
  baseUrl: API_URL,
  storage: sessionStorage,
  onSessionExpired: () => sessionExpiredListener(),
})

export { ApiError } from '@shared/api/client'
