import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, Search, Menu, X, Bot, LogOut, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCart } from '@/lib/cartStore'
import { useAuth } from '@/lib/authStore'
import { cn } from '@/lib/utils'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'My Orders', path: '/my-orders' },
    { label: 'AI Chat', path: '/ai-chat' },
]

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { items } = useCart()
    const { user, isLoggedIn, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [search, setSearch] = useState('')
    const cartCount = items.reduce((s, i) => s + i.quantity, 0)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg hidden sm:block">ShopMicro</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 ml-4">
                        {navLinks.map(({ label, path }) => (
                            <Link key={path} to={path}>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                    location.pathname === path
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}>
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto hidden sm:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm rounded-xl"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-2 ml-auto">

                        <Link to="/cart">
                            <Button variant="outline" size="sm" className="relative gap-2 border-slate-200 rounded-xl">
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                                        <Avatar className="w-7 h-7">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-24 truncate">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white border-slate-200 shadow-md">
                                    <div className="px-3 py-2 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link to="/my-orders" className="flex items-center gap-2 cursor-pointer">
                                            <Package className="w-4 h-4" /> My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/ai-chat" className="flex items-center gap-2 cursor-pointer">
                                            <Bot className="w-4 h-4" /> AI Assistant
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="text-slate-600 rounded-xl">Sign in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">Register</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu toggle */}
                        <Button variant="ghost" size="icon" className="md:hidden rounded-xl"
                            onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                        {navLinks.map(({ label, path }) => (
                            <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                                <div className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium",
                                    location.pathname === path ? "bg-blue-50 text-blue-700" : "text-slate-600"
                                )}>{label}</div>
                            </Link>
                        ))}
                        {!isLoggedIn && (
                            <div className="flex gap-2 pt-2">
                                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-xl border-slate-200">Sign in</Button>
                                </Link>
                                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Page content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                            <Package className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">ShopMicro</span>
                    </div>
                    <p className="text-xs text-slate-400">AI Microservices E-Commerce · College Demo</p>
                </div>
            </footer>
        </div>
    )
}