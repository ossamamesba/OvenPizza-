import { useCallback, useEffect, useState } from 'react'
import type { PublicPack } from '@shared/api/types'
import { ApiError } from '../api/client'
import { getPacks } from '../api/packs'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; packs: PublicPack[] }

const CACHE_KEY = 'ovens-packs'

/** Derniers packs reçus : affichés immédiatement au retour sur le site, puis rafraîchis. */
const cache = {
  read(): PublicPack[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      return raw ? (JSON.parse(raw) as PublicPack[]) : null
    } catch {
      return null
    }
  },
  write(packs: PublicPack[]) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(packs))
    } catch {
      /* stockage indisponible : pas de cache, rien de grave */
    }
  },
}

/**
 * Charge les packs et leurs pizzas depuis l'API (les prix ne sont jamais écrits dans le frontend).
 * Stratégie « afficher le cache, puis rafraîchir » : pas d'écran de chargement quand on revient.
 */
export function usePacks() {
  const [state, setState] = useState<State>(() => {
    const cached = cache.read()
    return cached ? { status: 'success', packs: cached } : { status: 'loading' }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getPacks(controller.signal)
      .then((packs) => {
        cache.write(packs)
        setState({ status: 'success', packs })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof ApiError ? error.message : 'Impossible de charger les packs.'
        // Hors connexion avec des données déjà affichées : on les garde.
        setState((current) => (current.status === 'success' ? current : { status: 'error', message }))
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
