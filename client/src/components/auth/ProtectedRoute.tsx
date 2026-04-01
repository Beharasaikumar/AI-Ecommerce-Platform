import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/authStore'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdmin)    return <Navigate to="/" replace />
  return <>{children}</>
}

export function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (isLoggedIn) return <Navigate to={isAdmin ? '/admin' : '/'} replace />
  return <>{children}</>
}