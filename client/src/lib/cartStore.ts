import { useState, useEffect } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: any) => void
  removeItem: (id: number) => void
  updateQty: (id: number, qty: number) => void
  clearCart: () => void
  total: number
}

let listeners: (() => void)[] = []

function getCartKey(): string {
  try {
    const stored = localStorage.getItem('auth_user')
    const user = stored ? JSON.parse(stored) : null
    return user?.id ? `cart_user_${user.id}` : 'cart_guest'
  } catch {
    return 'cart_guest'
  }
}

function getStoredCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(getCartKey()) || '[]')
  } catch {
    return []
  }
}

function saveAndNotify(items: CartItem[]) {
  localStorage.setItem(getCartKey(), JSON.stringify(items))
  listeners.forEach(l => l())
}

export const cartStore = {
  addItem(product: any) {
    const current = getStoredCart()
    const idx = current.findIndex(i => i.id === product.id)
    let updated: CartItem[]
    if (idx >= 0) {
      updated = current.map(i =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    } else {
      updated = [...current, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: 1,
      }]
    }
    saveAndNotify(updated)
  },

  removeItem(id: number) {
    saveAndNotify(getStoredCart().filter(i => i.id !== id))
  },

  updateQty(id: number, qty: number) {
    if (qty <= 0) { this.removeItem(id); return }
    saveAndNotify(getStoredCart().map(i => i.id === id ? { ...i, quantity: qty } : i))
  },

  clearCart() {
    saveAndNotify([])
  },

  getItems(): CartItem[] {
    return getStoredCart()
  },

  get total(): number {
    return getStoredCart().reduce((s, i) => s + i.price * i.quantity, 0)
  },

  reload() {
    listeners.forEach(l => l())
  },

  subscribe(listener: () => void) {
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  },
}

export function useCart(): CartStore {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const unsub = cartStore.subscribe(() => forceUpdate(n => n + 1))
    return unsub
  }, [])

  return {
    items: cartStore.getItems(),
    addItem: (p) => cartStore.addItem(p),
    removeItem: (id) => cartStore.removeItem(id),
    updateQty: (id, qty) => cartStore.updateQty(id, qty),
    clearCart: () => cartStore.clearCart(),
    total: cartStore.total,
  }
}