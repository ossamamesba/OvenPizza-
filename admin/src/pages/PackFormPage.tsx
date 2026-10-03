import { useCallback, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import type { AdminPack } from '@shared/api/types'
import { createPack, deletePack, getPack, updatePack } from '../api/admin'
import { useAsync } from '../hooks/useAsync'
import { ApiError } from '../lib/api'
import { PageTitle } from '../components/PageTitle'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { Switch } from '../components/ui/Switch'

type Field = 'name' | 'description' | 'price' | 'maxVarieties' | 'position'
type Errors = Partial<Record<Field, string>>

const inputClass = (invalid: boolean) =>
  `mt-1.5 block min-h-12 w-full rounded-xl border bg-surface px-4 text-base ${invalid ? 'border-danger' : 'border-border'} focus:border-primary`

/** /packs/new : ajout — /packs/:id : modification (nom, prix par pizza, variétés, visibilité). */
export function PackFormPage() {
  const { id } = useParams()
  const packId = id ? Number(id) : null
  const load = useCallback((signal: AbortSignal) => (packId ? getPack(packId, signal) : Promise.resolve(null)), [packId])
  const { data, error, loading, reload } = useAsync(load)

  return (
    <>
      <Link to="/packs" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Packs
      </Link>
      <PageTitle title={packId ? 'Modifier le pack' : 'Ajouter un pack'} />
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && <Spinner />}
      {!loading && !error && <PackForm key={data?.id ?? 'new'} pack={data ?? null} />}
    </>
  )
}

function PackForm({ pack }: { pack: AdminPack | null }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: pack?.name ?? '',
    description: pack?.description ?? '',
    price: pack?.price ?? '',
    maxVarieties: String(pack?.maxVarieties ?? 3),
    position: String(pack?.position ?? 0),
    isActive: pack?.isActive ?? true,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Indiquez le nom du pack.'
    if (!/^\d{1,6}([.,]\d{1,2})?$/.test(String(form.price).trim())) e.price = 'Prix invalide (ex. 100 ou 99,50).'
    if (!(Number(form.maxVarieties) >= 1 && Number(form.maxVarieties) <= 20)) e.maxVarieties = 'Entre 1 et 20.'
    setErrors(e)
    setFormError(null)
    if (Object.keys(e).length > 0) return

    setSaving(true)
    const input = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: String(form.price).trim().replace(',', '.'),
      maxVarieties: Number(form.maxVarieties),
      position: Number(form.position) || 0,
      isActive: form.isActive,
    }
    try {
      if (pack) await updatePack(pack.id, input)
      else await createPack(input)
      navigate('/packs', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.violations).length > 0) {
        setErrors(Object.fromEntries(Object.entries(err.violations).map(([field, messages]) => [field, messages[0]])))
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Enregistrement impossible.')
      }
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!pack) return
    setDeleting(true)
    try {
      await deletePack(pack.id)
      navigate('/packs', { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Suppression impossible.')
      setConfirmDelete(false)
      setDeleting(false)
    }
  }

  const fieldError = (field: Field) =>
    errors[field] && <p id={`${field}-error`} className="mt-1.5 text-sm font-semibold text-danger">{errors[field]}</p>
  const aria = (field: Field) => ({ 'aria-invalid': !!errors[field] || undefined, 'aria-describedby': errors[field] ? `${field}-error` : undefined })

  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
      {formError && <p role="alert" className="rounded-xl bg-danger/10 p-3 font-semibold text-danger">{formError}</p>}
      <div>
        <label htmlFor="name" className="font-semibold">Nom <span aria-hidden="true" className="text-danger">*</span></label>
        <input id="name" type="text" maxLength={100} value={form.name} {...aria('name')} onChange={(e) => update('name', e.target.value)} className={inputClass(!!errors.name)} />
        {fieldError('name')}
      </div>
      <div>
        <label htmlFor="description" className="font-semibold">Description</label>
        <textarea id="description" rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} className={`${inputClass(false)} py-3`} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="font-semibold">Prix par pizza (DH) <span aria-hidden="true" className="text-danger">*</span></label>
          <input id="price" type="text" inputMode="decimal" value={form.price} {...aria('price')} onChange={(e) => update('price', e.target.value)} className={inputClass(!!errors.price)} />
          {fieldError('price')}
        </div>
        <div>
          <label htmlFor="maxVarieties" className="font-semibold">Variétés max.</label>
          <input id="maxVarieties" type="number" inputMode="numeric" min={1} max={20} value={form.maxVarieties} {...aria('maxVarieties')}
            onChange={(e) => update('maxVarieties', e.target.value)} className={inputClass(!!errors.maxVarieties)} />
          {fieldError('maxVarieties')}
        </div>
        <div>
          <label htmlFor="position" className="font-semibold">Ordre d'affichage</label>
          <input id="position" type="number" inputMode="numeric" value={form.position} onChange={(e) => update('position', e.target.value)} className={inputClass(false)} />
        </div>
      </div>
      <Switch checked={form.isActive} onChange={(v) => update('isActive', v)} label="Visible sur le site" showLabel />

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
        {pack ? (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden="true" /> Supprimer le pack
          </Button>
        ) : <span />}
        <Button type="submit" loading={saving}>{pack ? 'Enregistrer' : 'Ajouter le pack'}</Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce pack ?"
        message="Ses pizzas resteront dans le menu, sans pack (elles ne seront plus proposées aux clients). Les réservations existantes gardent leur détail. Pour le cacher temporairement, désactivez plutôt « Visible sur le site »."
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
