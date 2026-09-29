import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PackFormPage } from './pages/PackFormPage'
import { PizzaFormPage } from './pages/PizzaFormPage'
import { ReservationDetailPage } from './pages/ReservationDetailPage'
import { ReservationsPage } from './pages/ReservationsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/:id" element={<ReservationDetailPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="menu/new" element={<PizzaFormPage />} />
              <Route path="menu/:id" element={<PizzaFormPage />} />
              <Route path="menu/packs/new" element={<PackFormPage />} />
              <Route path="menu/packs/:id" element={<PackFormPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
