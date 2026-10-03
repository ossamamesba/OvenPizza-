import { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { formatPrice } from '@shared/lib/format'
import { listPacks } from '../../src/api/packs'
import { listPizzas } from '../../src/api/pizzas'
import { AppText } from '../../src/components/AppText'
import { Card } from '../../src/components/Card'
import { PizzaThumb } from '../../src/components/PizzaThumb'
import { Screen } from '../../src/components/Screen'
import { EmptyView, ErrorView, LoadingView } from '../../src/components/StateViews'
import { useQuery } from '../../src/hooks/useQuery'
import { colors, fonts, radius, space } from '../../src/theme'

/** Chaque pack avec son prix par pizza et ses pizzas. */
export default function PacksScreen() {
  const load = useCallback(async () => {
    const [packs, pizzas] = await Promise.all([listPacks(), listPizzas()])
    return { packs, pizzas }
  }, [])
  const { data, error, loading, refreshing, refresh } = useQuery('packs', load)

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {loading && <LoadingView />}
      {error && !data && <ErrorView message={error} onRetry={refresh} />}
      {data && data.packs.length === 0 && <EmptyView message="Aucun pack pour le moment." />}
      {data?.packs.map((pack) => {
        const pizzas = data.pizzas.filter((p) => p.packId === pack.id)
        return (
          <Card key={pack.id} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${pack.name}, ${formatPrice(pack.price)} par pizza. Modifier le pack`}
              onPress={() => router.push(`/pack/${pack.id}`)}
              style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.flex}>
                <View style={styles.titleRow}>
                  <AppText variant="heading">{pack.name}</AppText>
                  <View style={[styles.badge, pack.isActive ? styles.badgeOn : styles.badgeOff]}>
                    <AppText style={[styles.badgeText, { color: pack.isActive ? colors.success : colors.muted }]}>
                      {pack.isActive ? 'Visible' : 'Masqué'}
                    </AppText>
                  </View>
                </View>
                <AppText style={styles.price}>
                  {formatPrice(pack.price)} <AppText variant="small">/ pizza · {pack.maxVarieties} variétés max.</AppText>
                </AppText>
              </View>
              <Ionicons name="create-outline" size={22} color={colors.muted} />
            </Pressable>
            {pizzas.map((pizza) => (
              <Pressable
                key={pizza.id}
                accessibilityRole="button"
                accessibilityLabel={`${pizza.name}, ${pizza.isAvailable ? 'disponible' : 'indisponible'}. Modifier`}
                onPress={() => router.push(`/pizza/${pizza.id}`)}
                style={({ pressed }) => [styles.pizza, pressed && { opacity: 0.7 }]}
              >
                <PizzaThumb image={pizza.image} size={44} />
                <AppText variant="bodyStrong" style={styles.flex}>{pizza.name}</AppText>
                <AppText variant="small" style={{ color: pizza.isAvailable ? colors.success : colors.muted }}>
                  {pizza.isAvailable ? 'Disponible' : 'Indisponible'}
                </AppText>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/pizza/[id]', params: { id: 'new', packId: String(pack.id) } })}
              style={({ pressed }) => [styles.add, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <AppText style={styles.addText}>Ajouter une pizza à ce pack</AppText>
            </Pressable>
          </Card>
        )
      })}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  price: { fontFamily: fonts.display, fontSize: 24, color: colors.primary, marginTop: 4 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOn: { backgroundColor: colors.successSoft },
  badgeOff: { backgroundColor: '#eee6e6' },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 12 },
  pizza: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48 },
  addText: { color: colors.primary, fontFamily: fonts.bodyBold },
})
