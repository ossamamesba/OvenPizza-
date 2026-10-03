import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { ApiError } from '../api/http'

/** Dernières données reçues par écran : affichées immédiatement au retour, puis rafraîchies. */
const cache = new Map<string, unknown>()

export function clearQueryCache() {
  cache.clear()
}

interface QueryState<T> {
  /** Clé à laquelle ces données correspondent. */
  key: string
  data?: T
  error?: string
  /** Premier chargement, rien à afficher encore. */
  loading: boolean
  /** Rafraîchissement demandé par le patron (tirer vers le bas). */
  refreshing: boolean
}

/**
 * Charge les données d'un écran (principe S : uniquement le cycle chargement / cache / erreur).
 * Recharge à chaque fois que l'écran redevient visible, sans écran de chargement si des données existent.
 */
export function useQuery<T>(key: string, load: () => Promise<T>) {
  const [stored, setState] = useState<QueryState<T>>(() => initialState<T>(key))
  // Nouvelle clé (ex. autre filtre) : on part du cache de cette clé, sans effet supplémentaire.
  const state = stored.key === key ? stored : initialState<T>(key)
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })
  const requestId = useRef(0)

  const fetchData = useCallback(
    async (mode: 'background' | 'pull') => {
      const id = ++requestId.current
      if (mode === 'pull') setState((s) => ({ ...(s.key === key ? s : initialState<T>(key)), refreshing: true }))
      try {
        const data = await loadRef.current()
        if (id !== requestId.current) return
        cache.set(key, data)
        setState({ key, data, loading: false, refreshing: false })
      } catch (error) {
        if (id !== requestId.current) return
        const message = error instanceof ApiError ? error.message : 'Erreur de chargement.'
        setState((s) => ({ ...(s.key === key ? s : initialState<T>(key)), error: message, loading: false, refreshing: false }))
      }
    },
    [key],
  )

  useFocusEffect(
    useCallback(() => {
      void fetchData('background')
    }, [fetchData]),
  )

  const setData = useCallback(
    (update: (data: T) => T) => {
      setState((s) => {
        if (s.key !== key || s.data === undefined) return s
        const data = update(s.data)
        cache.set(key, data)
        return { ...s, data }
      })
    },
    [key],
  )

  return { data: state.data, error: state.error, loading: state.loading, refreshing: state.refreshing, refresh: () => fetchData('pull'), setData }
}

function initialState<T>(key: string): QueryState<T> {
  const cached = cache.get(key) as T | undefined
  return { key, data: cached, loading: cached === undefined, refreshing: false }
}
