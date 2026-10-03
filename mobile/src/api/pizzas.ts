import { Platform } from 'react-native'
import type { AdminPizza, PizzaInput } from '@shared/api/types'
import { http } from './http'

export const listPizzas = () => http.request<AdminPizza[]>('/api/admin/pizzas')
export const getPizza = (id: number) => http.request<AdminPizza>(`/api/admin/pizzas/${id}`)
export const createPizza = (input: PizzaInput) =>
  http.request<AdminPizza>('/api/admin/pizzas', { method: 'POST', body: JSON.stringify(input) })
export const updatePizza = (id: number, input: Partial<PizzaInput>) =>
  http.request<AdminPizza>(`/api/admin/pizzas/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
export const deletePizza = (id: number) => http.request<void>(`/api/admin/pizzas/${id}`, { method: 'DELETE' })
export const deletePizzaImage = (id: number) => http.request<AdminPizza>(`/api/admin/pizzas/${id}/image`, { method: 'DELETE' })

/** Photo choisie dans la galerie du téléphone. */
export interface PickedImage {
  uri: string
  mimeType: string
  fileName: string
}

export async function uploadPizzaImage(id: number, image: PickedImage) {
  const body = new FormData()
  if (Platform.OS === 'web') {
    // Navigateur : la photo doit être envoyée comme un vrai fichier (Blob).
    body.append('image', await (await fetch(image.uri)).blob(), image.fileName)
  } else {
    // Android / iOS : React Native lit le fichier directement depuis son adresse locale.
    body.append('image', { uri: image.uri, name: image.fileName, type: image.mimeType } as unknown as Blob)
  }
  return http.request<AdminPizza>(`/api/admin/pizzas/${id}/image`, { method: 'POST', body })
}
