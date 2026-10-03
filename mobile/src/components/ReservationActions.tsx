import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { AdminReservation, ReservationStatus } from '@shared/api/types'
import { ApiError } from '../api/http'
import { updateReservationStatus } from '../api/reservations'
import { colors, fonts } from '../theme'
import { AppText } from './AppText'
import { Button } from './Button'

interface Props {
  reservation: AdminReservation
  onUpdated: (reservation: AdminReservation) => void
}

/** Accepter / Refuser (on peut changer d'avis : seul le statut actuel est masqué). */
export function ReservationActions({ reservation, onUpdated }: Props) {
  const [busy, setBusy] = useState<ReservationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function change(status: ReservationStatus) {
    setBusy(status)
    setError(null)
    try {
      onUpdated(await updateReservationStatus(reservation.id, status))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {reservation.status !== 'accepted' && (
          <View style={styles.flex}>
            <Button label="Accepter" icon="checkmark" variant="success" compact loading={busy === 'accepted'} disabled={busy !== null} onPress={() => change('accepted')} />
          </View>
        )}
        {reservation.status !== 'refused' && (
          <View style={styles.flex}>
            <Button label="Refuser" icon="close" variant="danger" compact loading={busy === 'refused'} disabled={busy !== null} onPress={() => change('refused')} />
          </View>
        )}
      </View>
      {error && <AppText style={styles.error} accessibilityRole="alert">{error}</AppText>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  error: { color: colors.danger, fontFamily: fonts.bodyBold, fontSize: 13 },
})
