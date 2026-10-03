import { useCallback, useState } from 'react'
import { Alert, Image, Platform, StyleSheet, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import type { AdminPack, AdminPizza, PizzaInput } from '@shared/api/types'
import { formatPrice } from '@shared/lib/format'
import { ApiError } from '../../src/api/http'
import { listPacks } from '../../src/api/packs'
import { createPizza, deletePizza, deletePizzaImage, getPizza, updatePizza, uploadPizzaImage, type PickedImage } from '../../src/api/pizzas'
import { AppSwitch } from '../../src/components/AppSwitch'
import { AppText } from '../../src/components/AppText'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { Chip } from '../../src/components/Chip'
import { PizzaThumb } from '../../src/components/PizzaThumb'
import { Screen } from '../../src/components/Screen'
import { ErrorView, LoadingView } from '../../src/components/StateViews'
import { TextField } from '../../src/components/TextField'
import { useQuery } from '../../src/hooks/useQuery'
import { colors, fonts, radius, space } from '../../src/theme'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** /pizza/new (?packId=) : ajout — /pizza/12 : modification. */
export default function PizzaScreen() {
  const params = useLocalSearchParams<{ id: string; packId?: string }>()
  const pizzaId = params.id === 'new' ? null : Number(params.id)
  const load = useCallback(async () => {
    const [pizza, packs] = await Promise.all([pizzaId ? getPizza(pizzaId) : Promise.resolve(null), listPacks()])
    return { pizza, packs }
  }, [pizzaId])
  const { data, error, loading, refresh } = useQuery(`pizza-form:${params.id}`, load)

  return (
    <>
      <Stack.Screen options={{ title: pizzaId ? 'Modifier la pizza' : 'Ajouter une pizza' }} />
      {loading && <Screen><LoadingView /></Screen>}
      {!loading && !data && <Screen><ErrorView message={error ?? 'Pizza introuvable.'} onRetry={refresh} /></Screen>}
      {data && <PizzaForm key={data.pizza?.id ?? 'new'} pizza={data.pizza} packs={data.packs} presetPackId={Number(params.packId) || null} />}
    </>
  )
}

function PizzaForm({ pizza, packs, presetPackId }: { pizza: AdminPizza | null; packs: AdminPack[]; presetPackId: number | null }) {
  const [form, setForm] = useState<PizzaInput>({
    name: pizza?.name ?? '',
    description: pizza?.description ?? '',
    isAvailable: pizza?.isAvailable ?? true,
    packId: pizza ? pizza.packId : (packs.find((p) => p.id === presetPackId)?.id ?? packs[0]?.id ?? null),
  })
  const [photo, setPhoto] = useState<PickedImage | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const update = <K extends keyof PizzaInput>(field: K, value: PizzaInput[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setErrors((e) => ({ ...e, image: "Autorisez l'accès aux photos dans les réglages du téléphone." }))
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 })
    if (result.canceled) return
    const asset = result.assets[0]
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, image: 'Image trop lourde (5 Mo maximum).' }))
      return
    }
    setErrors((e) => ({ ...e, image: '' }))
    setRemovePhoto(false)
    setPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg', fileName: asset.fileName ?? 'pizza.jpg' })
  }

  async function save() {
    if (!form.name.trim()) {
      setErrors({ name: 'Indiquez le nom de la pizza.' })
      return
    }
    setSaving(true)
    try {
      const input: PizzaInput = { ...form, name: form.name.trim(), description: form.description?.trim() || null }
      const saved = pizza ? await updatePizza(pizza.id, input) : await createPizza(input)
      // La photo part après l'enregistrement : elle a besoin de l'identifiant de la pizza.
      if (photo) await uploadPizzaImage(saved.id, photo)
      else if (removePhoto && pizza?.image) await deletePizzaImage(saved.id)
      router.back()
    } catch (err) {
      setErrors(err instanceof ApiError && Object.keys(err.violations).length > 0
        ? Object.fromEntries(Object.entries(err.violations).map(([k, v]) => [k, v[0]]))
        : { form: err instanceof ApiError ? err.message : 'Enregistrement impossible.' })
      setSaving(false)
    }
  }

  async function remove() {
    if (!pizza) return
    setDeleting(true)
    try {
      await deletePizza(pizza.id)
      router.back()
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : 'Suppression impossible.' })
      setDeleting(false)
    }
  }

  function confirmRemove() {
    const message = `« ${pizza?.name} » sera retirée définitivement. Pour la cacher un moment, rendez-la plutôt indisponible.`
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(message)) void remove()
      return
    }
    Alert.alert('Supprimer cette pizza ?', message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void remove() },
    ])
  }

  const shownImage = removePhoto ? null : pizza?.image ?? null

  return (
    <Screen>
      {errors.form && <AppText style={styles.error} accessibilityRole="alert">{errors.form}</AppText>}

      <Card style={styles.card}>
        <AppText variant="label">Photo</AppText>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.preview} accessibilityLabel="Aperçu de la nouvelle photo" />
        ) : shownImage ? (
          <View style={styles.previewWrap}><PizzaThumb image={shownImage} size={240} /></View>
        ) : (
          <View style={[styles.preview, styles.empty]}><AppText variant="muted">Pas encore de photo</AppText></View>
        )}
        <Button label={photo || shownImage ? 'Changer la photo' : 'Choisir une photo'} icon="image-outline" variant="secondary" onPress={pickPhoto} />
        {(photo || shownImage) && (
          <Button label="Retirer la photo" icon="trash-outline" variant="danger" compact onPress={() => { setPhoto(null); setRemovePhoto(true) }} />
        )}
        {errors.image ? <AppText style={styles.error}>{errors.image}</AppText> : <AppText variant="small">JPG, PNG ou WebP, 5 Mo maximum.</AppText>}
      </Card>

      <Card style={styles.card}>
        <TextField label="Nom" value={form.name} onChangeText={(v) => update('name', v)} error={errors.name} maxLength={100} />
        <TextField label="Description" value={form.description ?? ''} onChangeText={(v) => update('description', v)} multiline helper="Les ingrédients principaux, affichés sur le site." />
        <View style={styles.packs}>
          <AppText variant="label">Pack</AppText>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {packs.map((p) => (
              <Chip key={p.id} label={`${p.name} · ${formatPrice(p.price)}`} selected={form.packId === p.id} onPress={() => update('packId', p.id)} />
            ))}
            <Chip label="Aucun pack" selected={form.packId === null} onPress={() => update('packId', null)} />
          </View>
          <AppText variant="small">{errors.packId || 'Le prix de la pizza est celui de son pack.'}</AppText>
        </View>
        <View style={styles.switchRow}>
          <AppText variant="bodyStrong" style={styles.flex}>Disponible sur le site</AppText>
          <AppSwitch value={form.isAvailable} onValueChange={(v) => update('isAvailable', v)} label="Disponible sur le site" />
        </View>
      </Card>

      <Button label={pizza ? 'Enregistrer' : 'Ajouter la pizza'} icon="checkmark" loading={saving} disabled={deleting} onPress={save} />
      {pizza && <Button label="Supprimer la pizza" icon="trash-outline" variant="danger" loading={deleting} disabled={saving} onPress={confirmRemove} />}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  error: { color: colors.danger, fontFamily: fonts.bodyBold },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md },
  previewWrap: { alignItems: 'center' },
  empty: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  packs: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  flex: { flex: 1 },
})
