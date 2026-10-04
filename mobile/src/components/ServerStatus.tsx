import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { pingServer } from '../api/health'
import { API_URL } from '../config/env'
import { colors, fonts, radius, space } from '../theme'
import { AppText } from './AppText'

type Status = 'checking' | 'ok' | 'unreachable'

/**
 * Indique si le téléphone joint le serveur, et à quelle adresse.
 * Aide au premier lancement avec Expo Go (mauvaise IP, pare-feu, Docker arrêté…).
 */
export function ServerStatus() {
  const [status, setStatus] = useState<Status>('checking')

  const check = useCallback(() => {
    setStatus('checking')
    void pingServer().then((ok) => setStatus(ok ? 'ok' : 'unreachable'))
  }, [])

  useEffect(() => {
    let cancelled = false
    void pingServer().then((ok) => {
      if (!cancelled) setStatus(ok ? 'ok' : 'unreachable')
    })
    return () => {
      cancelled = true
    }
  }, [])

  const view = {
    checking: { icon: 'sync-outline', color: colors.muted, text: 'Connexion au serveur…' },
    ok: { icon: 'checkmark-circle', color: colors.success, text: 'Serveur joignable' },
    unreachable: { icon: 'alert-circle', color: colors.danger, text: 'Serveur injoignable' },
  }[status] as { icon: keyof typeof Ionicons.glyphMap; color: string; text: string }

  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Ionicons name={view.icon} size={18} color={view.color} />
        <AppText style={[styles.title, { color: view.color }]}>{view.text}</AppText>
      </View>
      <AppText variant="small" selectable>{API_URL}</AppText>
      {status === 'unreachable' && (
        <>
          <AppText variant="small">
            Vérifiez : Docker lancé sur le PC, téléphone sur le même Wi-Fi, bonne adresse IP dans mobile/.env.local,
            port 8090 autorisé dans le pare-feu Windows.
          </AppText>
          <Pressable onPress={check} accessibilityRole="button" style={({ pressed }) => [styles.retry, pressed && { opacity: 0.7 }]}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <AppText style={styles.retryText}>Réessayer</AppText>
          </Pressable>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.background, borderRadius: radius.md, padding: space.md, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.bodyBold, fontSize: 14 },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  retryText: { color: colors.primary, fontFamily: fonts.bodyBold },
})
