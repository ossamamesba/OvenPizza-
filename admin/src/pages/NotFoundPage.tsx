import { Link } from 'react-router-dom'
import { buttonClass } from '../components/ui/buttonClass'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <title>Page introuvable</title>
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <Link to="/" className={`${buttonClass('primary')} mt-6`}>Retour au tableau de bord</Link>
    </div>
  )
}
