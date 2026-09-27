import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from './useAuth'

/** Protège les pages du dashboard : redirige vers /login si le patron n'est pas connecté. */
export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Vérification de la session…" />
      </div>
    )
  }
  if (state.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
