import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '@/lib/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPw, setShowPw] = useState(false)

    const passwordStrength = (pw: string) => {
        if (pw.length === 0) return null
        if (pw.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' }
        if (pw.length < 8) return { label: 'Weak', color: 'bg-amber-400', width: '50%' }
        if (!/[0-9]/.test(pw)) return { label: 'Add numbers', color: 'bg-amber-400', width: '60%' }
        return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
    }
    const strength = passwordStrength(form.password)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return }
        if (form.password !== form.confirm) { setError('Passwords do not match'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true); setError('')
        try {
            await authStore.register(form.name, form.email, form.password)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">

                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
                    <p className="text-sm text-slate-500">Join ShopMicro today</p>
                </div>

                <Card className="border-slate-200 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleRegister} className="space-y-4">

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Full Name</Label>
                                <Input placeholder="Arjun Sharma" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="h-11 rounded-xl" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Email</Label>
                                <Input type="email" placeholder="arjun@example.com" value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="h-11 rounded-xl" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="h-11 rounded-xl pr-10"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="space-y-1">
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${strength.color}`}
                                                style={{ width: strength.width }} />
                                        </div>
                                        <p className="text-xs text-slate-400">{strength.label}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        type="password" placeholder="Repeat password"
                                        value={form.confirm}
                                        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                                        className="h-11 rounded-xl pr-8"
                                    />
                                    {form.confirm && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {form.password === form.confirm
                                                ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                : <AlertCircle className="w-4 h-4 text-red-400" />
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                                disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : 'Create Account'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}