import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../lib/api'

type Loader<T> = (signal: AbortSignal) => Promise<T>

interface Result<T> {
  load: Loader<T>
  version: number
  data?: T
  error?: string
}

/** Dernières données reçues par écran (en mémoire, le temps de la visite). */
const cache = new Map<string, unknown>()

/**
 * Charge des données depuis l'API. `load` doit être stable (useCallback) : quand il change
 * (ex. nouveau filtre), les données sont rechargées en gardant l'ancien affichage pendant le chargement.
 * Avec `cacheKey`, un écran déjà visité s'affiche immédiatement, puis se rafraîchit.
 */
export function useAsync<T>(load: Loader<T>, cacheKey?: string) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (cacheKey) cache.set(cacheKey, data)
        setResult({ load, version, data })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setResult({ load, version, error: error instanceof ApiError ? error.message : 'Erreur de chargement.' })
      })
    return () => controller.abort()
  }, [load, version, cacheKey])

  const loading = !result || result.load !== load || result.version !== version
  const reload = useCallback(() => setVersion((v) => v + 1), [])
  /** Mise à jour locale après une action (accepter, supprimer…) sans recharger. */
  const setData = useCallback(
    (update: (data: T) => T) => {
      setResult((r) => {
        if (r?.data === undefined) return r
        const data = update(r.data)
        if (cacheKey) cache.set(cacheKey, data)
        return { ...r, data }
      })
    },
    [cacheKey],
  )

  const cached = cacheKey ? (cache.get(cacheKey) as T | undefined) : undefined
  const data = result?.load === load ? result.data : (cached ?? result?.data)
  return { data, error: loading ? undefined : result?.error, loading, reload, setData }
}
