import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { OrderProvider } from './order/OrderProvider'
import { HomePage } from './pages/HomePage'

// L'accueil est inclus d'office ; les autres pages ne sont téléchargées qu'à la première visite.
const PacksPage = lazy(() => import('./pages/PacksPage').then((m) => ({ default: m.PacksPage })))
const ReservationPage = lazy(() => import('./pages/ReservationPage').then((m) => ({ default: m.ReservationPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="packs" element={<PacksPage />} />
            <Route path="reservation" element={<ReservationPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Anciennes adresses (avant le passage en traiteur) */}
            <Route path="menu" element={<Navigate to="/packs" replace />} />
            <Route path="infos" element={<Navigate to="/contact" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  )
}
