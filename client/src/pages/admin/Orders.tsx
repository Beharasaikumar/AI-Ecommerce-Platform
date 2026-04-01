import { useEffect, useState } from 'react'
import { orderApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { RefreshCw } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-violet-100 text-violet-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
}

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [updating, setUpdating] = useState<number | null>(null)

const fetchAll = async () => {
  setLoading(true)
  try {
    const o = await orderApi.getAll() 
    setOrders(o.data?.data || [])

    try {
      const s = await orderApi.getStats()
      setStats(s.data?.data)
    } catch (err) {
      console.warn("Stats API failed, skipping...")
    }

  } catch (error) {
    console.error("Orders fetch failed:", error)
  } finally {
    setLoading(false)
  }
}

    useEffect(() => { fetchAll() }, [])

    const handleStatus = async (id: number, status: string) => {
        setUpdating(id)
        try {
            await orderApi.updateStatus(id, status)
            fetchAll()
        } finally { setUpdating(null) }
    }

    const filtered = filter === 'all'
        ? orders
        : orders.filter((o: any) => o.status === filter)

    const statCards = stats ? [
        { label: 'Total Orders', value: stats.total_orders, color: 'text-slate-800' },
        { label: 'Revenue', value: `₹${Number(stats.total_revenue || 0).toLocaleString('en-IN')}`, color: 'text-blue-600' },
        { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
        { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">{orders.length} total orders</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {loading
                    ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
                    : statCards.map(({ label, value, color }) => (
                        <Card key={label} className="border-slate-200 shadow-sm">
                            <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-slate-500 font-medium">{label}</p>
                                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-44 h-9 bg-white border-slate-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-slate-400">{filtered.length} orders shown</p>
            </div>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50">
                                    <TableHead className="text-xs font-semibold text-slate-500">Order ID</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">User</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Product</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Qty</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Total</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500">Update</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((o: any) => (
                                    <TableRow key={o.id} className="border-slate-100 hover:bg-slate-50">
                                        <TableCell className="text-sm font-mono text-slate-500">#{o.id}</TableCell>
                                        <TableCell className="text-sm text-slate-700">User {o.user_id}</TableCell>
                                        <TableCell className="text-sm text-slate-700">Product {o.product_id}</TableCell>
                                        <TableCell className="text-sm text-slate-700">{o.quantity}</TableCell>
                                        <TableCell className="text-sm font-semibold text-slate-800">
                                            ₹{Number(o.total_price).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-xs capitalize ${STATUS_COLORS[o.status] || ''} hover:${STATUS_COLORS[o.status]}`}>
                                                {o.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-400">
                                            {new Date(o.created_at).toLocaleDateString('en-IN')}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={o.status}
                                                onValueChange={v => handleStatus(o.id, v)}
                                                disabled={updating === o.id}
                                            >
                                                <SelectTrigger className="h-7 w-32 text-xs border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUSES.map(s => (
                                                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}