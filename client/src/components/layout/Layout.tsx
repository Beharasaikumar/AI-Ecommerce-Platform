import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Package, ShoppingCart,
    CreditCard, Warehouse, Bot,
    Menu, X, ChevronRight, Search,
    Tag
} from 'lucide-react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { authStore } from '@/lib/authStore'
import { LogOut } from 'lucide-react'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Tag, label: 'Categories', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Warehouse, label: 'Inventory', path: '/admin/inventory' },
    { icon: Bot, label: 'AI Assistant', path: '/admin/ai' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [search, setSearch] = useState('')
    const location = useLocation()
    const navigate = useNavigate()

    const handleSearch = (e: any) => {
        if (e.key === 'Enter' && search.trim()) {
            navigate(`/shop?category=${search}`)
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            <aside className={cn(
                "flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
                sidebarOpen ? "w-60" : "w-16"
            )}>

                <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                        <Package className="w-4 h-4 text-white" />
                    </div>

                    {sidebarOpen && (
                        <div>
                            <p className="text-sm font-semibold text-slate-800">ShopMicro</p>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ icon: Icon, label, path }) => {
                        const active = location.pathname === path
                        return (
                            <Link key={path} to={path}>
                                <div
                                    title={!sidebarOpen ? label : ''}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        active
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {sidebarOpen && (
                                        <>
                                            <span className="flex-1">{label}</span>
                                            {active && <ChevronRight className="w-3 h-3" />}
                                        </>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-3 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                A
                            </AvatarFallback>
                        </Avatar>

                        {sidebarOpen && (
                            <div>
                                <p className="text-xs font-medium">Admin User</p>
                                <p className="text-xs text-slate-400">admin@shop.com</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => authStore.logout()}
                        className="flex items-center gap-3 px-2 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && <span className="text-xs">Sign Out</span>}
                    </button>
                </div>
            </aside>

            <div className="flex flex-col flex-1">

                <header className="flex items-center justify-between gap-4 px-6 h-16 bg-white border-b border-slate-200">

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </Button>

                    <div className="flex items-center justify-evenly max-w-full w-96 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            />
                        </div>
                        <Badge className="bg-green-50 text-green-600 border-green-200 text-xs">
                            Active
                        </Badge>
                    </div>

                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>

            </div>
        </div>
    )
}