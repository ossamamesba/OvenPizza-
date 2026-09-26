import type { ApiErrorBody } from '../types/api'

/** Vide en développement (proxy Vite) et quand le site et l'API partagent le même domaine. */
const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number
  readonly violations: Record<string, string[]>

  constructor(status: number, body: Partial<ApiErrorBody> = {}) {
    super(body.error ?? 'Une erreur est survenue.')
    this.status = status
    this.violations = body.violations ?? {}
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, { error: 'Connexion impossible. Vérifiez votre connexion internet.' })
  }

  if (response.status === 204) return undefined as T

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, (body ?? {}) as ApiErrorBody)

  return body as T
}
