import { Platform, Switch, type SwitchProps } from 'react-native'
import { colors } from '../theme'

// Sur le web, la couleur du bouton activé passe par une propriété propre à react-native-web.
const webThumb: object = Platform.OS === 'web' ? { activeThumbColor: '#ffffff' } : {}

/** Interrupteur aux couleurs de la marque (vert = activé), avec un libellé pour les lecteurs d'écran. */
export function AppSwitch({ label, ...props }: SwitchProps & { label: string }) {
  return (
    <Switch
      trackColor={{ true: colors.success, false: '#d6c9c9' }}
      thumbColor="#ffffff"
      accessibilityLabel={label}
      {...webThumb}
      {...props}
    />
  )
}
