import { http } from './http'

/** Téléphones qui reçoivent les notifications de nouvelles réservations (voir PushTokenController). */
export const registerPushToken = (token: string) =>
  http.request<void>('/api/admin/push-tokens', { method: 'PUT', body: JSON.stringify({ token }) })

export const unregisterPushToken = (token: string) =>
  http.request<void>('/api/admin/push-tokens', { method: 'DELETE', body: JSON.stringify({ token }) })
