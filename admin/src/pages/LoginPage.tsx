import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'
import { Button } from '../components/ui/Button'

const inputClass = 'mt-1.5 block min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base focus:border-primary'

export function LoginPage() {
  const { state, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (state.status === 'authenticated') return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Connexion impossible.')
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-foreground px-4 py-10">
      <title>Connexion — Dashboard Oven's Pizza</title>
      <div className="w-full max-w-sm rounded-card bg-surface p-8 shadow-card">
        <img src="/logo.webp" alt="Oven's Pizza Party" className="mx-auto size-24 rounded-full" />
        <h1 className="mt-4 text-center text-2xl font-bold">Espace patron</h1>
        <p className="mt-1 text-center text-muted">Oven&rsquo;s Pizza Party</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p role="alert" className="rounded-xl bg-danger/10 p-3 text-center font-semibold text-danger">{error}</p>}
          <div>
            <label htmlFor="email" className="font-semibold">Email</label>
            <input id="email" type="email" autoComplete="username" required value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="font-semibold">Mot de passe</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword}
                className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-foreground">
                {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={submitting} className="w-full">Se connecter</Button>
        </form>
      </div>
    </main>
  )
}
