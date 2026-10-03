import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { Session, SessionStorage } from './SessionStorage'

const KEY = 'ovens-session'

function parse(raw: string | null): Session | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<Session>
    return value.token && value.refreshToken && value.user ? (value as Session) : null
  } catch {
    return null
  }
}

/** Téléphone : coffre chiffré du système (Android Keystore / iOS Keychain). */
const secureStoreStorage: SessionStorage = {
  load: async () => parse(await SecureStore.getItemAsync(KEY)),
  save: (session) => SecureStore.setItemAsync(KEY, JSON.stringify(session)),
  clear: () => SecureStore.deleteItemAsync(KEY),
}

/** Navigateur (aperçu web pendant le développement) : SecureStore n'existe pas, on utilise localStorage. */
const webStorage: SessionStorage = {
  load: async () => parse(globalThis.localStorage?.getItem(KEY) ?? null),
  save: async (session) => globalThis.localStorage?.setItem(KEY, JSON.stringify(session)),
  clear: async () => globalThis.localStorage?.removeItem(KEY),
}

/** Deux implémentations interchangeables du même contrat (principe L de SOLID). */
export const sessionStorage: SessionStorage = Platform.OS === 'web' ? webStorage : secureStoreStorage
