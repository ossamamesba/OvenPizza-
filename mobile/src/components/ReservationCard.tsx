import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { AdminReservation } from '@shared/api/types'
import { formatDate, formatPrice } from '@shared/lib/format'
import { cityLabel, guestsLabel, itemsLabel } from '@shared/lib/labels'
import { capitalize } from '../lib/text'
import { colors, radius, shadow, space } from '../theme'
import { AppText } from './AppText'
import { ReservationActions } from './ReservationActions'
import { StatusBadge } from './StatusBadge'

interface Props {
  reservation: AdminReservation
  onUpdated: (reservation: AdminReservation) => void
}

/** Résumé d'une demande : qui, quand, où, quoi préparer. Toucher la carte ouvre le détail. */
export function ReservationCard({ reservation, onUpdated }: Props) {
  const r = reservation
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Réservation de ${r.customerName}, ${formatDate(r.date)} à ${r.time}`}
        accessibilityHint="Ouvre le détail"
        onPress={() => router.push(`/reservation/${r.id}`)}
        style={({ pressed }) => [styles.body, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.header}>
          <AppText variant="heading" style={styles.name} numberOfLines={1}>{r.customerName}</AppText>
          <StatusBadge status={r.status} />
        </View>
        <Line icon="calendar-outline" text={`${capitalize(formatDate(r.date))} · ${r.time}`} />
        <Line icon="location-outline" text={[cityLabel(r.city), r.address].filter(Boolean).join(' · ')} />
        <Line icon="people-outline" text={guestsLabel(r)} />
        {r.items.length > 0 && (
          <Line
            icon="pizza-outline"
            text={`${r.packName} · ${itemsLabel(r)} — ${r.totalPizzas} pizzas${r.estimatedTotal ? `, ≈ ${formatPrice(r.estimatedTotal)}` : ''}`}
            strong
          />
        )}
      </Pressable>
      <ReservationActions reservation={r} onUpdated={onUpdated} />
    </View>
  )
}

function Line({ icon, text, strong = false }: { icon: keyof typeof Ionicons.glyphMap; text: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={16} color={strong ? colors.primary : colors.muted} style={styles.icon} />
      <AppText variant={strong ? 'bodyStrong' : 'muted'} style={styles.lineText}>{text}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.md, ...shadow },
  body: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, marginBottom: 2 },
  name: { flexShrink: 1 },
  line: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  icon: { marginTop: 3 },
  lineText: { flex: 1 },
})
