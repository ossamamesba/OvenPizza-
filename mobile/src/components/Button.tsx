import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius, TOUCH_TARGET } from '../theme'
import { AppText } from './AppText'

const variants = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.surface, fg: colors.foreground, border: colors.border },
  success: { bg: colors.success, fg: '#ffffff', border: colors.success },
  danger: { bg: colors.surface, fg: colors.danger, border: '#f2b8b8' },
} as const

interface Props extends Omit<PressableProps, 'children' | 'style'> {
  label: string
  variant?: keyof typeof variants
  icon?: keyof typeof Ionicons.glyphMap
  loading?: boolean
  compact?: boolean
}

export function Button({ label, variant = 'primary', icon, loading = false, compact = false, disabled, ...props }: Props) {
  const v = variants[variant]
  const isDisabled = disabled || loading
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: v.bg, borderColor: v.border, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={v.fg} size="small" />
        ) : (
          icon && <Ionicons name={icon} size={18} color={v.fg} accessibilityElementsHidden importantForAccessibility="no" />
        )}
        <AppText style={[styles.label, { color: v.fg }]}>{label}</AppText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: TOUCH_TARGET, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 20, justifyContent: 'center' },
  compact: { minHeight: 44, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: fonts.bodyBold, fontSize: 15 },
})
