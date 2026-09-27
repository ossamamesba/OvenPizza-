import { Link } from 'react-router-dom'
import { AtSign, MapPin, Phone } from 'lucide-react'
import { restaurant } from '../../config/restaurant'
import { LogoMark } from '../Logo'

export function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-white/85">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="flex items-center gap-3 font-display text-xl font-bold text-white">
            <LogoMark className="size-12" /> {restaurant.name}
          </p>
          <p className="mt-3 max-w-xs">{restaurant.tagline}</p>
          {restaurant.social.instagram && (
            <a
              href={restaurant.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              <AtSign className="size-4" aria-hidden="true" /> ovenspizzaparty
              <span className="sr-only">(Instagram, nouvel onglet)</span>
            </a>
          )}
        </div>
        <address className="space-y-2 not-italic">
          <p className="flex gap-2">
            <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>{restaurant.address.street}, {restaurant.address.city}</span>
          </p>
          <p className="flex gap-2">
            <Phone className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="hover:text-white">{restaurant.phone}</a>
          </p>
        </address>
        <nav aria-label="Liens du pied de page">
          <ul className="space-y-2">
            <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link to="/infos" className="hover:text-white">Infos & horaires</Link></li>
            <li><Link to="/reservation" className="hover:text-white">Réserver une table</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-sm text-white/70">
        © {new Date().getFullYear()} {restaurant.name}
      </p>
    </footer>
  )
}
