import { createApiClient } from '@shared/api/client'

export { ApiError } from '@shared/api/client'

/** Vide en développement (proxy Vite) et quand le site et l'API partagent le même domaine. */
export const API_URL = import.meta.env.VITE_API_URL ?? ''

/** Le site client n'appelle que des routes publiques : pas de jeton. */
export const apiFetch = createApiClient({ baseUrl: API_URL })
