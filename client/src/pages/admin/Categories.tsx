import { useEffect, useState } from 'react'
import { categoryApi, productApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Plus, Trash2, RefreshCw, Tag, Package, AlertTriangle, Pen } from 'lucide-react'

const EMOJI_OPTIONS = ['💻', '👟', '🎒', '⌚', '🏋️', '☕', '📱', '🎮', '👗', '🏠', '🎨', '📚', '🌿', '💄', '🔧']
const COLOR_OPTIONS = [
    { label: 'Blue', value: 'bg-blue-50 text-blue-700' },
    { label: 'Rose', value: 'bg-rose-50 text-rose-700' },
    { label: 'Amber', value: 'bg-amber-50 text-amber-700' },
    { label: 'Violet', value: 'bg-violet-50 text-violet-700' },
    { label: 'Emerald', value: 'bg-emerald-50 text-emerald-700' },
    { label: 'Orange', value: 'bg-orange-50 text-orange-700' },
    { label: 'Pink', value: 'bg-pink-50 text-pink-700' },
    { label: 'Slate', value: 'bg-slate-100 text-slate-700' },
]

export default function Categories() {
    const [categories, setCategories] = useState<any[]>([])
    const [productCounts, setProductCounts] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ name: '', emoji: '📦', color: 'bg-slate-100 text-slate-700' })
    const [editId, setEditId] = useState<number | null>(null)

    const openEdit = (cat: any) => {
  setForm({
    name: cat.name,
    emoji: cat.emoji,
    color: cat.color
  })
  setEditId(cat.id)
  setOpen(true)
}

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [catRes, prodRes] = await Promise.all([
                categoryApi.getAll(),
                productApi.getAll(),
            ])
            const cats = catRes.data.data || []
            const prods = prodRes.data.data || []

            const counts: Record<string, number> = {}
            cats.forEach((c: any) => { counts[c.name] = 0 })
            prods.forEach((p: any) => {
                if (counts[p.category] !== undefined) counts[p.category]++
                else counts[p.category] = (counts[p.category] || 0) + 1
            })

            setCategories(cats)
            setProductCounts(counts)
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchAll() }, [])

    const handleSave = async () => {
  if (!form.name.trim()) {
    setError('Category name is required')
    return
  }

  setSaving(true)
  setError('')

  try {
    if (editId) {
      await categoryApi.update(editId, form) 
    } else {
      await categoryApi.create(form)
    }

    setOpen(false)
    setEditId(null)
    setForm({ name: '', emoji: '📦', color: 'bg-slate-100 text-slate-700' })
    fetchAll()
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed')
  } finally {
    setSaving(false)
  }
}

    const handleDelete = async (id: number, name: string) => {
        const count = productCounts[name] || 0
        const msg = count > 0
            ? `"${name}" has ${count} product(s). Delete anyway? Products will keep their category label.`
            : `Delete category "${name}"?`
        if (!confirm(msg)) return
        await categoryApi.delete(id)
        fetchAll()
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {categories.length} categories · manage your product taxonomy
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setError('') }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-3.5 h-3.5" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Category Name *</Label>
                                    <Input placeholder="e.g. Sports" value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="h-9" autoFocus />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Emoji Icon</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button key={emoji}
                                                onClick={() => setForm(f => ({ ...f, emoji }))}
                                                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === emoji
                                                        ? 'bg-blue-100 ring-2 ring-blue-500'
                                                        : 'bg-slate-100 hover:bg-slate-200'
                                                    }`}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Color Theme</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLOR_OPTIONS.map(opt => (
                                            <button key={opt.value}
                                                onClick={() => setForm(f => ({ ...f, color: opt.value }))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${opt.value} ${form.color === opt.value ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                                                    }`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Preview</Label>
                                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${form.color}`}>
                                        <span>{form.emoji}</span>
                                        <span>{form.name || 'Category Name'}</span>
                                    </div>
                                </div>

                                <Button onClick={handleSave} disabled={saving}
                                    className="w-full bg-blue-600 hover:bg-blue-700">
                                    {saving ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat: any) => {
                        const count = productCounts[cat.name] || 0
                        return (
                            <Card key={cat.id}
                                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cat.color}`}>
                                                {cat.emoji}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{cat.name}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Package className="w-3 h-3 text-slate-400" />
                                                    <p className="text-xs text-slate-500">{count} product{count !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
  <button
    onClick={() => openEdit(cat)}
    className="p-1.5 rounded-lg hover:bg-blue-50"
  >
    <Pen className="w-4 h-4 text-blue-400" />
  </button>

  <button
    onClick={() => handleDelete(cat.id, cat.name)}
    className="p-1.5 rounded-lg hover:bg-red-50"
  >
    <Trash2 className="w-4 h-4 text-red-400" />
  </button>
</div>
                                        {/* <button
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                            title="Delete category"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button> */}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <Badge className={`text-xs border-0 ${cat.color}`}>
                                            {cat.emoji} {cat.name}
                                        </Badge>
                                        <p className="text-xs text-slate-400">
                                            Added {new Date(cat.created_at).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {categories.length === 0 && (
                        <div className="col-span-3 text-center py-16">
                            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No categories yet</p>
                            <p className="text-slate-400 text-sm mt-1">Add your first category to organise products</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && categories.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-semibold text-slate-700">
                                    {categories.length} categories
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <span key={cat.id} className={`text-xs px-2 py-1 rounded-full font-medium ${cat.color}`}>
                                        {cat.emoji} {cat.name} ({productCounts[cat.name] || 0})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}