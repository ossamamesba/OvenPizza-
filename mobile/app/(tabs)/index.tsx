import { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { AdminReservation } from '@shared/api/types'
import { formatDate, toIsoDate } from '@shared/lib/format'
import { listPizzas } from '../../src/api/pizzas'
import { listReservations } from '../../src/api/reservations'
import { AppText } from '../../src/components/AppText'
import { ReservationCard } from '../../src/components/ReservationCard'
import { Screen } from '../../src/components/Screen'
import { EmptyView, ErrorView, LoadingView } from '../../src/components/StateViews'
import { useQuery } from '../../src/hooks/useQuery'
import { capitalize } from '../../src/lib/text'
import { colors, fonts, radius, shadow, space } from '../../src/theme'

export default function DashboardScreen() {
  const today = toIsoDate(new Date())
  const load = useCallback(async () => {
    const [pending, todays, pizzas] = await Promise.all([
      listReservations({ status: 'pending' }),
      listReservations({ date: today }),
      listPizzas(),
    ])
    return { pending, todays, pizzas }
  }, [today])
  const { data, error, loading, refreshing, refresh, setData } = useQuery(`dashboard:${today}`, load)

  const onUpdated = (updated: AdminReservation) =>
    setData((d) => ({
      ...d,
      pending: d.pending.filter((r) => r.id !== updated.id || updated.status === 'pending'),
      todays: d.todays.map((r) => (r.id === updated.id ? updated : r)),
    }))

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="muted">{capitalize(formatDate(today))}</AppText>
      {loading && <LoadingView />}
      {error && !data && <ErrorView message={error} onRetry={refresh} />}
      {data && (
        <>
          <View style={styles.stats}>
            <Stat
              icon="time-outline"
              value={data.pending.length}
              label="En attente"
              highlight={data.pending.length > 0}
              onPress={() => router.navigate('/reservations')}
            />
            <Stat
              icon="calendar-outline"
              value={data.todays.filter((r) => r.status !== 'refused').length}
              label="Aujourd'hui"
              detail={`${data.todays.filter((r) => r.status === 'accepted').reduce((s, r) => s + r.totalPizzas, 0)} pizzas à préparer`}
            />
          </View>
          <Stat
            icon="pizza-outline"
            value={data.pizzas.filter((p) => p.isAvailable).length}
            label="Pizzas disponibles"
            detail={`sur ${data.pizzas.length}`}
            onPress={() => router.navigate('/pizzas')}
          />

          <AppText variant="heading" style={styles.section} accessibilityRole="header">À traiter</AppText>
          {data.pending.length === 0 ? (
            <EmptyView message="Aucune demande en attente. Tout est à jour !" />
          ) : (
            data.pending.map((r) => <ReservationCard key={r.id} reservation={r} onUpdated={onUpdated} />)
          )}
        </>
      )}
    </Screen>
  )
}

interface StatProps {
  icon: keyof typeof Ionicons.glyphMap
  value: number
  label: string
  detail?: string
  highlight?: boolean
  onPress?: () => void
}

function Stat({ icon, value, label, detail, highlight = false, onPress }: StatProps) {
  const fg = highlight ? '#ffffff' : colors.foreground
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={`${value} ${label}${detail ? `, ${detail}` : ''}`}
      style={({ pressed }) => [styles.stat, highlight && styles.statHighlight, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={22} color={highlight ? '#ffffff' : colors.primary} />
      <AppText style={[styles.statValue, { color: fg }]}>{value}</AppText>
      <AppText variant="label" style={{ color: fg }}>{label}</AppText>
      {detail && <AppText variant="small" style={highlight ? { color: '#ffffffd9' } : undefined}>{detail}</AppText>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: 2, ...shadow },
  statHighlight: { backgroundColor: colors.primary, borderColor: colors.primary },
  statValue: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, marginTop: 6 },
  section: { marginTop: space.lg },
})
