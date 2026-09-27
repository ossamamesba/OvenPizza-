import { useMemo, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ApiError } from '../api/client'
import { createReservation } from '../api/reservations'
import { ButtonLink } from '../components/ButtonLink'
import { PageHeader } from '../components/PageHeader'
import { isClosedOn, reservationSlots, restaurant } from '../config/restaurant'
import { formatDate, toIsoDate } from '@shared/lib/format'
import type { Reservation, ReservationInput } from '@shared/api/types'

type Field = keyof ReservationInput
type Errors = Partial<Record<Field, string>>

const LABELS: Record<Field, string> = {
  customerName: 'Nom',
  phone: 'Téléphone',
  date: 'Date',
  time: 'Heure',
  numberOfPeople: 'Nombre de personnes',
}
const PHONE_PATTERN = /^\+?[0-9 ]{8,20}$/ // identique à la validation du backend

function validate(form: ReservationInput): Errors {
  const errors: Errors = {}
  if (!form.customerName.trim()) errors.customerName = 'Indiquez votre nom.'
  if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Numéro invalide (ex. 06 12 34 56 78).'
  if (!form.date) errors.date = 'Choisissez une date.'
  if (!form.time) errors.time = 'Choisissez une heure.'
  if (form.numberOfPeople < 1 || form.numberOfPeople > restaurant.reservation.maxPeople) {
    errors.numberOfPeople = `Entre 1 et ${restaurant.reservation.maxPeople} personnes.`
  }
  return errors
}

const inputClass = (invalid: boolean) =>
  `mt-1.5 block min-h-12 w-full rounded-xl border bg-surface px-4 text-base ${invalid ? 'border-danger' : 'border-border'} focus:border-primary`

export function ReservationPage() {
  const today = toIsoDate(new Date())
  const [form, setForm] = useState<ReservationInput>({ customerName: '', phone: '', date: today, time: '', numberOfPeople: 2 })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<Reservation | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const slots = useMemo(() => reservationSlots(form.date), [form.date])

  const update = <K extends Field>(field: K, value: ReservationInput[K]) => {
    setForm((f) => ({ ...f, [field]: value, ...(field === 'date' ? { time: '' } : {}) }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const clientErrors = validate(form)
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setSubmitting(true)
    try {
      setConfirmed(await createReservation({ ...form, customerName: form.customerName.trim(), phone: form.phone.trim() }))
      window.scrollTo(0, 0)
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.violations).length > 0) {
        setErrors(Object.fromEntries(Object.entries(error.violations).map(([field, messages]) => [field, messages[0]])))
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
            Merci {confirmed.customerName}. Votre demande pour <strong>{confirmed.numberOfPeople} personne(s)</strong> le{' '}
            <strong>{formatDate(confirmed.date)}</strong>{' '}
            à <strong>{confirmed.time}</strong> est en attente de confirmation. Le restaurant vous contactera au {confirmed.phone}.
          </p>
          <ButtonLink to="/" variant="outline" className="mt-8">Retour à l'accueil</ButtonLink>
        </div>
      </div>
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
      <title>{`Réserver une table — ${restaurant.name}`}</title>
      <PageHeader title="Réserver une table" intro="Remplissez le formulaire : le restaurant confirme votre réservation par téléphone." />

      <div className="container-page max-w-2xl">
        <form noValidate onSubmit={handleSubmit} className="rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
          {(errorEntries.length > 0 || formError) && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/5 p-4">
              <p className="font-bold text-danger">{formError ?? 'Veuillez corriger les champs suivants :'}</p>
              {errorEntries.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {errorEntries.map(([field, message]) => (
                    <li key={field}>
                      <a href={`#${field}`} className="underline">{LABELS[field] ?? field}</a> : {message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customerName" className="font-semibold">Nom <span aria-hidden="true" className="text-danger">*</span></label>
              <input {...fieldProps('customerName')} type="text" autoComplete="name" required maxLength={100}
                value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
              {fieldError('customerName')}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="font-semibold">Téléphone <span aria-hidden="true" className="text-danger">*</span></label>
              <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" required placeholder="06 12 34 56 78"
                value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              {fieldError('phone')}
            </div>

            <div>
              <label htmlFor="date" className="font-semibold">Date <span aria-hidden="true" className="text-danger">*</span></label>
              <input {...fieldProps('date')} type="date" required min={today}
                value={form.date} onChange={(e) => update('date', e.target.value)} />
              {fieldError('date')}
            </div>

            <div>
              <label htmlFor="time" className="font-semibold">Heure <span aria-hidden="true" className="text-danger">*</span></label>
              <select {...fieldProps('time')} required value={form.time} disabled={slots.length === 0}
                onChange={(e) => update('time', e.target.value)}>
                <option value="">
                  {slots.length > 0 ? 'Choisir…' : isClosedOn(form.date) ? 'Fermé ce jour-là' : 'Plus de créneau ce jour-là'}
                </option>
                {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
              {fieldError('time')}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="numberOfPeople" className="font-semibold">Nombre de personnes <span aria-hidden="true" className="text-danger">*</span></label>
              <select {...fieldProps('numberOfPeople')} value={form.numberOfPeople}
                onChange={(e) => update('numberOfPeople', Number(e.target.value))}>
                {Array.from({ length: restaurant.reservation.maxPeople }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>
                ))}
              </select>
              {fieldError('numberOfPeople')}
            </div>
          </div>

          <p className="mt-5 text-sm text-muted"><span aria-hidden="true" className="text-danger">*</span> Champs obligatoires</p>

          <button type="submit" disabled={submitting}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
            {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    </>
  )
}
