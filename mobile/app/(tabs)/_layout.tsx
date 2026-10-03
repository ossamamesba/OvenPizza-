import type { ColorValue } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../../src/theme'

type IconName = keyof typeof Ionicons.glyphMap

const tab = (title: string, icon: IconName, iconActive: IconName) => ({
  title,
  tabBarIcon: ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? iconActive : icon} color={color as string} size={size} />
  ),
})

/** Navigation principale en bas de l'écran (5 onglets maximum, icône + texte). */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.display, color: colors.foreground },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ ...tab('Accueil', 'home-outline', 'home'), headerTitle: 'Tableau de bord' }} />
      <Tabs.Screen name="reservations" options={{ ...tab('Demandes', 'calendar-outline', 'calendar'), headerTitle: 'Réservations' }} />
      <Tabs.Screen name="packs" options={tab('Packs', 'cube-outline', 'cube')} />
      <Tabs.Screen name="pizzas" options={tab('Pizzas', 'pizza-outline', 'pizza')} />
      <Tabs.Screen name="profile" options={tab('Profil', 'person-circle-outline', 'person-circle')} />
    </Tabs>
  )
}
