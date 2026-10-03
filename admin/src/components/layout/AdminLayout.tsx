import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarCheck, LayoutDashboard, LogOut, Package, Pizza } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'

const links = [
  { to: '/', label: 'Tableau de bord', short: 'Accueil', Icon: LayoutDashboard },
  { to: '/reservations', label: 'Réservations', short: 'Réservations', Icon: CalendarCheck },
  { to: '/packs', label: 'Packs', short: 'Packs', Icon: Package },
  { to: '/menu', label: 'Pizzas', short: 'Pizzas', Icon: Pizza },
]

/** Ordinateur : barre latérale. Téléphone : barre du haut + navigation en bas de l'écran. */
export function AdminLayout() {
  const { state, logout } = useAuth()
  const email = state.status === 'authenticated' ? state.user.email : ''
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="min-h-dvh lg:flex">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        Aller au contenu
      </a>

      {/* Barre latérale (ordinateur) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-foreground text-white lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Brand />
        <nav aria-label="Navigation du dashboard" className="flex-1 px-3">
          <ul className="space-y-1">
            {links.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-xl px-4 font-semibold transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  <Icon className="size-5" aria-hidden="true" /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm text-white/70" title={email}>{email}</p>
          <button type="button" onClick={logout} className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 font-semibold text-white/85 hover:bg-white/10">
            <LogOut className="size-5" aria-hidden="true" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Barre du haut (téléphone / tablette) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-foreground px-4 text-white lg:hidden">
        <Brand compact />
        <button type="button" onClick={logout} className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-white/10">
          <LogOut className="size-4" aria-hidden="true" /> Déconnexion
        </button>
      </header>

      <main id="contenu" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-6 outline-none md:px-8 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Navigation du bas (téléphone / tablette) */}
      <nav aria-label="Navigation du dashboard" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-4">
          {links.map(({ to, short, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted'}`
                }
              >
                <Icon className="size-6" aria-hidden="true" /> {short}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`flex items-center gap-2 font-display font-bold ${compact ? 'text-base' : 'px-6 py-6 text-lg'}`}>
      <img src="/logo.webp" alt="" className={`${compact ? 'size-8' : 'size-11'} rounded-full`} />
      <span>
        Oven&rsquo;s Pizza <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-white/60">Dashboard</span>
      </span>
    </p>
  )
}
