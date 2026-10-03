/**
 * Adresse de l'API Symfony, lue dans mobile/.env (variable EXPO_PUBLIC_API_URL).
 * Sur le téléphone, « localhost » désigne le téléphone lui-même : mettre l'adresse IP du PC
 * sur le Wi-Fi, ex. http://192.168.1.20:8090
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8090').replace(/\/$/, '')
