import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from '@expo-google-fonts/karla'
import { AuthProvider } from '../src/auth/AuthProvider'
import { useAuth } from '../src/auth/useAuth'
import { colors, fonts } from '../src/theme'

// L'écran de démarrage (logo) reste affiché jusqu'au chargement des polices et de la session.
void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, Karla_400Regular, Karla_500Medium, Karla_700Bold })
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      {fontsLoaded && <RootNavigator />}
    </AuthProvider>
  )
}

function RootNavigator() {
  const { state } = useAuth()

  useEffect(() => {
    if (state.status !== 'loading') void SplashScreen.hideAsync()
  }, [state.status])

  if (state.status === 'loading') return null
  const signedIn = state.status === 'authenticated'

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {/* Écrans du patron : accessibles seulement connecté (sinon redirection vers la connexion). */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reservation/[id]" options={{ title: 'Réservation' }} />
        <Stack.Screen name="pizza/[id]" options={{ title: 'Pizza' }} />
        <Stack.Screen name="pack/[id]" options={{ title: 'Pack' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}
