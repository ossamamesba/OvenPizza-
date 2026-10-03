import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import type { AdminPack } from '@shared/api/types'
import { ApiError } from '../../src/api/http'
import { getPack, updatePack } from '../../src/api/packs'
import { AppSwitch } from '../../src/components/AppSwitch'
import { AppText } from '../../src/components/AppText'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { Screen } from '../../src/components/Screen'
import { ErrorView, LoadingView } from '../../src/components/StateViews'
import { TextField } from '../../src/components/TextField'
import { useQuery } from '../../src/hooks/useQuery'
import { colors, fonts, space } from '../../src/theme'

/** Modifier un pack : surtout son prix par pizza (visible aussitôt sur le site). */
export default function PackScreen() {
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const load = useCallback(() => getPack(id), [id])
  const { data, error, loading, refresh } = useQuery(`pack:${id}`, load)

  if (loading) return <Screen><LoadingView /></Screen>
  if (!data) return <Screen><ErrorView message={error ?? 'Pack introuvable.'} onRetry={refresh} /></Screen>
  return <PackForm key={data.id} pack={data} />
}

function PackForm({ pack }: { pack: AdminPack }) {
  const [name, setName] = useState(pack.name)
  const [description, setDescription] = useState(pack.description ?? '')
  const [price, setPrice] = useState(String(Number(pack.price)))
  const [maxVarieties, setMaxVarieties] = useState(String(pack.maxVarieties))
  const [isActive, setIsActive] = useState(pack.isActive)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function save() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Indiquez le nom du pack.'
    if (!/^\d{1,6}([.,]\d{1,2})?$/.test(price.trim())) e.price = 'Prix invalide (ex. 100 ou 99,50).'
    if (!(Number(maxVarieties) >= 1 && Number(maxVarieties) <= 20)) e.maxVarieties = 'Entre 1 et 20.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSaving(true)
    try {
      await updatePack(pack.id, {
        name: name.trim(),
        description: description.trim() || null,
        price: price.trim().replace(',', '.'),
        maxVarieties: Number(maxVarieties),
        isActive,
      })
      router.back()
    } catch (err) {
      setErrors(err instanceof ApiError && Object.keys(err.violations).length > 0
        ? Object.fromEntries(Object.entries(err.violations).map(([k, v]) => [k, v[0]]))
        : { form: err instanceof ApiError ? err.message : 'Enregistrement impossible.' })
      setSaving(false)
    }
  }

  return (
    <Screen>
      <Card style={styles.card}>
        {errors.form && <AppText style={styles.error} accessibilityRole="alert">{errors.form}</AppText>}
        <TextField label="Nom" value={name} onChangeText={setName} error={errors.name} maxLength={100} />
        <TextField label="Prix par pizza (DH)" value={price} onChangeText={setPrice} error={errors.price} keyboardType="decimal-pad" helper="Le site affiche ce prix aussitôt." />
        <TextField label="Variétés maximum" value={maxVarieties} onChangeText={setMaxVarieties} error={errors.maxVarieties} keyboardType="number-pad" />
        <TextField label="Description" value={description} onChangeText={setDescription} multiline />
        <View style={styles.switchRow}>
          <AppText variant="bodyStrong" style={styles.flex}>Visible sur le site</AppText>
          <AppSwitch value={isActive} onValueChange={setIsActive} label="Visible sur le site" />
        </View>
      </Card>
      <Button label="Enregistrer" icon="checkmark" loading={saving} onPress={save} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { gap: space.lg },
  flex: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  error: { color: colors.danger, fontFamily: fonts.bodyBold },
})
