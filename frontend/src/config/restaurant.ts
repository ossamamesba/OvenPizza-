/**
 * Informations du traiteur affichées sur le site.
 * (Les packs, les pizzas et les prix, eux, viennent TOUJOURS de l'API.)
 */
export const restaurant = {
  name: "Oven's Pizza Party",
  tagline: 'Des pizzas gourmandes pour vos moments inoubliables.',
  /** Villes desservies (doivent correspondre à l'énumération ServiceCity du backend). */
  zones: ['Casablanca', 'Rabat'],
  phone: '06 36 31 23 84',
  /** Numéro WhatsApp au format international, sans + ni espaces. */
  whatsapp: '212636312384',
  email: 'ovenspizzaparty@gmail.com',
  instagram: 'https://www.instagram.com/ovenspizzaparty/',
  instagramHandle: '@ovenspizzaparty',
} as const

export const phoneHref = `tel:${restaurant.phone.replace(/\s/g, '')}`

export function whatsappHref(message = "Bonjour Oven's Pizza Party, je souhaite des informations pour un événement.") {
  return `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`
}
