import { ButtonLink } from '../components/ButtonLink'

export function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center">
      <title>Page introuvable</title>
      <h1 className="text-4xl font-bold">Page introuvable</h1>
      <p className="mt-3 text-muted">Cette page n'existe pas (ou a été mangée).</p>
      <ButtonLink to="/" className="mt-8">Retour à l'accueil</ButtonLink>
    </div>
  )
}
