import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '../Logo'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/menu', label: 'Menu' },
  { to: '/infos', label: 'Infos & horaires' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 font-semibold transition-colors ${isActive ? 'bg-accent-soft text-primary' : 'hover:text-primary'}`

export function Header() {
  const { pathname } = useLocation()
  // Le menu mobile est lié à la page où il a été ouvert : il se referme donc tout seul en changeant de page.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" aria-label="Oven's Pizza Party — accueil">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/reservation"
            className="ml-2 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Réserver
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Navigation principale" className="border-t border-border md:hidden">
          <ul className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end className={({ isActive }) => `block min-h-11 ${navLinkClass({ isActive })}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/reservation"
                className="flex min-h-12 items-center justify-center rounded-full bg-primary font-semibold text-on-primary"
              >
                Réserver une table
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
