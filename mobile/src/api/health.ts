import { http } from './http'

/** Vérifie que le téléphone joint l'API (route publique, sans jeton). Abandonne après `timeoutMs`. */
export async function pingServer(timeoutMs = 6000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await http.anonymous('/api/packs', { signal: controller.signal })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
