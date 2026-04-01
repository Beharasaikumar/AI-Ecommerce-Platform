import { useEffect, useState } from 'react'
import { inventoryApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { RefreshCw, AlertTriangle, Pencil } from 'lucide-react'

export default function Inventory() {
    const [inventory, setInventory] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editItem, setEditItem] = useState<any>(null)
    const [newQty, setNewQty] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchAll = async () => {
        setLoading(true)
       try {
           const inv = await inventoryApi.getAll() 
           setInventory(inv.data?.data || [])
       
           try {
             const s = await inventoryApi.getStats()
             setStats(s.data?.data)
           } catch (err) {
             console.warn("Stats API failed, skipping...")
           }
       
         } catch (error) {
           console.error("Inventory fetch failed:", error)
         
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchAll() }, [])

    const handleUpdateStock = async () => {
        if (!editItem || !newQty) return
        setSaving(true)
        try {
            await inventoryApi.updateStock(editItem.product_id, { quantity: Number(newQty) })
            setEditItem(null)
            fetchAll()
        } finally { setSaving(false) }
    }

    const maxQty = Math.max(...inventory.map(i => i.quantity), 1)

    const stockStatus = (qty: number) => {
        if (qty === 0) return { label: 'Out of stock', class: 'bg-red-100 text-red-700' }
        if (qty < 25) return { label: 'Low stock', class: 'bg-amber-100 text-amber-700' }
        return { label: 'In stock', class: 'bg-emerald-100 text-emerald-700' }
    }

    const statCards = stats ? [
        { label: 'Total Products', value: stats.total_products, color: 'text-slate-800' },
        { label: 'Total Units', value: stats.total_units, color: 'text-blue-600' },
        { label: 'Low Stock', value: stats.low_stock_count, color: 'text-amber-600' },
        { label: 'Out of Stock', value: stats.out_of_stock, color: 'text-red-600' },
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Stock levels across {inventory.length} products
                    </p>
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

            {/* Low stock alert */}
            {Number(stats?.low_stock_count) > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">
                            {stats.low_stock_count} products are below 25 units. Consider restocking soon.
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-slate-50">
                                    {['Product ID', 'Warehouse', 'Stock Level', 'Quantity', 'Status', 'Last Updated', 'Action'].map(h => (
                                        <TableHead key={h} className="text-xs font-semibold text-slate-500">{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.map((item: any) => {
                                    const { label, class: cls } = stockStatus(item.quantity)
                                    return (
                                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                                            <TableCell className="text-sm font-mono text-slate-500">
                                                #{item.product_id}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">{item.warehouse}</TableCell>
                                            <TableCell className="w-40">
                                                <Progress
                                                    value={(item.quantity / maxQty) * 100}
                                                    className="h-2 bg-slate-100"
                                                />
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-slate-800">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs ${cls} hover:${cls}`}>{label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400">
                                                {new Date(item.updated_at).toLocaleDateString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            className="h-7 text-xs gap-1 border-slate-200"
                                                            onClick={() => { setEditItem(item); setNewQty(String(item.quantity)) }}
                                                        >
                                                            <Pencil className="w-3 h-3" /> Update
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-sm">
                                                        <DialogHeader>
                                                            <DialogTitle>Update Stock — Product #{item.product_id}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 pt-2">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-sm">New Quantity</Label>
                                                                <Input
                                                                    type="number" min="0"
                                                                    value={newQty}
                                                                    onChange={e => setNewQty(e.target.value)}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <Button
                                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                                onClick={handleUpdateStock}
                                                                disabled={saving}
                                                            >
                                                                {saving ? 'Saving...' : 'Update Stock'}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}