import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { OrderContext, type OrderState } from './context'

const STORAGE_KEY = 'ovens-order'
const EMPTY: OrderState = { packId: null, quantities: {} }

function load(): OrderState {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as OrderState | null
    return saved && typeof saved === 'object' && 'quantities' in saved ? saved : EMPTY
  } catch {
    return EMPTY
  }
}

/** Garde la sélection du client entre la page « Nos packs » et la réservation (même après un rechargement). */
export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<OrderState>(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    } catch {
      /* navigation privée : la sélection reste en mémoire */
    }
  }, [order])

  // Changer de pack vide la sélection : les pizzas ne sont pas les mêmes.
  const selectPack = useCallback((packId: number) => {
    setOrder((o) => (o.packId === packId ? o : { packId, quantities: {} }))
  }, [])

  const setQuantity = useCallback((pizzaId: number, quantity: number) => {
    setOrder((o) => {
      const quantities = { ...o.quantities }
      if (quantity > 0) quantities[pizzaId] = Math.min(quantity, 500)
      else delete quantities[pizzaId]
      return { ...o, quantities }
    })
  }, [])

  const clear = useCallback(() => setOrder(EMPTY), [])

  const value = useMemo(() => ({ ...order, selectPack, setQuantity, clear }), [order, selectPack, setQuantity, clear])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
