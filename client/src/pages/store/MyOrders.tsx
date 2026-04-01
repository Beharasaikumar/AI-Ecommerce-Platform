import { useEffect, useState } from 'react'
import { orderApi, productApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { Package, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/authStore'

const STATUS_COLORS: Record<string,string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_STEPS = ['pending','confirmed','shipped','delivered']

export default function MyOrders() {
  const { user }   = useAuth()
  const [orders,   setOrders]   = useState<any[]>([])
  const [products, setProducts] = useState<Record<number,any>>({})
  const [loading,  setLoading]  = useState(true)

  const fetchOrders = async (userId: number) => {
    if (!userId) return
    setLoading(true)
    try {
      const [oRes, pRes] = await Promise.all([
        orderApi.getAll(userId),
        productApi.getAll(),
      ])
      setOrders(oRes.data.data || [])
      const pMap: Record<number,any> = {}
      ;(pRes.data.data || []).forEach((p: any) => { pMap[p.id] = p })
      setProducts(pMap)
    } catch (err) {
      console.error('MyOrders fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id)
    }
  }, [user?.id])

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 pt-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
    </div>
  )

  if (!loading && orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        <ShoppingBag className="w-9 h-9 text-slate-300" />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-slate-700">No orders yet</p>
        <p className="text-sm text-slate-400 mt-1">Your orders will appear here after checkout</p>
      </div>
      <Link to="/shop">
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 mt-2">Start Shopping</Button>
      </Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </p>
        </div>
        <Button variant="outline" size="sm"
          onClick={() => user?.id && fetchOrders(user.id)}
          className="gap-2 border-slate-200 rounded-xl">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((o: any) => {
          const product = products[o.product_id]
          const stepIdx = STATUS_STEPS.indexOf(o.status)
          return (
            <Card key={o.id} className="border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {product?.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {product?.name || `Product #${o.product_id}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Order #{o.id} · Qty: {o.quantity}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day:'numeric', month:'long', year:'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-blue-600">
                          ₹{Number(o.total_price).toLocaleString('en-IN')}
                        </p>
                        <Badge className={`text-xs capitalize mt-1 border-0 ${STATUS_COLORS[o.status] || ''}`}>
                          {o.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress tracker */}
                    {o.status !== 'cancelled' && (
                      <div className="mt-4">
                        <div className="flex items-center">
                          {STATUS_STEPS.map((s, i) => (
                            <div key={s} className="flex items-center flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                                i <= stepIdx ? 'bg-blue-600' : 'bg-slate-200'
                              }`} />
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 transition-colors ${
                                  i < stepIdx ? 'bg-blue-600' : 'bg-slate-200'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          {STATUS_STEPS.map((s, i) => (
                            <p key={s} className={`text-xs capitalize ${
                              i <= stepIdx ? 'text-blue-600 font-medium' : 'text-slate-300'
                            }`}>{s}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {o.status === 'pending' && (
                      <Button variant="outline" size="sm"
                        className="mt-3 h-7 text-xs border-red-200 text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={async () => {
                          await orderApi.cancel(o.id)
                          user?.id && fetchOrders(user.id)
                        }}>
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Link to="/shop">
          <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}