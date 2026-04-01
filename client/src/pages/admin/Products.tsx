import { useEffect, useState } from 'react'
import { productApi, inventoryApi, categoryApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'

type ProductForm = {
  name: string
  description: string
  price: string | number
  category: string
  image_url: string
}

const EMPTY_FORM: ProductForm = {
  name: '', description: '', price: '', category: '', image_url: ''
}

export default function Products() {
  const [products,   setProducts]   = useState<any[]>([])
  const [inventory,  setInventory]  = useState<Record<number,number>>({})
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('all')
  const [form,       setForm]       = useState<ProductForm>(EMPTY_FORM)
  const [editId,     setEditId]     = useState<number|null>(null)
  const [open,       setOpen]       = useState(false)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    categoryApi.getAll()
      .then(r => setCategories(r.data.data || []))
      .catch(() => setCategories([]))
  }, [])

  const fetchAll = async (searchVal = search, categoryVal = category) => {
    setLoading(true)
    try {
      const params: any = {}
      if (searchVal)             params.search   = searchVal
      if (categoryVal !== 'all') params.category = categoryVal
      const [pr, inv] = await Promise.all([
        productApi.getAll(params),
        inventoryApi.getAll(),
      ])
      setProducts(pr?.data?.data || [])
      const invMap: Record<number,number> = {}
      ;(inv?.data?.data || []).forEach((i: any) => { invMap[i.product_id] = i.quantity })
      setInventory(invMap)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchAll(search, category), 400)
    return () => clearTimeout(timer)
  }, [search, category])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  const openEdit   = (p: any) => {
    setForm({
      name: p.name, description: p.description,
      price: Number(p.price), category: p.category, image_url: p.image_url
    })
    setEditId(p.id)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editId) await productApi.update(editId, payload)
      else        await productApi.create(payload)
      setOpen(false)
      fetchAll()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await productApi.delete(id)
    fetchAll()
  }

  const stockBadge = (qty?: number) => {
    if (qty === undefined) return <Badge variant="outline" className="text-xs">Unknown</Badge>
    if (qty === 0)  return <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-100">Out of stock</Badge>
    if (qty < 25)   return <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">Low: {qty}</Badge>
    return <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100">In stock: {qty}</Badge>
  }

  const categoryNames = ['all', ...categories.map(c => c.name)]

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchAll()} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(EMPTY_FORM) }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Product Name *</Label>
                  <Input placeholder="Wireless Headphones" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Price (₹) *</Label>
                  <Input type="number" placeholder="2999" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={form.category || ''}
                    onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.emoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Image URL</Label>
                  <Input placeholder="https://images.unsplash.com/..." value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input placeholder="Short product description" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" />
                </div>
                <Button onClick={handleSave} disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700">
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search products..." className="pl-9 h-9 bg-white border-slate-200"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48 h-9 bg-white border-slate-200">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.name}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No products found</p>
          <Button variant="outline" className="mt-4 border-slate-200"
            onClick={() => { setSearch(''); setCategory('all') }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <Card key={p.id}
              className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group rounded-xl overflow-hidden">
              <div className="relative">
                <img
                  src={p.image_url || '/placeholder.png'}
                  onError={e => (e.currentTarget.src = '/placeholder.png')}
                  alt={p.name}
                  className="w-full h-44 object-cover bg-slate-100"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon" variant="secondary"
                    className="w-8 h-8 bg-white shadow-sm hover:bg-blue-50 border border-slate-200"
                    onClick={() => openEdit(p)}
                    title="Edit product"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  </Button>
                  <Button
                    size="icon" variant="secondary"
                    className="w-8 h-8 bg-white shadow-sm hover:bg-red-50 border border-slate-200"
                    onClick={() => handleDelete(p.id)}
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-base font-bold text-blue-600">
                    ₹{Number(p.price).toLocaleString('en-IN')}
                  </p>
                  {stockBadge(inventory[p.id])}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                    {categories.find(c => c.name === p.category)?.emoji || ''} {p.category}
                  </Badge>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)}
                      className="p-1 rounded hover:bg-blue-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}