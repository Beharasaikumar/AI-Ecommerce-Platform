import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '@/lib/api'
import { useCart } from '@/lib/cartStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, Shield, Truck, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Home() {
    const [featured, setFeatured] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [added, setAdded] = useState<Record<number, boolean>>({})
    const { addItem, items, updateQty } = useCart()
    const navigate = useNavigate()

    useEffect(() => {
        productApi.getAll().then(r => setFeatured((r.data.data || []).slice(0, 4)))
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
    }

    const handleAdd = (p: any) => {
        addItem(p)
        setAdded(a => ({ ...a, [p.id]: true }))
        setTimeout(() => setAdded(a => ({ ...a, [p.id]: false })), 1500)
    }

    return (
        <div className="space-y-14">

            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 shadow-xl">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent)]" />

                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center px-8 md:px-14 py-16">

                    <div className="text-white max-w-xl">
                        <Badge className="bg-white/20 text-white border-0 backdrop-blur mb-4">
                            AI Shopping Experience
                        </Badge>

                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                            Smarter Shopping <br />
                            <span className="text-blue-200">Powered by AI</span>
                        </h1>

                        <p className="text-blue-100 text-lg mb-6">
                            Discover products tailored to your needs. Faster, smarter, better.
                        </p>

                        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                            <Input
                                placeholder="Search for anything..."
                                className="h-12 rounded-xl border-0 bg-white text-gray-800 placeholder:text-gray-400 shadow-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <Button className="h-12 px-6 bg-white text-blue-700 font-semibold shadow">
                                Search
                            </Button>
                        </form>

                        <div className="flex gap-3 flex-wrap">
                            <Link to="/shop">
                                <Button className="bg-white text-blue-700 font-semibold px-6 h-11 rounded-xl shadow">
                                    Shop Now
                                </Button>
                            </Link>

                            <Link to="/ai-chat">
                                <Button variant="outline" className="border-white/40 text-blue-700 px-6 h-11 rounded-xl hover:bg-white/10">
                                    Try AI
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="flex justify-center md:justify-end">
                        <img
                            src="/hero.jpg"
                            alt="shopping"
                            className="w-full max-w-md rounded-2xl shadow-2xl object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Truck, title: "Fast Delivery", desc: "Within 24-48 hours" },
                    { icon: Shield, title: "Secure Payments", desc: "100% safe checkout" },
                    { icon: Zap, title: "AI Recommendations", desc: "Smart suggestions" }
                ].map((f, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition">
                        <f.icon className="w-6 h-6 text-blue-600 mb-2" />
                        <h4 className="font-semibold">{f.title}</h4>
                        <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Featured Products</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Handpicked just for you</p>
                    </div>
                    <Link to="/shop">
                        <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 rounded-xl">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {featured.map((p: any) => {
                        const item = items.find((i: any) => i.id === p.id)
                        const qty = item?.quantity || 1

                        return (
                            <Card className="group rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300">

                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={p.image_url}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />

                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                                        -20%
                                    </span>
                                </div>

                                <CardContent className="p-4 space-y-2">

                                    <Badge variant="outline">{p.category}</Badge>

                                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>

                                    <div className="text-yellow-500 text-xs">
                                        ★★★★☆ <span className="text-gray-400">(120)</span>
                                    </div>

                                    <p className="text-xs text-gray-400 line-clamp-2">
                                        {p.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-lg font-bold">
                                                ₹{Number(p.price * qty).toLocaleString('en-IN')}                                        </span>
                                            <span className="text-xs text-gray-400 line-through ml-2">
                                                ₹{Number(p.price * qty * 1.2).toFixed(0)}
                                            </span>
                                        </div>

                                        {items.find((i: any) => i.id === p.id) ? (
                                            <div className="flex items-center bg-slate-100 rounded-full p-1">
                                                <button
                                                    onClick={() => updateQty(p.id, (items.find((i: any) => i.id === p.id)?.quantity || 1) - 1)}
                                                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-base leading-none"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xs font-bold text-slate-800 w-6 text-center">
                                                    {items.find((i: any) => i.id === p.id)?.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(p.id, (items.find((i: any) => i.id === p.id)?.quantity || 0) + 1)}
                                                    className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white hover:bg-blue-700 active:scale-95 transition-all text-base leading-none"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="rounded-lg bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleAdd(p)}
                                            >
                                                Add
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-5">Shop by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Electronics', emoji: '💻', color: 'bg-blue-50   border-blue-100   text-blue-700' },
                        { label: 'Footwear', emoji: '👟', color: 'bg-rose-50    border-rose-100    text-rose-700' },
                        { label: 'Bags', emoji: '🎒', color: 'bg-amber-50  border-amber-100  text-amber-700' },
                        { label: 'Accessories', emoji: '⌚', color: 'bg-violet-50 border-violet-100 text-violet-700' },
                        { label: 'Fitness', emoji: '🏋️', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                        { label: 'Kitchen', emoji: '☕', color: 'bg-orange-50 border-orange-100 text-orange-700' },
                    ].map(({ label, emoji, color }) => (
                        <Link key={label} to={`/shop?category=${label}`}>
                            <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color} hover:shadow-md transition-all cursor-pointer`}>
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-xs font-semibold">{label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}