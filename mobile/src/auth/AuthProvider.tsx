import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, login as loginRequest } from '../api/auth'
import { http, onSessionExpired } from '../api/http'
import { sessionStorage } from '../storage/secureSessionStorage'
import { clearQueryCache } from '../hooks/useQuery'
import { AuthContext, type AuthState } from './context'

/**
 * Session du patron : relue depuis le coffre du téléphone au démarrage (affichage immédiat),
 * puis vérifiée en arrière-plan. Le jeton se renouvelle tout seul (voir sessionHttpClient).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  const logout = useCallback(async () => {
    http.setSession(null)
    clearQueryCache()
    await sessionStorage.clear()
    setState({ status: 'anonymous' })
  }, [])

  useEffect(() => {
    onSessionExpired(() => void logout())
    let cancelled = false
    sessionStorage.load().then((session) => {
      if (cancelled) return
      if (!session) {
        setState({ status: 'anonymous' })
        return
      }
      http.setSession(session)
      setState({ status: 'authenticated', user: session.user })
      // Vérification silencieuse (renouvelle le jeton si besoin ; déconnecte si la session est finie).
      getMe().catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const { token, refreshToken, user } = await loginRequest(email, password)
    const session = { token, refreshToken, user }
    http.setSession(session)
    await sessionStorage.save(session)
    setState({ status: 'authenticated', user })
  }, [])

  const value = useMemo(() => ({ state, login, logout }), [state, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
