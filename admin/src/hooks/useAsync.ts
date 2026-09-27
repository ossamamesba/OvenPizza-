import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../lib/api'

type Loader<T> = (signal: AbortSignal) => Promise<T>

interface Result<T> {
  load: Loader<T>
  version: number
  data?: T
  error?: string
}

/**
 * Charge des données depuis l'API. `load` doit être stable (useCallback) : quand il change
 * (ex. nouveau filtre), les données sont rechargées en gardant l'ancien affichage pendant le chargement.
 */
export function useAsync<T>(load: Loader<T>) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => setResult({ load, version, data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setResult({ load, version, error: error instanceof ApiError ? error.message : 'Erreur de chargement.' })
      })
    return () => controller.abort()
  }, [load, version])

  const loading = !result || result.load !== load || result.version !== version
  const reload = useCallback(() => setVersion((v) => v + 1), [])
  /** Mise à jour locale après une action (accepter, supprimer…) sans recharger. */
  const setData = useCallback((update: (data: T) => T) => {
    setResult((r) => (r?.data === undefined ? r : { ...r, data: update(r.data) }))
  }, [])

  return { data: result?.data, error: loading ? undefined : result?.error, loading, reload, setData }
}
