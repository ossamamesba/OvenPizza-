import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { colors, fonts, radius, TOUCH_TARGET } from '../theme'
import { AppText } from './AppText'

interface Props extends TextInputProps {
  label: string
  error?: string
  helper?: string
}

/** Champ avec libellé visible, aide et message d'erreur juste en dessous. */
export function TextField({ label, error, helper, style, ...props }: Props) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#9c8585"
        {...props}
        style={[styles.input, props.multiline && styles.multiline, error ? styles.invalid : null, style]}
      />
      {error ? (
        <AppText style={styles.error} accessibilityLiveRegion="polite">{error}</AppText>
      ) : (
        helper && <AppText variant="small">{helper}</AppText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: TOUCH_TARGET,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.foreground,
  },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  invalid: { borderColor: colors.danger },
  error: { color: colors.danger, fontFamily: fonts.bodyBold, fontSize: 13 },
})
