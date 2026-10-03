import type { ReactNode } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { colors, space } from '../theme'

interface Props {
  children: ReactNode
  /** Tirer vers le bas pour rafraîchir. */
  refreshing?: boolean
  onRefresh?: () => void
}

/** Conteneur standard d'un écran : défilement, marges, rafraîchissement. */
export function Screen({ children, refreshing = false, onRefresh }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} /> : undefined}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.lg, paddingBottom: space.xxl * 2, gap: space.md },
})
