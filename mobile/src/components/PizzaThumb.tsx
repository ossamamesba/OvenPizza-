import { Image, StyleSheet, View } from 'react-native'
import { pizzaImageUrl } from '@shared/lib/format'
import { API_URL } from '../config/env'
import { colors, radius } from '../theme'

/** Photo de la pizza, ou le logo si elle n'en a pas encore. */
export function PizzaThumb({ image, size = 56 }: { image: string | null; size?: number }) {
  const url = pizzaImageUrl(image, API_URL)
  return url ? (
    <Image source={{ uri: url }} style={[styles.base, { width: size, height: size }]} accessibilityIgnoresInvertColors />
  ) : (
    <View style={[styles.base, styles.placeholder, { width: size, height: size }]}>
      <Image source={require('../../assets/logo.png')} style={{ width: size * 0.7, height: size * 0.7, opacity: 0.85 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm },
  placeholder: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
})
