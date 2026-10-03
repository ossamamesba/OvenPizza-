import type { ApiErrorBody } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly violations: Record<string, string[]>

  constructor(status: number, body: Partial<ApiErrorBody> = {}) {
    super(body.error ?? 'Une erreur est survenue.')
    this.status = status
    this.violations = body.violations ?? {}
  }
}

export interface ApiClientOptions {
  /** URL de l'API. Vide = même domaine. */
  baseUrl?: string
  /** Jeton JWT à envoyer (dashboard et app mobile). */
  getToken?: () => string | null
  /** Appelé quand l'API refuse le jeton (expiré, invalide) : l'app déconnecte le patron. */
  onUnauthorized?: () => void
}

export type ApiFetch = <T>(path: string, init?: RequestInit) => Promise<T>

/** Client HTTP commun : même gestion des erreurs partout (site, dashboard, mobile). */
export function createApiClient({ baseUrl = '', getToken, onUnauthorized }: ApiClientOptions = {}): ApiFetch {
  return async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body !== undefined && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    const token = getToken?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, { ...init, headers })
    } catch (error) {
      // Requête annulée (changement d'écran) : on laisse passer. (Pas de DOMException en React Native.)
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw new ApiError(0, { error: 'Connexion impossible. Vérifiez votre connexion internet.' })
    }

    if (response.status === 204) return undefined as T

    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      if (response.status === 401 && token) onUnauthorized?.()
      throw new ApiError(response.status, (body ?? {}) as ApiErrorBody)
    }

    return body as T
  }
}
