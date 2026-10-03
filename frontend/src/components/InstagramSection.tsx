import { Camera } from 'lucide-react'
import { restaurant } from '../config/restaurant'
import { Eyebrow } from './Eyebrow'

/** Photos des coulisses (fichiers statiques : décor, pas de prix ni de menu). */
const PHOTOS = [
  { src: '/images/insta/stand-jour.webp', alt: 'Le pizzaïolo garnit une pizza au stand, en plein jour' },
  { src: '/images/insta/stand-nuit.webp', alt: 'Le stand Oven’s Pizza Party illuminé lors d’une soirée' },
  { src: '/images/insta/finition.webp', alt: 'Finition d’une pizza pepperoni avec un filet de crème balsamique' },
  { src: '/images/insta/four.webp', alt: 'Four à pizza portable, une pizza en cuisson' },
  { src: '/images/insta/four-margherita.webp', alt: 'Pizza margherita devant le four à pizza' },
  { src: '/images/insta/salon.webp', alt: 'Démonstration de pizza devant le public lors d’un salon professionnel' },
]

export function InstagramSection() {
  return (
    <section aria-labelledby="instagram-title" className="container-page mt-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Dans les coulisses</Eyebrow>
          <h2 id="instagram-title" className="mt-3 text-3xl font-bold md:text-5xl">Suivez-nous sur Instagram</h2>
          <p className="mt-2 text-lg text-muted">{restaurant.instagramHandle}</p>
        </div>
        <a
          href={restaurant.instagram}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 font-semibold text-white transition-colors hover:bg-primary"
        >
          <Camera className="size-5" aria-hidden="true" /> Découvrir notre Instagram
          <span className="sr-only">(nouvel onglet)</span>
        </a>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {PHOTOS.map((photo) => (
          <li key={photo.src}>
            <a
              href={restaurant.instagram}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-2xl shadow-card"
              aria-label={`${photo.alt} — voir sur Instagram`}
            >
              <img
                src={photo.src}
                alt=""
                width={600}
                height={600}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
