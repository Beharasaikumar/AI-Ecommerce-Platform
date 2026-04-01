import { useEffect, useState } from 'react'
import { paymentApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { RefreshCw, RotateCcw } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    refunded: 'bg-slate-100 text-slate-600',
}

export default function Payments() {
    const [payments, setPayments] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refunding, setRefunding] = useState<number | null>(null)

    const fetchAll = async () => {
        setLoading(true)
       try {
           const p = await paymentApi.getAll() 
           setPayments(p.data?.data || [])
       
           try {
             const s = await paymentApi.getStats()
             setStats(s.data?.data)
           } catch (err) {
             console.warn("Stats API failed, skipping...")
           }
       
         } catch (error) {
           console.error("Payments fetch failed:", error)
        } finally { setLoading(false) }
    }

    useEffect(() => { 
        fetchAll() 
    }, [])

    const handleRefund = async (id: number) => {
        if (!confirm('Process refund for this payment?')) return
        setRefunding(id)
        try { await paymentApi.refund(id); fetchAll() }
        finally { setRefunding(null) }
    }

    const statCards = stats ? [
        { label: 'Total Collected', value: `₹${Number(stats.total_collected || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600' },
        { label: 'Successful', value: stats.successful, color: 'text-blue-600' },
        { label: 'Failed', value: stats.failed, color: 'text-red-600' },
        { label: 'Refunded', value: stats.refunded, color: 'text-slate-600' },
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Payments</h1>
                    <p className="text-sm text-slate-500 mt-1">{payments.length} total transactions</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

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
                                    {['ID', 'Order', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date', 'Action'].map(h => (
                                        <TableHead key={h} className="text-xs font-semibold text-slate-500">{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((p: any) => (
                                    <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50">
                                        <TableCell className="text-sm font-mono text-slate-500">#{p.id}</TableCell>
                                        <TableCell className="text-sm text-slate-700">#{p.order_id}</TableCell>
                                        <TableCell className="text-sm font-semibold text-slate-800">
                                            ₹{Number(p.amount).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell className="text-sm capitalize text-slate-600">{p.method}</TableCell>
                                        <TableCell>
                                            <Badge className={`text-xs capitalize ${STATUS_COLORS[p.status] || ''} hover:${STATUS_COLORS[p.status]}`}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-slate-400 max-w-32 truncate">
                                            {p.transaction_id}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-400">
                                            {new Date(p.created_at).toLocaleDateString('en-IN')}
                                        </TableCell>
                                        <TableCell>
                                            {p.status === 'success' && (
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="h-7 text-xs gap-1 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                    onClick={() => handleRefund(p.id)}
                                                    disabled={refunding === p.id}
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Refund
                                                </Button>
                                            )}
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