import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Reset password</h1>
          <p className="text-sm text-slate-500">
            Enter your email and we'll send reset instructions
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Check your email</p>
                  <p className="text-sm text-slate-500 mt-1">
                    We've sent reset instructions to <span className="font-medium text-slate-700">{email}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    (This is a demo — no actual email is sent)
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email address</Label>
                  <Input
                    type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="h-11 rounded-xl" autoFocus
                  />
                </div>
                <Button type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                  disabled={loading || !email}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!sent && (
          <p className="text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}