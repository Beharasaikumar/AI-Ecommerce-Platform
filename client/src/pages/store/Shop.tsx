import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productApi } from '@/lib/api'
import { useCart } from '@/lib/cartStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingCart, Search, ShoppingBag } from 'lucide-react'

const CATEGORIES = ['All', 'Electronics', 'Footwear', 'Bags', 'Accessories', 'Fitness', 'Kitchen']

export default function Shop() {
    const [searchParams] = useSearchParams()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [added, setAdded] = useState<Record<number, boolean>>({})
    const { addItem, items, updateQty } = useCart()
    const cartCount = items.reduce((s, i) => s + i.quantity, 0)


    useEffect(() => {
        const urlSearch = searchParams.get('search') || ''
        const urlCategory = searchParams.get('category') || 'All'

        setSearch(urlSearch)
        setCategory(urlCategory)
    }, [searchParams])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true)
            const params: any = {}

            if (search.trim()) params.search = search.trim()
            if (category !== 'All') params.category = category

            productApi.getAll(params)
                .then(r => setProducts(r.data.data || []))
                .finally(() => setLoading(false))
        }, 300)

        return () => clearTimeout(timer)
    }, [search, category])

    const handleAdd = (p: any) => {
        addItem(p)
        setAdded(a => ({ ...a, [p.id]: true }))
        setTimeout(() => setAdded(a => ({ ...a, [p.id]: false })), 1500)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Shop</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{products.length} products available</p>
                </div>

            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search products by name or description..."
                    className="pl-11 h-11 bg-white border-slate-200 rounded-xl text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${category === c
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-semibold text-slate-600">No products found</p>
                    <p className="text-sm text-slate-400">Try a different search or category</p>
                    <Button variant="outline" onClick={() => { setSearch(''); setCategory('All') }}
                        className="mt-2 rounded-xl border-slate-200">
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((p: any) => {
                        const item = items.find(i => i.id === p.id)
                        const qty = item?.quantity || 1

                        return (
                            <Card key={p.id} className="border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group rounded-2xl overflow-hidden">
                                <div className="overflow-hidden h-52 bg-slate-100">
                                    <img src={p.image_url} alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <CardContent className="p-4">
                                    <Badge variant="outline" className="text-xs mb-2 border-slate-200 text-slate-500 rounded-full">
                                        {p.category}
                                    </Badge>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 mb-4 min-h-[32px]">{p.description}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-bold text-slate-900">
                                            ₹{Number(p.price * qty).toLocaleString('en-IN')}
                                        </p>

                                        {items.find(i => i.id === p.id) ? (
                                            <div className="flex items-center bg-slate-100 rounded-full p-1">
                                                <button
                                                    onClick={() => updateQty(p.id, (item?.quantity || 1) - 1)}
                                                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-base leading-none"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xs font-bold text-slate-800 w-6 text-center">
                                                    {item?.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(p.id, (item?.quantity || 0) + 1)}
                                                    className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white hover:bg-blue-700 active:scale-95 transition-all text-base leading-none"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="h-9 px-4 text-xs rounded-xl gap-1.5 font-semibold bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleAdd(p)}
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                Add to Cart
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                    )}
                </div>
            )}
        </div>
    )
}