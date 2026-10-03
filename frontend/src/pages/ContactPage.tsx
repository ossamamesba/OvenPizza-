import { AtSign, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { phoneHref, restaurant, whatsappHref } from '../config/restaurant'

interface ContactLink {
  Icon: LucideIcon
  label: string
  value: string
  href: string
  external?: boolean
}

export function ContactPage() {
  const links: ContactLink[] = [
    { Icon: Phone, label: 'Appeler', value: restaurant.phone, href: phoneHref },
    { Icon: MessageCircle, label: 'WhatsApp', value: 'Écrivez-nous', href: whatsappHref(), external: true },
    { Icon: Mail, label: 'E-mail', value: restaurant.email, href: `mailto:${restaurant.email}` },
    { Icon: AtSign, label: 'Instagram', value: restaurant.instagramHandle, href: restaurant.instagram, external: true },
  ]

  return (
    <>
      <title>{`Contact — ${restaurant.name}`}</title>
      <PageHeader title="Contact" eyebrow="Parlons de votre événement" intro={`${restaurant.name} accompagne vos fêtes et événements à ${restaurant.zones.join(' et ')}.`} />
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <ul className="grid gap-4">
          {links.map(({ Icon, label, value, href, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex min-h-20 items-center gap-4 rounded-card bg-surface p-5 shadow-card ring-1 ring-border transition-colors hover:ring-primary/50"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{label}</span>
                  <strong className="block truncate text-lg">{value}</strong>
                </span>
                {external && <span className="sr-only">(nouvel onglet)</span>}
              </a>
            </li>
          ))}
        </ul>

        <section aria-labelledby="zones-title" className="relative min-h-80 overflow-hidden rounded-card bg-foreground text-white shadow-card">
          <img src="/images/chef-event.webp" alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-45" />
          <div className="relative flex h-full flex-col justify-end p-8">
            <MapPin className="size-9 text-primary drop-shadow" aria-hidden="true" />
            <h2 id="zones-title" className="sr-only">Zones desservies</h2>
            <p className="mt-4 font-display text-5xl font-bold">{restaurant.zones[0]}</p>
            <div className="my-3 h-px w-2/3 bg-white/40" aria-hidden="true" />
            <p className="self-end font-display text-5xl font-bold">{restaurant.zones[1]}</p>
            <p className="mt-4 text-white/80">Zones desservies · Maroc</p>
          </div>
        </section>
      </div>
    </>
  )
}
