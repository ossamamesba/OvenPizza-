import { createContext } from 'react'

/** Sélection du client : un pack et une quantité par pizza. */
export interface OrderState {
  packId: number | null
  /** pizzaId → quantité (> 0) */
  quantities: Record<number, number>
}

export interface OrderContextValue extends OrderState {
  selectPack: (packId: number) => void
  setQuantity: (pizzaId: number, quantity: number) => void
  clear: () => void
}

export const OrderContext = createContext<OrderContextValue | null>(null)
