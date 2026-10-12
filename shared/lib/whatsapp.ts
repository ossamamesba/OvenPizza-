import type { Reservation } from '../api/types'
import { formatDate, formatPrice } from './format'
import { cityLabel, guestsLabel, itemsLabel } from './labels'

/**
 * Numéro au format international sans « + » (exigé par wa.me).
 * "06 12 34 56 78" → "212612345678" ; "+212 6…" et "00212 6…" sont aussi acceptés (Maroc par défaut).
 */
export function toWhatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '')
  return digits.startsWith('0') ? `212${digits.slice(1)}` : digits
}

/** Lien qui ouvre une conversation WhatsApp avec ce numéro, message déjà écrit. */
export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${toWhatsappNumber(phone)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Récapitulatif envoyé par le client au traiteur après sa réservation.
 * Le numéro de réservation est le même que dans le dashboard (traçabilité).
 */
export function reservationMessage(r: Reservation): string {
  return [
    `🍕 *Nouvelle réservation n°${r.id}*`,
    `👤 ${r.customerName} · 📞 ${r.phone}`,
    `📅 ${formatDate(r.date)} à ${r.time}`,
    `📍 ${[cityLabel(r.city), r.address].filter(Boolean).join(' — ')}`,
    `🍽️ ${r.packName ?? 'Pack'} : ${itemsLabel(r)} (${r.totalPizzas} pizzas)`,
    `👥 ${guestsLabel(r)}`,
    r.estimatedTotal ? `💰 Total estimé : ${formatPrice(r.estimatedTotal)}` : null,
    r.notes ? `📝 ${r.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Premier message du traiteur au client, depuis le dashboard ou l'app du patron. */
export function customerGreeting(r: Reservation): string {
  return `Bonjour ${r.customerName}, ici Oven's Pizza Party au sujet de votre réservation n°${r.id} du ${formatDate(r.date)} à ${r.time}.`
}
