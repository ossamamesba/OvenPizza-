import { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ApiError } from '../src/api/http'
import { useAuth } from '../src/auth/useAuth'
import { AppText } from '../src/components/AppText'
import { Button } from '../src/components/Button'
import { Card } from '../src/components/Card'
import { ServerStatus } from '../src/components/ServerStatus'
import { TextField } from '../src/components/TextField'
import { colors, space } from '../src/theme'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!email.trim() || !password) {
      setError('Indiquez votre email et votre mot de passe.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Connexion impossible.')
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require('../assets/logo.png')} style={styles.logo} accessibilityLabel="Oven's Pizza Party" />
          <AppText variant="title" style={styles.center}>Espace patron</AppText>
          <AppText variant="muted" style={styles.center}>Réservations, packs et pizzas, depuis votre téléphone.</AppText>

          <Card style={styles.card}>
            {error && <AppText style={styles.error} accessibilityRole="alert">{error}</AppText>}
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="username" />
            <View>
              <TextField label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="current-password" textContentType="password" onSubmitEditing={submit} style={styles.passwordInput} />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={styles.eye}
                hitSlop={8}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
              </Pressable>
            </View>
            <Button label="Se connecter" loading={submitting} onPress={submit} />
            <ServerStatus />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.foreground },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: space.xl, gap: space.md },
  logo: { width: 112, height: 112, alignSelf: 'center', borderRadius: 56 },
  center: { textAlign: 'center', color: '#ffffff' },
  card: { gap: space.lg, marginTop: space.lg },
  error: { color: colors.danger, fontWeight: '700', textAlign: 'center' },
  passwordInput: { paddingRight: 52 },
  eye: { position: 'absolute', right: 6, top: 30, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
})
