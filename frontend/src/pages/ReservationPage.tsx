import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2, Pencil } from 'lucide-react'
import type { GuestRange, Reservation, ServiceCity } from '@shared/api/types'
import { formatDate, formatPrice, toIsoDate } from '@shared/lib/format'
import { CITIES, GUEST_RANGES, guestsLabel, itemsLabel } from '@shared/lib/labels'
import { ApiError } from '../api/client'
import { createReservation } from '../api/reservations'
import { ButtonLink } from '../components/ButtonLink'
import { LoadError } from '../components/LoadError'
import { PageHeader } from '../components/PageHeader'
import { restaurant, whatsappHref } from '../config/restaurant'
import { usePacks } from '../hooks/usePacks'
import { summarize, useOrder } from '../order/useOrder'

type Field = 'customerName' | 'phone' | 'date' | 'time' | 'city' | 'address' | 'numberOfPeople' | 'notes' | 'items' | 'packId'
type Errors = Partial<Record<Field, string>>

interface FormState {
  customerName: string
  phone: string
  date: string
  time: string
  city: ServiceCity | ''
  address: string
  /** Une tranche, ou 'exact' pour saisir le nombre d'invités. */
  guests: GuestRange | 'exact' | ''
  exactGuests: string
  notes: string
}

const LABELS: Record<Field, string> = {
  customerName: 'Nom', phone: 'Téléphone', date: 'Date', time: 'Heure', city: 'Ville', address: 'Adresse',
  numberOfPeople: "Nombre d'invités", notes: 'Message', items: 'Pizzas', packId: 'Pack',
}
const PHONE_PATTERN = /^\+?[0-9 ]{8,20}$/ // identique à la validation du backend

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.customerName.trim()) errors.customerName = 'Indiquez votre nom.'
  if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Numéro invalide (ex. 06 12 34 56 78).'
  if (!form.date) errors.date = 'Choisissez une date.'
  if (!form.time) errors.time = 'Choisissez une heure.'
  if (!form.city) errors.city = 'Choisissez une ville.'
  if (!form.address.trim()) errors.address = "Indiquez l'adresse de l'événement."
  if (!form.guests) errors.numberOfPeople = "Choisissez une tranche ou le nombre exact d'invités."
  if (form.guests === 'exact' && !(Number(form.exactGuests) >= 1)) errors.numberOfPeople = "Indiquez le nombre d'invités."
  return errors
}

const inputClass = (invalid: boolean) =>
  `mt-1.5 block min-h-12 w-full rounded-xl border bg-surface px-4 text-base ${invalid ? 'border-danger' : 'border-border'} focus:border-primary`
const chipClass = (checked: boolean) =>
  `flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-4 text-center font-semibold ring-1 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${checked ? 'bg-foreground text-white ring-foreground' : 'bg-surface ring-border hover:ring-foreground/40'}`

