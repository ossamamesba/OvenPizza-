import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'

/**
 * Le patron touche la notification d'une nouvelle réservation → ouverture de son détail.
 * Fonctionne aussi quand l'app était fermée (dernière réponse relue au démarrage).
 * À utiliser dans un écran visible seulement connecté.
 */
export function useNotificationNavigation() {
  const router = useRouter()
  const response = Notifications.useLastNotificationResponse()

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return
    const { type, reservationId } = response.notification.request.content.data ?? {}
    // Traitée une seule fois (sinon rouverte à chaque retour sur l'app).
    Notifications.clearLastNotificationResponse()
    if (type === 'reservation' && reservationId) router.push(`/reservation/${reservationId}`)
  }, [response, router])
}
