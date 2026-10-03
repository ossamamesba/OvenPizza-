import { useCallback } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { formatDate, formatPrice } from '@shared/lib/format'
import { cityLabel, guestsLabel } from '@shared/lib/labels'
import { getReservation } from '../../src/api/reservations'
import { AppText } from '../../src/components/AppText'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { ReservationActions } from '../../src/components/ReservationActions'
import { Screen } from '../../src/components/Screen'
import { ErrorView, LoadingView } from '../../src/components/StateViews'
import { StatusBadge } from '../../src/components/StatusBadge'
import { useQuery } from '../../src/hooks/useQuery'
import { capitalize } from '../../src/lib/text'
import { colors, fonts, space } from '../../src/theme'

const receivedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export default function ReservationDetailScreen() {
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const load = useCallback(() => getReservation(id), [id])
  const { data: r, error, loading, refreshing, refresh, setData } = useQuery(`reservation:${id}`, load)

  if (loading) return <Screen><LoadingView /></Screen>
  if (!r) return <Screen><ErrorView message={error ?? 'Réservation introuvable.'} onRetry={refresh} /></Screen>

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.address ?? ''}, ${cityLabel(r.city)}`)}`

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.flex}>{r.customerName}</AppText>
        <StatusBadge status={r.status} />
      </View>

      <Card style={styles.card}>
        <Item label="Date" value={`${capitalize(formatDate(r.date))} à ${r.time}`} />
        <Item label="Invités" value={guestsLabel(r)} />
        <Item label="Ville" value={cityLabel(r.city)} />
        <Item label="Adresse" value={r.address ?? '—'} />
        <Item label="Téléphone" value={r.phone} />
        <Item label="Demande reçue le" value={receivedAt.format(new Date(r.createdAt))} />
      </Card>

      {r.items.length > 0 && (
        <Card style={styles.card}>
          <AppText variant="heading" accessibilityRole="header">
            {r.packName} <AppText variant="small">· {r.packPrice && formatPrice(r.packPrice)} / pizza</AppText>
          </AppText>
          {r.items.map((item) => (
            <View key={item.pizzaName} style={styles.itemRow}>
              <AppText variant="bodyStrong" style={styles.flex}>{item.pizzaName}</AppText>
              <AppText style={styles.qty}>× {item.quantity}</AppText>
            </View>
          ))}
          <View style={[styles.itemRow, styles.total]}>
            <AppText variant="bodyStrong" style={styles.flex}>Total : {r.totalPizzas} pizzas</AppText>
            {r.estimatedTotal && <AppText style={styles.totalPrice}>≈ {formatPrice(r.estimatedTotal)}</AppText>}
          </View>
        </Card>
      )}

      {r.notes && (
        <Card style={[styles.card, styles.notes]}>
          <AppText variant="small">Message du client</AppText>
          <AppText>{r.notes}</AppText>
        </Card>
      )}

      <ReservationActions reservation={r} onUpdated={(updated) => setData(() => updated)} />
      <Button label="Appeler le client" icon="call-outline" variant="secondary" onPress={() => Linking.openURL(`tel:${r.phone.replace(/\s/g, '')}`)} />
      {r.address && <Button label="Ouvrir l'adresse dans Maps" icon="map-outline" variant="secondary" onPress={() => Linking.openURL(mapsUrl)} />}
    </Screen>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <AppText variant="small">{label}</AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  card: { gap: space.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', minHeight: 32 },
  qty: { fontFamily: fonts.bodyBold, fontSize: 18 },
  total: { borderTopWidth: 1, borderTopColor: colors.foreground, paddingTop: space.sm },
  totalPrice: { fontFamily: fonts.display, fontSize: 22, color: colors.primary },
  notes: { backgroundColor: colors.accentSoft },
})
