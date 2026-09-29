import { useCallback, useEffect, useState } from 'react'
import type { PublicPack } from '@shared/api/types'
import { ApiError } from '../api/client'
import { getPacks } from '../api/packs'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; packs: PublicPack[] }

/** Charge les packs et leurs pizzas depuis l'API (les prix ne sont jamais écrits dans le frontend). */
export function usePacks() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getPacks(controller.signal)
      .then((packs) => setState({ status: 'success', packs }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', message: error instanceof ApiError ? error.message : 'Impossible de charger les packs.' })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
