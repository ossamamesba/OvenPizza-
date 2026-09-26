import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ButtonLink'
import { PizzaMark } from '../components/Logo'
import { PizzaGrid } from '../components/PizzaGrid'
import { hoursLabel, restaurant } from '../config/restaurant'

export function HomePage() {
  const todayHours = hoursLabel(restaurant.openingHours[new Date().getDay()])

  return (
    <>
      <title>{`${restaurant.name} — Pizzeria à ${restaurant.address.city}`}</title>

      {/* Hero */}
      <section className="overflow-hidden">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent-soft px-4 py-1.5 font-semibold text-accent">
              Pizzeria à {restaurant.address.city}
            </p>
            <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl">
              La fête commence <span className="text-primary">au four.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted md:text-xl">{restaurant.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/reservation">Réserver une table</ButtonLink>
              <ButtonLink to="/menu" variant="outline">
                Voir le menu <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute inset-6 rounded-full bg-primary/10 blur-2xl" />
            <PizzaMark className="relative size-full drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Infos rapides */}
      <section aria-label="Infos pratiques" className="container-page">
        <ul className="grid gap-4 rounded-card bg-surface p-6 shadow-card ring-1 ring-border sm:grid-cols-3">
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span><strong className="block">Aujourd'hui</strong>{todayHours}</span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span><strong className="block">Adresse</strong>{restaurant.address.street}, {restaurant.address.city}</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong className="block">Téléphone</strong>
              <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="hover:text-primary">{restaurant.phone}</a>
            </span>
          </li>
        </ul>
      </section>

      {/* Aperçu du menu */}
      <section className="container-page mt-20" aria-labelledby="favorites-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="favorites-title" className="text-3xl font-bold md:text-4xl">Nos pizzas</h2>
            <p className="mt-2 text-muted">Pâte pétrie chaque matin, ingrédients frais.</p>
          </div>
          <Link to="/menu" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline">
            Tout le menu <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <PizzaGrid limit={3} />
      </section>

      {/* Appel à réserver */}
      <section className="container-page mt-20">
        <div className="rounded-card bg-primary px-6 py-12 text-center text-on-primary md:px-12">
          <h2 className="text-3xl font-bold md:text-4xl">Une table pour ce soir ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Réservez en ligne en une minute, le restaurant vous confirme rapidement.
          </p>
          <Link
            to="/reservation"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-8 font-semibold text-primary transition-colors hover:bg-accent-soft"
          >
            Réserver maintenant
          </Link>
        </div>
      </section>
    </>
  )
}