export function ReservationPage() {
  const { state, retry } = usePacks()
  const order = useOrder()
  const pack = state.status === 'success' ? state.packs.find((p) => p.id === order.packId) : undefined
  const summary = summarize(pack, order.quantities)

  const today = toIsoDate(new Date())
  const [form, setForm] = useState<FormState>({
    customerName: '', phone: '', date: '', time: '', city: '', address: '', guests: '', exactGuests: '', notes: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<Reservation | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    const errorField = (field === 'guests' || field === 'exactGuests' ? 'numberOfPeople' : field) as Field
    setErrors((e) => ({ ...e, [errorField]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!pack) return
    const clientErrors = validate(form)
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setSubmitting(true)
    try {
      const reservation = await createReservation({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        date: form.date,
        time: form.time,
        city: form.city as ServiceCity,
        address: form.address.trim(),
        guestRange: form.guests !== 'exact' ? (form.guests as GuestRange) : null,
        numberOfPeople: form.guests === 'exact' ? Number(form.exactGuests) : null,
        notes: form.notes.trim() || null,
        packId: pack.id,
        items: summary.items.map((i) => ({ pizzaId: i.pizza.id, quantity: i.quantity })),
      })
      setConfirmed(reservation)
      order.clear()
      window.scrollTo(0, 0)
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.violations).length > 0) {
        setErrors(Object.fromEntries(Object.entries(error.violations).map(([field, messages]) => [field.replace(/\[.*$/, ''), messages[0]])))
      } else {
        setFormError(error instanceof ApiError ? error.message : 'Une erreur est survenue. Réessayez.')
      }
      requestAnimationFrame(() => summaryRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="container-page max-w-2xl py-14">
        <title>{`Demande envoyée — ${restaurant.name}`}</title>
        <div role="status" className="rounded-card bg-surface p-8 text-center shadow-card ring-1 ring-border">
          <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-bold">Demande envoyée !</h1>
          <p className="mt-3 text-muted">
            Merci {confirmed.customerName}. Votre demande pour le <strong>{formatDate(confirmed.date)}</strong> à{' '}
            <strong>{confirmed.time}</strong> ({confirmed.packName} : {itemsLabel(confirmed)}) est bien reçue.
            Nous vous recontactons au <strong>{confirmed.phone}</strong> pour la confirmer.
          </p>
          <ButtonLink to="/" variant="outline" className="mt-8">Retour à l'accueil</ButtonLink>
        </div>
      </div>
    )
  }

  const header = <PageHeader title="Réserver votre pizza party" intro="Vérifiez votre sélection, puis indiquez les détails de votre événement." />

  if (state.status === 'loading') return <>{header}<p role="status" className="py-10 text-center text-muted">Chargement…</p></>
  if (state.status === 'error') return <>{header}<div className="container-page"><LoadError message={state.message} onRetry={retry} /></div></>
  if (!pack || summary.items.length === 0) {
    return (
      <>
        <title>{`Réserver — ${restaurant.name}`}</title>
        {header}
        <div className="container-page max-w-2xl">
          <div className="rounded-card bg-surface p-8 text-center shadow-card ring-1 ring-border">
            <p className="text-lg font-semibold">Commencez par choisir votre pack et vos pizzas.</p>
            <ButtonLink to="/packs" className="mt-6">Voir nos packs</ButtonLink>
            <p className="mt-6 text-muted">
              Une question ? <a href={whatsappHref()} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">Écrivez-nous sur WhatsApp</a>
            </p>
          </div>
        </div>
      </>
    )
  }

  const errorEntries = Object.entries(errors).filter(([, message]) => message) as [Field, string][]
  const fieldProps = (field: Field) => ({
    id: field,
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    className: inputClass(Boolean(errors[field])),
  })
  const fieldError = (field: Field) =>
    errors[field] && <p id={`${field}-error`} className="mt-1.5 text-sm font-semibold text-danger">{errors[field]}</p>

  return (
    <>
      <title>{`Réserver — ${restaurant.name}`}</title>
      {header}

      <div className="container-page grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <form noValidate onSubmit={handleSubmit} className="order-2 rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8 lg:order-1">
          {(errorEntries.length > 0 || formError) && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/5 p-4">
              <p className="font-bold text-danger">{formError ?? 'Veuillez corriger les champs suivants :'}</p>
              {errorEntries.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {errorEntries.map(([field, message]) => (
                    <li key={field}><a href={`#${field}`} className="underline">{LABELS[field] ?? field}</a> : {message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <FormSection title="Vos coordonnées">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="customerName">Nom</Label>
                <input {...fieldProps('customerName')} type="text" autoComplete="name" maxLength={100}
                  value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
                {fieldError('customerName')}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78"
                  value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                {fieldError('phone')}
              </div>
            </div>
          </FormSection>

          <FormSection title="Votre événement">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <input {...fieldProps('date')} type="date" min={today} value={form.date} onChange={(e) => update('date', e.target.value)} />
                {fieldError('date')}
              </div>
              <div>
                <Label htmlFor="time">Heure</Label>
                <input {...fieldProps('time')} type="time" step={900} value={form.time} onChange={(e) => update('time', e.target.value)} />
                {fieldError('time')}
              </div>
            </div>

            <fieldset className="mt-5" aria-describedby={errors.city ? 'city-error' : undefined}>
              <legend className="font-semibold">Ville <Required /></legend>
              <div id="city" tabIndex={-1} className="mt-1.5 grid grid-cols-2 gap-3">
                {CITIES.map((city) => (
                  <label key={city.value} className={chipClass(form.city === city.value)}>
                    <input type="radio" name="city" value={city.value} className="sr-only" checked={form.city === city.value}
                      onChange={() => update('city', city.value)} />
                    {city.label}
                  </label>
                ))}
              </div>
              {fieldError('city')}
            </fieldset>

            <div className="mt-5">
              <Label htmlFor="address">Adresse du lieu</Label>
              <input {...fieldProps('address')} type="text" autoComplete="street-address" maxLength={255} placeholder="Ex. Villa 12, rue des Palmiers, Anfa"
                value={form.address} onChange={(e) => update('address', e.target.value)} />
              {fieldError('address')}
            </div>

            <fieldset className="mt-5" aria-describedby={errors.numberOfPeople ? 'numberOfPeople-error' : undefined}>
              <legend className="font-semibold">Nombre d'invités <Required /></legend>
              <div className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[...GUEST_RANGES, { value: 'exact' as const, label: 'Nombre exact' }].map((option) => (
                  <label key={option.value} className={chipClass(form.guests === option.value)}>
                    <input type="radio" name="guests" value={option.value} className="sr-only" checked={form.guests === option.value}
                      onChange={() => update('guests', option.value)} />
                    {option.label}
                  </label>
                ))}
              </div>
              {form.guests === 'exact' && (
                <div className="mt-3 max-w-48">
                  <label htmlFor="numberOfPeople" className="text-sm font-semibold">Combien d'invités ?</label>
                  <input {...fieldProps('numberOfPeople')} type="number" inputMode="numeric" min={1} max={2000}
                    value={form.exactGuests} onChange={(e) => update('exactGuests', e.target.value)} />
                </div>
              )}
              {fieldError('numberOfPeople')}
            </fieldset>

            <div className="mt-5">
              <label htmlFor="notes" className="font-semibold">Message <span className="font-normal text-muted">(facultatif)</span></label>
              <textarea {...fieldProps('notes')} rows={3} maxLength={1000} placeholder="Type d'événement, allergies, questions…"
                className={`${inputClass(false)} py-3`} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>
          </FormSection>

          {fieldError('items')}
          <button type="submit" disabled={submitting}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
            {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
          <p className="mt-3 text-center text-sm text-muted">Aucun paiement en ligne : nous vous recontactons pour confirmer.</p>
        </form>

        {/* Récapitulatif de la sélection */}
        <aside aria-labelledby="recap-title" className="order-1 rounded-card bg-foreground p-6 text-white shadow-card lg:sticky lg:top-24 lg:order-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recap-title" className="text-2xl font-bold">{pack.name}</h2>
            <Link to="/packs" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-white/80 hover:text-white">
              <Pencil className="size-4" aria-hidden="true" /> Modifier
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {summary.items.map(({ pizza, quantity }) => (
              <li key={pizza.id} className="flex justify-between gap-3 border-b border-white/10 pb-2">
                <span>{pizza.name}</span>
                <span className="font-bold tabular-nums">× {quantity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between text-white/80">
            <span>{summary.totalPizzas} pizzas × {formatPrice(pack.price)}</span>
          </p>
          <p className="mt-1 flex items-baseline justify-between">
            <span className="font-semibold">Total estimé</span>
            <span className="font-display text-3xl font-bold tabular-nums">{formatPrice(String(summary.estimatedTotal))}</span>
          </p>
          <p className="mt-3 text-sm text-white/70">Le prix final vous est confirmé par téléphone.</p>
          {form.guests && form.guests !== 'exact' && (
            <p className="mt-2 text-sm text-white/70">{guestsLabel({ guestRange: form.guests, numberOfPeople: null })}</p>
          )}
        </aside>
      </div>
    </>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border pb-6 pt-2 last-of-type:border-0 [&+&]:pt-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Required() {
  return <span aria-hidden="true" className="text-danger">*</span>
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="font-semibold">{children} <Required /></label>
}
