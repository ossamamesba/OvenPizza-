import { useContext } from 'react'
import type { PublicPack } from '@shared/api/types'
import { OrderContext } from './context'

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrder doit être utilisé dans <OrderProvider>.')
  return context
}

/** Résumé de la sélection pour un pack donné (variétés, nombre de pizzas, total estimé). */
export function summarize(pack: PublicPack | undefined, quantities: Record<number, number>) {
  const items = pack ? pack.pizzas.filter((p) => quantities[p.id] > 0).map((p) => ({ pizza: p, quantity: quantities[p.id] })) : []
  const totalPizzas = items.reduce((sum, i) => sum + i.quantity, 0)
  return {
    items,
    varieties: items.length,
    totalPizzas,
    estimatedTotal: pack ? totalPizzas * Number(pack.price) : 0,
  }
}
