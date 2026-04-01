import { Link } from 'react-router-dom'
import { useCart } from '@/lib/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react'

export default function Cart() {
    const { items, removeItem, updateQty, total } = useCart()

    if (items.length === 0) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ShoppingCart className="w-9 h-9 text-slate-300" />
            </div>
            <div className="text-center">
                <p className="text-xl font-bold text-slate-700">Your cart is empty</p>
                <p className="text-sm text-slate-400 mt-1">Looks like you haven't added anything yet</p>
            </div>
            <Link to="/shop">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 mt-2">
                    Start Shopping
                </Button>
            </Link>
        </div>
    )

    const savings = Math.round(total * 0.05) // fake 5% savings for demo

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Shopping Cart</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                <div className="lg:col-span-3 space-y-3">
                    {items.map(item => (
                        <Card key={item.id} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-4 flex gap-4">
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                            <p className="text-lg font-bold text-blue-600 mt-1">
                                                ₹{item.price.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-300 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                                            >
                                                <Minus className="w-3 h-3 text-slate-600" />
                                            </button>
                                            <span className="text-sm font-bold text-slate-800 w-7 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                                            >
                                                <Plus className="w-3 h-3 text-slate-600" />
                                            </button>
                                        </div>

                                        <p className="text-sm font-bold text-slate-700">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-sm rounded-2xl sticky top-24">
                        <CardContent className="p-6 space-y-5">
                            <h2 className="font-bold text-slate-800 text-lg">Order Summary</h2>

                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-slate-500 truncate max-w-36">
                                            {item.name}
                                            <span className="text-slate-400"> ×{item.quantity}</span>
                                        </span>
                                        <span className="text-slate-700 font-medium ml-2 shrink-0">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> You save
                                    </span>
                                    <span>−₹{savings.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Delivery</span>
                                    <span className="text-emerald-600 font-medium">
                                        {total >= 999 ? 'FREE' : '₹99'}
                                    </span>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="flex justify-between font-bold text-slate-800 text-lg">
                                <span>Total</span>
                                <span className="text-blue-600">
                                    ₹{(total - savings + (total >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <Link to="/checkout">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl h-12 font-semibold text-base my-2">
                                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>

                            <Link to="/shop">
                                <Button variant="outline" className="w-full border-slate-200 text-slate-600 rounded-xl my-1">
                                    Continue Shopping
                                </Button>
                            </Link>

                            <div className="flex items-center justify-center gap-2 pt-1">
                                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs gap-1">
                                    🔒 Secure Checkout
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}