import { Link } from 'react-router-dom'
import { AtSign, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { phoneHref, restaurant, whatsappHref } from '../../config/restaurant'
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
          {restaurant.instagram && (
            <a
              href={restaurant.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              <AtSign className="size-4" aria-hidden="true" /> {restaurant.instagramHandle.replace('@', '')}
              <span className="sr-only">(Instagram, nouvel onglet)</span>
            </a>
          )}
        </div>
        <address className="space-y-2 not-italic">
          <p className="flex gap-2">
            <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>{restaurant.zones.join(' · ')}</span>
          </p>
          <p className="flex gap-2">
            <Phone className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <a href={phoneHref} className="hover:text-white">{restaurant.phone}</a>
          </p>
          <p className="flex gap-2">
            <MessageCircle className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <a href={whatsappHref()} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
          </p>
          <p className="flex gap-2">
            <Mail className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <a href={`mailto:${restaurant.email}`} className="break-all hover:text-white">{restaurant.email}</a>
          </p>
        </address>
        <nav aria-label="Liens du pied de page">
          <ul className="space-y-2">
            <li><Link to="/packs" className="hover:text-white">Nos packs</Link></li>
            <li><Link to="/reservation" className="hover:text-white">Réserver</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-sm text-white/70">
        © {new Date().getFullYear()} {restaurant.name}
      </p>
    </footer>
  )
}
