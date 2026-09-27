import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, login as loginRequest } from '../api/admin'
import { setUnauthorizedHandler, tokenStorage } from '../lib/api'

import { AuthContext, type AuthState } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Avec un jeton enregistré, on vérifie d'abord qu'il est encore valide (GET /api/admin/me).
  const [state, setState] = useState<AuthState>(() => (tokenStorage.get() ? { status: 'checking' } : { status: 'anonymous' }))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setState({ status: 'anonymous' })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (!tokenStorage.get()) return
    const controller = new AbortController()
    getMe(controller.signal)
      .then((user) => setState({ status: 'authenticated', user }))
      .catch(() => {
        if (!controller.signal.aborted) logout()
      })
    return () => controller.abort()
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    tokenStorage.clear()
    const { token, user } = await loginRequest(email, password)
    tokenStorage.set(token)
    setState({ status: 'authenticated', user })
  }, [])

  const value = useMemo(() => ({ state, login, logout }), [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
