/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de l'API Symfony. Vide = même domaine (proxy Vite en développement). */
  readonly VITE_API_URL?: string
}
