import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '@/lib/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [showPw,  setShowPw]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    try {
      const user = await authStore.login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your ShopMicro account</p>
        </div>

        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="h-11 rounded-xl"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="h-11 rounded-xl pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : 'Sign In'}
              </Button>
            </form>

            {/* Demo accounts hint */}
            <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-2">Demo accounts:</p>
              <div className="space-y-1">
                <button
                  onClick={() => setForm({ email: 'admin@shop.com', password: 'admin123' })}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-white transition-colors flex justify-between"
                >
                  <span className="text-slate-600">👑 Admin</span>
                  <span className="text-slate-400 font-mono">admin@shop.com / admin123</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}