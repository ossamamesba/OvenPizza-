import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors, space } from '../theme'
import { AppText } from './AppText'
import { Button } from './Button'
import { Card } from './Card'

export function LoadingView({ label = 'Chargement…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText variant="muted">{label}</AppText>
    </View>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card style={styles.box} accessibilityRole="alert">
      <AppText variant="bodyStrong" style={styles.text}>{message}</AppText>
      {onRetry && <Button label="Réessayer" icon="refresh" variant="secondary" onPress={onRetry} />}
    </Card>
  )
}

export function EmptyView({ message }: { message: string }) {
  return (
    <Card style={styles.box}>
      <AppText variant="muted" style={styles.text}>{message}</AppText>
    </Card>
  )
}

const styles = StyleSheet.create({
  center: { paddingVertical: space.xxl * 2, alignItems: 'center', gap: space.md },
  box: { alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  text: { textAlign: 'center' },
})
