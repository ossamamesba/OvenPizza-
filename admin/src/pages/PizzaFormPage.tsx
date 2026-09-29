import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react'
import type { AdminPack, AdminPizza, PizzaInput } from '@shared/api/types'
import { createPizza, deletePizzaImage, getPizza, listPacks, updatePizza, uploadPizzaImage } from '../api/admin'
import { formatPrice } from '@shared/lib/format'
import { useAsync } from '../hooks/useAsync'
import { ApiError } from '../lib/api'
import { PageTitle } from '../components/PageTitle'
import { PizzaThumb } from '../components/PizzaThumb'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { Switch } from '../components/ui/Switch'

type Field = 'name' | 'description' | 'packId' | 'image'
type Errors = Partial<Record<Field, string>>

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const inputClass = (invalid: boolean) =>
  `mt-1.5 block min-h-12 w-full rounded-xl border bg-surface px-4 text-base ${invalid ? 'border-danger' : 'border-border'} focus:border-primary`

/** /menu/new : ajout — /menu/:id : modification. */
export function PizzaFormPage() {
  const { id } = useParams()
  const pizzaId = id ? Number(id) : null
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [pizza, packs] = await Promise.all([pizzaId ? getPizza(pizzaId, signal) : Promise.resolve(null), listPacks(signal)])
      return { pizza, packs }
    },
    [pizzaId],
  )
  const { data, error, loading, reload } = useAsync(load)

  return (
    <>
      <Link to="/menu" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Menu
      </Link>
      <PageTitle title={pizzaId ? 'Modifier la pizza' : 'Ajouter une pizza'} />
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && <Spinner />}
      {!loading && !error && data && <PizzaForm key={data.pizza?.id ?? 'new'} pizza={data.pizza} packs={data.packs} />}
    </>
  )
}

function PizzaForm({ pizza, packs }: { pizza: AdminPizza | null; packs: AdminPack[] }) {
  const navigate = useNavigate()
  const [form, setForm] = useState<PizzaInput>({
    name: pizza?.name ?? '',
    description: pizza?.description ?? '',
    isAvailable: pizza?.isAvailable ?? true,
    packId: pizza ? pizza.packId : (packs[0]?.id ?? null),
  })
  const [image, setImage] = useState<string | null>(pizza?.image ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Aperçu local de la photo choisie (libéré quand elle change).
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const update = <K extends keyof PizzaInput>(field: K, value: PizzaInput[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function chooseFile(selected: File | undefined) {
    setErrors((e) => ({ ...e, image: undefined }))
    if (!selected) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setErrors((e) => ({ ...e, image: 'Formats acceptés : JPG, PNG ou WebP.' }))
      return
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, image: 'Image trop lourde (5 Mo maximum).' }))
      return
    }
    setFile(selected)
    setRemoveImage(false)
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Indiquez le nom de la pizza.'
    return e
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const clientErrors = validate()
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return

    setSaving(true)
    const input: PizzaInput = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      isAvailable: form.isAvailable,
      packId: form.packId,
    }
    try {
      let saved = pizza ? await updatePizza(pizza.id, input) : await createPizza(input)
      // La photo est envoyée après l'enregistrement (elle a besoin de l'identifiant de la pizza).
      if (file) saved = await uploadPizzaImage(saved.id, file)
      else if (removeImage && image) saved = await deletePizzaImage(saved.id)
      setImage(saved.image)
      navigate('/menu', { replace: true })
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.violations).length > 0) {
        setErrors(Object.fromEntries(Object.entries(e.violations).map(([field, messages]) => [field, messages[0]])))
      } else {
        setFormError(e instanceof ApiError ? e.message : 'Enregistrement impossible.')
      }
      setSaving(false)
    }
  }

  const describedBy = (field: Field) => (errors[field] ? `${field}-error` : undefined)
  const fieldError = (field: Field) =>
    errors[field] && <p id={`${field}-error`} className="mt-1.5 text-sm font-semibold text-danger">{errors[field]}</p>
  const shownImage = removeImage ? null : image

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-5 rounded-card bg-surface p-6 shadow-card ring-1 ring-border md:p-8">
        {formError && <p role="alert" className="rounded-xl bg-danger/10 p-3 font-semibold text-danger">{formError}</p>}
        <div>
          <label htmlFor="name" className="font-semibold">Nom <span aria-hidden="true" className="text-danger">*</span></label>
          <input id="name" type="text" maxLength={100} required value={form.name} aria-invalid={!!errors.name || undefined} aria-describedby={describedBy('name')}
            onChange={(e) => update('name', e.target.value)} className={inputClass(!!errors.name)} />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="description" className="font-semibold">Description</label>
          <textarea id="description" rows={3} value={form.description ?? ''} aria-describedby="description-help"
            onChange={(e) => update('description', e.target.value)} className={`${inputClass(false)} py-3`} />
          <p id="description-help" className="mt-1.5 text-sm text-muted">Les ingrédients principaux, affichés sur le site.</p>
        </div>
        <div className="max-w-sm">
          <label htmlFor="packId" className="font-semibold">Pack</label>
          <select id="packId" value={form.packId ?? ''} aria-invalid={!!errors.packId || undefined} aria-describedby={describedBy('packId') ?? 'packId-help'}
            onChange={(e) => update('packId', e.target.value ? Number(e.target.value) : null)} className={inputClass(!!errors.packId)}>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>{pack.name} ({formatPrice(pack.price)} / pizza)</option>
            ))}
            <option value="">Aucun pack (non proposée aux clients)</option>
          </select>
          <p id="packId-help" className="mt-1.5 text-sm text-muted">Le prix de la pizza est celui de son pack.</p>
          {fieldError('packId')}
        </div>
        <Switch checked={form.isAvailable} onChange={(v) => update('isAvailable', v)} label="Disponible sur le site" showLabel />
      </div>

      <div className="space-y-4">
        <div className="rounded-card bg-surface p-6 shadow-card ring-1 ring-border">
          <p className="font-semibold">Photo</p>
          <div className="mt-3">
            {preview && file ? (
              <img src={preview} alt="Aperçu de la nouvelle photo" className="aspect-[4/3] w-full rounded-xl object-cover" />
            ) : (
              <PizzaThumb image={shownImage} className="aspect-[4/3] w-full" />
            )}
          </div>
          <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold ring-1 ring-border hover:ring-foreground/30 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
            <ImagePlus className="size-5" aria-hidden="true" /> {shownImage || file ? 'Changer la photo' : 'Choisir une photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-describedby={describedBy('image') ?? 'image-help'}
              onChange={(e) => chooseFile(e.target.files?.[0])} />
          </label>
          {(shownImage || file) && (
            <Button variant="ghost" size="sm" className="mt-2 w-full text-danger" onClick={() => { setFile(null); setRemoveImage(true) }}>
              <Trash2 className="size-4" aria-hidden="true" /> Retirer la photo
            </Button>
          )}
          <p id="image-help" className="mt-2 text-sm text-muted">JPG, PNG ou WebP, 5 Mo max.</p>
          {fieldError('image')}
        </div>
        <Button type="submit" loading={saving} className="w-full">{pizza ? 'Enregistrer' : 'Ajouter la pizza'}</Button>
        <Link to="/menu" className="flex min-h-11 items-center justify-center font-semibold text-muted hover:text-foreground">Annuler</Link>
      </div>
    </form>
  )
}
