import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, login as loginRequest } from '../api/admin'
import { ApiError, setUnauthorizedHandler, tokenStorage } from '../lib/api'

import { AuthContext, type AuthState } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session connue : dashboard affiché tout de suite, jeton vérifié en arrière-plan (GET /api/admin/me).
  const [state, setState] = useState<AuthState>(() => {
    if (!tokenStorage.get()) return { status: 'anonymous' }
    const user = tokenStorage.getUser()
    return user ? { status: 'authenticated', user } : { status: 'checking' }
  })

  const logout = useCallback(() => {
    tokenStorage.clear()
    setState({ status: 'anonymous' })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (!tokenStorage.get()) return
    const controller = new AbortController()
    getMe(controller.signal)
      .then((user) => {
        tokenStorage.setUser(user)
        setState({ status: 'authenticated', user })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // Jeton refusé (401) : déjà déconnecté par onUnauthorized.
        if (error instanceof ApiError && error.status === 401) return
        // Réseau ou serveur indisponible : on garde la session connue ; sans elle, retour à la connexion.
        if (!tokenStorage.getUser()) logout()
      })
    return () => controller.abort()
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    tokenStorage.clear()
    const { token, user } = await loginRequest(email, password)
    tokenStorage.set(token)
    tokenStorage.setUser(user)
    setState({ status: 'authenticated', user })
  }, [])

  const value = useMemo(() => ({ state, login, logout }), [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
