import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // À chaque changement de page : retour en haut + focus sur le contenu (lecteurs d'écran).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {/* Pages chargées à la demande (voir App.tsx) : message bref le temps du premier téléchargement */}
        <Suspense fallback={<p role="status" className="py-24 text-center text-muted">Chargement…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
