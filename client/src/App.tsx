import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'

import { RequireAuth, RequireAdmin, RedirectIfLoggedIn } from '@/components/auth/ProtectedRoute'

import AdminLayout from '@/components/layout/Layout'
import Dashboard from '@/pages/admin/Dashboard'
import Products from '@/pages/admin/Products'
import Orders from '@/pages/admin/Orders'
import Payments from '@/pages/admin/Payments'
import Inventory from '@/pages/admin/Inventory'
import AIAssistant from '@/pages/admin/AIAssistant'

import StoreLayout from '@/components/layout/StoreLayout'
import Home from '@/pages/store/Home'
import Shop from '@/pages/store/Shop'
import Cart from '@/pages/store/Cart'
import Checkout from '@/pages/store/Checkout'
import MyOrders from '@/pages/store/MyOrders'
import AIChat from '@/pages/store/AIChat'
import Categories from './pages/admin/Categories'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={<RequireAdmin><AdminLayout><Dashboard /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/products" element={<RequireAdmin><AdminLayout><Products /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/orders" element={<RequireAdmin><AdminLayout><Orders /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/payments" element={<RequireAdmin><AdminLayout><Payments /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/inventory" element={<RequireAdmin><AdminLayout><Inventory /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/categories" element={<RequireAdmin><AdminLayout><Categories /></AdminLayout></RequireAdmin>} />
        <Route path="/admin/ai" element={<RequireAdmin><AdminLayout><AIAssistant /></AdminLayout></RequireAdmin>} />

        <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
        <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
        <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />

        <Route path="/checkout" element={<RequireAuth><StoreLayout><Checkout /></StoreLayout></RequireAuth>} />
        <Route path="/my-orders" element={<RequireAuth><StoreLayout><MyOrders /></StoreLayout></RequireAuth>} />
        <Route path="/ai-chat" element={<RequireAuth><StoreLayout><AIChat /></StoreLayout></RequireAuth>} />

      </Routes>
    </BrowserRouter>
  )
}