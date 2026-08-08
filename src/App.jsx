import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Login from './pages/Login'

import AdminLayout from './pages/admin/AdminLayout'
import Inventory from './pages/admin/Inventory'
import GalleryAdmin from './pages/admin/GalleryAdmin'
import Invoice from './pages/admin/Invoice'
import GstInvoice from './pages/admin/GstInvoice'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Inventory />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="gst-invoice" element={<GstInvoice />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-serif font-bold text-rose-800 mb-4">404</h1>
      <p className="text-stone-500 mb-6">This page doesn't exist.</p>
      <a href="/" className="text-rose-800 font-bold uppercase text-xs tracking-widest underline">
        Back to Home
      </a>
    </div>
  )
}
