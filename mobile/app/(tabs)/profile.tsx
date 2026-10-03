import { Alert, Image, Linking, Platform, StyleSheet, View } from 'react-native'
import Constants from 'expo-constants'
import { useAuth } from '../../src/auth/useAuth'
import { AppText } from '../../src/components/AppText'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { Screen } from '../../src/components/Screen'
import { API_URL } from '../../src/config/env'
import { space } from '../../src/theme'

export default function ProfileScreen() {
  const { state, logout } = useAuth()
  const email = state.status === 'authenticated' ? state.user.email : ''

  function confirmLogout() {
    if (Platform.OS === 'web') {
      void logout()
      return
    }
    Alert.alert('Se déconnecter ?', 'Vous devrez saisir à nouveau votre mot de passe.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => void logout() },
    ])
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityIgnoresInvertColors />
        <AppText variant="heading">Oven&apos;s Pizza Party</AppText>
        <AppText variant="muted">Connecté en tant que</AppText>
        <AppText variant="bodyStrong">{email}</AppText>
      </Card>
      <Card style={styles.info}>
        <Row label="Version de l'app" value={Constants.expoConfig?.version ?? '—'} />
        <Row label="Serveur" value={API_URL} />
      </Card>
      <Button label="Voir le site client" icon="globe-outline" variant="secondary" onPress={() => Linking.openURL(API_URL.replace(/:\d+$/, ':5173'))} />
      <Button label="Se déconnecter" icon="log-out-outline" variant="danger" onPress={confirmLogout} />
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="muted">{label}</AppText>
      <AppText variant="bodyStrong" style={styles.value} numberOfLines={1}>{value}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 4, paddingVertical: space.xl },
  logo: { width: 88, height: 88, borderRadius: 44, marginBottom: space.sm },
  info: { gap: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  value: { flexShrink: 1, textAlign: 'right' },
})
