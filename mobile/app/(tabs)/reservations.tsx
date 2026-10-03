import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import type { AdminReservation, ReservationStatus } from '@shared/api/types'
import { toIsoDate } from '@shared/lib/format'
import { listReservations } from '../../src/api/reservations'
import { Chip } from '../../src/components/Chip'
import { ReservationCard } from '../../src/components/ReservationCard'
import { Screen } from '../../src/components/Screen'
import { EmptyView, ErrorView, LoadingView } from '../../src/components/StateViews'
import { useQuery } from '../../src/hooks/useQuery'
import { space } from '../../src/theme'

const STATUSES: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'refused', label: 'Refusées' },
  { value: 'all', label: 'Toutes' },
]

export default function ReservationsScreen() {
  const [status, setStatus] = useState<ReservationStatus | 'all'>('pending')
  const [todayOnly, setTodayOnly] = useState(false)
  const date = todayOnly ? toIsoDate(new Date()) : undefined

  const load = useCallback(() => listReservations({ status: status === 'all' ? undefined : status, date }), [status, date])
  const { data, error, loading, refreshing, refresh, setData } = useQuery(`reservations:${status}:${date ?? 'all'}`, load)

  const onUpdated = (updated: AdminReservation) =>
    setData((list) => list.map((r) => (r.id === updated.id ? updated : r)).filter((r) => status === 'all' || r.status === status))

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityRole="tablist">
        {STATUSES.map((s) => (
          <Chip key={s.value} label={s.label} selected={status === s.value} onPress={() => setStatus(s.value)} />
        ))}
      </ScrollView>
      <View style={styles.chips}>
        <Chip label="Toutes les dates" selected={!todayOnly} onPress={() => setTodayOnly(false)} />
        <Chip label="Aujourd'hui" selected={todayOnly} onPress={() => setTodayOnly(true)} />
      </View>

      {loading && <LoadingView />}
      {error && !data && <ErrorView message={error} onRetry={refresh} />}
      {data && data.length === 0 && <EmptyView message="Aucune réservation pour ces filtres." />}
      {data?.map((r) => <ReservationCard key={r.id} reservation={r} onUpdated={onUpdated} />)}
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
})
