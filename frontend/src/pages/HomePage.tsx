import { ArrowRight, ChefHat, Clock, Flame, Leaf, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ButtonLink'
import { LogoMark } from '../components/Logo'
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
          {/* Photo du pizzaïolo + logo en « tampon » + étiquette */}
          <div className="relative mx-auto w-full max-w-sm pb-6 pl-6 md:max-w-md">
            <div className="absolute inset-0 left-10 top-4 rotate-3 rounded-[2.5rem] bg-primary/15" aria-hidden="true" />
            <img
              src="/images/chef-stand.webp"
              alt="Un pizzaïolo d'Oven's Pizza Party garnit une pizza au stand"
              width={900}
              height={1196}
              fetchPriority="high"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-card"
            />
            <LogoMark className="absolute bottom-0 left-0 size-28 shadow-card ring-4 ring-background md:size-32" />
            <p className="absolute -right-2 top-8 rotate-6 rounded-full bg-accent px-4 py-2 font-display text-lg font-bold text-white shadow-card">
              Pâte maison
            </p>
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

      {/* Savoir-faire : le côté humain */}
      <section className="container-page mt-24" aria-labelledby="story-title">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <figure className="mx-auto w-full max-w-sm -rotate-2 rounded-2xl bg-surface p-3 pb-4 shadow-card ring-1 ring-border transition-transform duration-300 hover:rotate-0">
            <img
              src="/images/chef-event.webp"
              alt="Le pizzaïolo termine une pizza pepperoni avec un filet de crème balsamique"
              width={900}
              height={1196}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <figcaption className="mt-3 text-center font-display text-lg italic text-muted">Le dernier geste, juste avant de servir.</figcaption>
          </figure>
          <div>
            <p className="font-semibold uppercase tracking-wider text-accent">Notre savoir-faire</p>
            <h2 id="story-title" className="mt-2 text-3xl font-bold md:text-4xl">Fait main, cuit devant vous.</h2>
            <p className="mt-4 text-lg text-muted">
              Chez {restaurant.name}, chaque pizza est étalée à la main, garnie à la minute et sortie du four sous vos yeux.
              Pas de secret : une bonne pâte, de bons produits et beaucoup de passion.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                { Icon: ChefHat, title: 'Pâte pétrie maison', text: 'Une pâte qui repose longtemps pour être légère et croustillante.' },
                { Icon: Leaf, title: 'Ingrédients frais', text: 'Mozzarella, basilic, tomates : choisis avec soin, chaque jour.' },
                { Icon: Flame, title: 'Cuite à la minute', text: 'Sortie du four et servie aussitôt, bien chaude.' },
              ].map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-lg">{title}</strong>
                    <span className="text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
