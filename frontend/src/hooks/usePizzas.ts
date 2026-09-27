import { useCallback, useEffect, useState } from 'react'
import { getPizzas } from '../api/pizzas'
import { ApiError } from '../api/client'
import type { Pizza } from '@shared/api/types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pizzas: Pizza[] }

/** Charge le menu depuis l'API (les prix ne sont jamais écrits dans le frontend). */
export function usePizzas() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getPizzas(controller.signal)
      .then((pizzas) => setState({ status: 'success', pizzas }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Impossible de charger le menu.',
        })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
