import { ApiError, createApiClient, type ApiFetch } from '@shared/api/client'
import type { LoginResponse } from '@shared/api/types'
import type { Session, SessionStorage } from '../storage/SessionStorage'

export interface SessionHttpClient {
  /** Requête authentifiée : jeton ajouté, renouvelé une fois automatiquement s'il a expiré. */
  request: ApiFetch
  /** Requête sans jeton (connexion). */
  anonymous: ApiFetch
  setSession(session: Session | null): void
}

interface Options {
  baseUrl: string
  storage: SessionStorage
  /** Appelé quand la session ne peut plus être renouvelée : l'app renvoie à l'écran de connexion. */
  onSessionExpired: () => void
}

/**
 * Client HTTP de l'app (principe S : il ne fait que gérer le jeton autour du client partagé).
 * Si l'API répond 401 (jeton expiré), il demande un nouveau jeton avec le refreshToken,
 * le sauvegarde, puis rejoue la requête une seule fois.
 */
export function createSessionHttpClient({ baseUrl, storage, onSessionExpired }: Options): SessionHttpClient {
  let session: Session | null = null
  // Plusieurs requêtes peuvent expirer en même temps : un seul renouvellement (le refreshToken est à usage unique).
  let refreshing: Promise<Session | null> | null = null

  const anonymous = createApiClient({ baseUrl })
  const authorized = createApiClient({ baseUrl, getToken: () => session?.token ?? null })

  function refresh(): Promise<Session | null> {
    if (!session) return Promise.resolve(null)
    refreshing ??= anonymous<LoginResponse>('/api/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
      .then(async ({ token, refreshToken, user }) => {
        session = { token, refreshToken, user }
        await storage.save(session)
        return session
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null
      })
    return refreshing
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    try {
      return await authorized<T>(path, init)
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401) || !session) throw error
      const renewed = await refresh()
      if (!renewed) {
        onSessionExpired()
        throw error
      }
      return authorized<T>(path, init)
    }
  }

  return {
    request,
    anonymous,
    setSession: (next) => {
      session = next
    },
  }
}
