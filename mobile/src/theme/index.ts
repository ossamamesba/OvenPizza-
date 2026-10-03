import { colors } from '@shared/theme/tokens'

export { colors }

/** Polices chargées dans app/_layout.tsx (mêmes familles que le site et le dashboard). */
export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  body: 'Karla_400Regular',
  bodyMedium: 'Karla_500Medium',
  bodyBold: 'Karla_700Bold',
} as const

/** Échelle d'espacement (multiples de 4). */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const

/** Zone tactile minimale recommandée sur Android (48 dp). */
export const TOUCH_TARGET = 48

export const shadow = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const
