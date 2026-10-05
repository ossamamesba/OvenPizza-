import { Platform } from 'react-native'
import { isRunningInExpoGo } from 'expo'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { registerPushToken, unregisterPushToken } from '../api/pushTokens'
import { colors } from '../theme'

/** Même nom que ExpoPushNotifier::ANDROID_CHANNEL côté serveur. */
const ANDROID_CHANNEL = 'reservations'

/** Jeton de ce téléphone, gardé pour le retirer du serveur à la déconnexion. */
let currentToken: string | null = null

// Notification reçue pendant que l'app est ouverte : l'afficher quand même (bannière + son).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * Demande l'autorisation puis renvoie le jeton Expo de ce téléphone, ou null si les notifications
 * sont impossibles : web, émulateur, Expo Go (plus de push Android depuis le SDK 53), refus du patron,
 * ou projet pas encore relié à EAS (`eas init`).
 */
async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice || isRunningInExpoGo()) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Nouvelles réservations',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.primary,
    })
  }

  let { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync())
  if (status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  if (!projectId) {
    console.warn('Notifications désactivées : lancez « npx eas-cli init » pour relier le projet à EAS.')
    return null
  }
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data
}

/** À chaque ouverture connectée : (ré)enregistre ce téléphone. Sans effet si impossible, jamais d'erreur. */
export async function registerDevice() {
  try {
    const token = await getPushToken()
    if (!token) return
    await registerPushToken(token)
    currentToken = token
  } catch (error) {
    console.warn('Enregistrement des notifications impossible', error)
  }
}

/** Déconnexion volontaire : ce téléphone ne reçoit plus les réservations. N'attend pas plus de 3 s. */
export async function unregisterDevice() {
  const token = currentToken
  currentToken = null
  if (!token) return
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000))
  await Promise.race([unregisterPushToken(token).catch(() => {}), timeout])
}
