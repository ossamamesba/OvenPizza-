import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { OrderProvider } from './order/OrderProvider'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PacksPage } from './pages/PacksPage'
import { ReservationPage } from './pages/ReservationPage'

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
