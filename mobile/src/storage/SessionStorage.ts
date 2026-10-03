import type { User } from '@shared/api/types'

/** Session du patron gardée sur le téléphone. */
export interface Session {
  token: string
  refreshToken: string
  user: User
}

/**
 * Contrat de stockage de la session (principes I et D de SOLID) :
 * l'app dépend de cette interface, pas d'une technologie de stockage précise.
 */
export interface SessionStorage {
  load(): Promise<Session | null>
  save(session: Session): Promise<void>
  clear(): Promise<void>
}
