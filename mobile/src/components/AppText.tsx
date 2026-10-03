import { Text, type TextProps } from 'react-native'
import { colors, fonts } from '../theme'

const variants = {
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.foreground },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, color: colors.foreground },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.foreground },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23, color: colors.foreground },
  muted: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.muted },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 19, color: colors.foreground },
  small: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.muted },
} as const

export type TextVariant = keyof typeof variants

/** Texte de l'app avec les styles de la marque (la taille suit le réglage d'accessibilité du téléphone). */
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  return <Text {...props} style={[variants[variant], style]} maxFontSizeMultiplier={1.6} />
}
