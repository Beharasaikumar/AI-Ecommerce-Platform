import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { orderApi, paymentApi, inventoryApi, productApi } from '@/lib/api'
import {
    Package, ShoppingCart, CreditCard,
    Warehouse, TrendingUp, AlertTriangle
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
    const [orderStats, setOrderStats] = useState<any>(null)
    const [paymentStats, setPaymentStats] = useState<any>(null)
    const [inventoryStats, setInventoryStats] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, paymentsRes, inventoryRes, productsRes] = await Promise.all([
                    orderApi.getAll(),
                    paymentApi.getAll(),
                    inventoryApi.getAll(),
                    productApi.getAll(),
                ])

                const orders = ordersRes.data?.data || []
                const payments = paymentsRes.data?.data || []
                const inventory = inventoryRes.data?.data || []

                const orderStatsCalculated = {
                    total_orders: orders.length,
                    total_revenue: orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),

                    pending: orders.filter((o: any) => o.status === 'pending').length,
                    confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
                    shipped: orders.filter((o: any) => o.status === 'shipped').length,
                    delivered: orders.filter((o: any) => o.status === 'delivered').length,
                    cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
                }

                const paymentStatsCalculated = {
                    total_collected: payments
                        .filter((p: any) => p.status === 'success')
                        .reduce((sum: number, p: any) => sum + Number(p.amount), 0),

                    successful: payments.filter((p: any) => p.status === 'success').length,
                    failed: payments.filter((p: any) => p.status === 'failed').length,
                    pending: payments.filter((p: any) => p.status === 'pending').length,
                    refunded: payments.filter((p: any) => p.status === 'refunded').length,
                }

                const inventoryStatsCalculated = {
                    total_units: inventory.reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0),
                    low_stock_count: inventory.filter((i: any) => i.quantity < 20).length,
                }

                setOrderStats(orderStatsCalculated)
                setPaymentStats(paymentStatsCalculated)
                setInventoryStats(inventoryStatsCalculated)
                setProducts(productsRes.data?.data || [])

            } catch (error) {
                console.error("Dashboard error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const statCards = [
        {
            title: 'Total Orders',
            value: orderStats?.total_orders || 0,
            sub: `₹${Number(orderStats?.total_revenue || 0).toLocaleString('en-IN')} revenue`,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Total Products',
            value: products.length,
            sub: 'In catalog',
            icon: Package,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            title: 'Payments Collected',
            value: `₹${Number(paymentStats?.total_collected || 0).toLocaleString('en-IN')}`,
            sub: `${paymentStats?.successful || 0} successful`,
            icon: CreditCard,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
        },
        {
            title: 'Total Stock Units',
            value: inventoryStats?.total_units || 0,
            sub: `${inventoryStats?.low_stock_count || 0} low stock alerts`,
            icon: Warehouse,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ]

    const orderChartData = orderStats ? [
        { name: 'Pending', value: Number(orderStats.pending) },
        { name: 'Confirmed', value: Number(orderStats.confirmed) },
        { name: 'Shipped', value: Number(orderStats.shipped) },
        { name: 'Delivered', value: Number(orderStats.delivered) },
        { name: 'Cancelled', value: Number(orderStats.cancelled) },
    ] : []

    const paymentChartData = paymentStats ? [
        { name: 'Success', value: Number(paymentStats.successful) },
        { name: 'Failed', value: Number(paymentStats.failed) },
        { name: 'Pending', value: Number(paymentStats.pending) },
        { name: 'Refunded', value: Number(paymentStats.refunded) },
    ] : []

    if (loading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
            </div>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Welcome back — here's what's happening across your services.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ title, value, sub, icon: Icon, color, bg }) => (
                    <Card key={title} className="border-slate-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                                    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
                                    <p className="text-xs text-slate-400 mt-1">{sub}</p>
                                </div>
                                <div className={`${bg} p-2.5 rounded-lg`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Order status bar chart */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Orders by Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={orderChartData} barSize={32}>
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {orderChartData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payment status pie chart */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-violet-500" />
                            Payment Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={paymentChartData}
                                    cx="40%" cy="50%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {paymentChartData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 shrink-0">
                            {paymentChartData.map((entry, i) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs text-slate-600">{entry.name}</span>
                                    <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low stock alert */}
            {Number(inventoryStats?.low_stock_count) > 0 && (
                <Card className="border-amber-200 bg-amber-50 shadow-sm">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">
                                    {inventoryStats.low_stock_count} items are running low on stock
                                </p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                    Visit the Inventory page to restock before items run out.
                                </p>
                            </div>
                            <Badge className="ml-auto bg-amber-200 text-amber-800 hover:bg-amber-200">
                                Action needed
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent products */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-500" />
                        Recent Products
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-slate-100">
                        {products.slice(0, 5).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-4 py-3">
                                <img
                                    src={p.image_url} alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{p.category}</p>
                                </div>
                                <p className="text-sm font-semibold text-slate-800">
                                    ₹{Number(p.price).toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}