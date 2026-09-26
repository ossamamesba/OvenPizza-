import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { OpeningHours } from '../components/OpeningHours'
import { PageHeader } from '../components/PageHeader'
import { restaurant } from '../config/restaurant'

export function InfoPage() {
  const socials = Object.entries(restaurant.social).filter(([, url]) => url)

  return (
    <>
      <title>{`Infos & horaires — ${restaurant.name}`}</title>
      <PageHeader title="Infos & horaires" intro="Où nous trouver et quand venir nous voir." />
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="hours-title" className="rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
          <h2 id="hours-title" className="mb-4 text-2xl font-bold">Horaires d'ouverture</h2>
          <OpeningHours />
        </section>

        <section aria-labelledby="contact-title" className="rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
          <h2 id="contact-title" className="mb-4 text-2xl font-bold">Nous contacter</h2>
          <address className="space-y-4 not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {restaurant.address.street}, {restaurant.address.city}
                <a
                  href={restaurant.address.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                >
                  Ouvrir dans Google Maps <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="min-h-11 content-center font-semibold hover:text-primary">
                {restaurant.phone}
              </a>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${restaurant.email}`} className="min-h-11 content-center hover:text-primary">{restaurant.email}</a>
            </p>
          </address>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-3">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full px-4 capitalize ring-1 ring-border hover:text-primary">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
