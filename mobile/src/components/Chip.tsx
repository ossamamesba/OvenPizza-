import { Pressable, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../theme'
import { AppText } from './AppText'

/** Filtre sélectionnable (onglets de statut, etc.). */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected ? styles.selected : styles.idle, pressed && { opacity: 0.8 }]}
    >
      <AppText style={[styles.text, { color: selected ? '#ffffff' : colors.foreground }]}>{label}</AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
  selected: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  text: { fontFamily: fonts.bodyBold, fontSize: 14 },
})
