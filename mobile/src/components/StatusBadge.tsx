import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ReservationStatus } from '@shared/api/types'
import { colors, fonts, radius } from '../theme'
import { AppText } from './AppText'

const config = {
  pending: { label: 'En attente', icon: 'time-outline', bg: colors.accentSoft, fg: colors.accent },
  accepted: { label: 'Acceptée', icon: 'checkmark-circle-outline', bg: colors.successSoft, fg: colors.success },
  refused: { label: 'Refusée', icon: 'close-circle-outline', bg: '#fde8e8', fg: colors.danger },
} as const

/** Statut en texte + icône (jamais la couleur seule). */
export function StatusBadge({ status }: { status: ReservationStatus }) {
  const c = config[status]
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.fg} />
      <AppText style={[styles.text, { color: c.fg }]}>{c.label}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.bodyBold, fontSize: 13 },
})
