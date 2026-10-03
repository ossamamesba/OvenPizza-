import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import type { AdminPizza } from '@shared/api/types'
import { listPacks } from '../../src/api/packs'
import { listPizzas, updatePizza } from '../../src/api/pizzas'
import { ApiError } from '../../src/api/http'
import { AppSwitch } from '../../src/components/AppSwitch'
import { AppText } from '../../src/components/AppText'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { PizzaThumb } from '../../src/components/PizzaThumb'
import { Screen } from '../../src/components/Screen'
import { EmptyView, ErrorView, LoadingView } from '../../src/components/StateViews'
import { useQuery } from '../../src/hooks/useQuery'
import { colors, fonts, space } from '../../src/theme'

/** Toutes les pizzas rangées par pack, avec l'interrupteur « disponible ». */
export default function PizzasScreen() {
  const load = useCallback(async () => {
    const [packs, pizzas] = await Promise.all([listPacks(), listPizzas()])
    return { packs, pizzas }
  }, [])
  const { data, error, loading, refreshing, refresh, setData } = useQuery('pizzas', load)
  const [toggling, setToggling] = useState<number | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  async function toggle(pizza: AdminPizza, isAvailable: boolean) {
    setToggling(pizza.id)
    setToggleError(null)
    try {
      const updated = await updatePizza(pizza.id, { isAvailable })
      setData((d) => ({ ...d, pizzas: d.pizzas.map((p) => (p.id === updated.id ? updated : p)) }))
    } catch (e) {
      setToggleError(e instanceof ApiError ? e.message : 'Modification impossible.')
    } finally {
      setToggling(null)
    }
  }

  const groups = data
    ? [
        ...data.packs.map((pack) => ({ key: String(pack.id), title: pack.name, items: data.pizzas.filter((p) => p.packId === pack.id) })),
        { key: 'none', title: 'Sans pack (non proposées)', items: data.pizzas.filter((p) => !data.packs.some((pk) => pk.id === p.packId)) },
      ].filter((g) => g.items.length > 0)
    : []

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Button label="Ajouter une pizza" icon="add" onPress={() => router.push({ pathname: '/pizza/[id]', params: { id: 'new' } })} />
      {toggleError && <AppText style={styles.error} accessibilityRole="alert">{toggleError}</AppText>}
      {loading && <LoadingView />}
      {error && !data && <ErrorView message={error} onRetry={refresh} />}
      {data && data.pizzas.length === 0 && <EmptyView message="Aucune pizza pour le moment." />}
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <AppText variant="small" style={styles.groupTitle} accessibilityRole="header">{group.title.toUpperCase()}</AppText>
          <Card style={styles.list}>
            {group.items.map((pizza, index) => (
              <View key={pizza.id} style={[styles.row, index > 0 && styles.separator]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Modifier ${pizza.name}`}
                  onPress={() => router.push(`/pizza/${pizza.id}`)}
                  style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}
                >
                  <PizzaThumb image={pizza.image} size={52} />
                  <View style={styles.flex}>
                    <AppText variant="bodyStrong">{pizza.name}</AppText>
                    <AppText variant="small" style={{ color: pizza.isAvailable ? colors.success : colors.muted }}>
                      {pizza.isAvailable ? 'Disponible' : 'Indisponible'}
                    </AppText>
                  </View>
                </Pressable>
                <AppSwitch
                  value={pizza.isAvailable}
                  disabled={toggling === pizza.id}
                  onValueChange={(value) => toggle(pizza, value)}
                  label={`${pizza.name} disponible`}
                />
              </View>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  group: { gap: space.sm, marginTop: space.sm },
  groupTitle: { fontFamily: fonts.bodyBold, letterSpacing: 1 },
  list: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64 },
  separator: { borderTopWidth: 1, borderTopColor: colors.border },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  flex: { flex: 1 },
  error: { color: colors.danger, fontFamily: fonts.bodyBold },
})
