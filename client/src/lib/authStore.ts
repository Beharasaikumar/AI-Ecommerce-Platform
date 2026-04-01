import axios from 'axios'

export interface AuthUser {
    id: number
    name: string
    email: string
    role: 'user' | 'admin'
}

let currentUser: AuthUser | null = null
let authListeners: (() => void)[] = []

function notify() { authListeners.forEach(l => l()) }

function loadFromStorage(): AuthUser | null {
    try {
        const stored = localStorage.getItem('auth_user')
        return stored ? JSON.parse(stored) : null
    } catch { return null }
}

currentUser = loadFromStorage()

export const authStore = {
    getUser: (): AuthUser | null => currentUser,
    getToken: (): string | null => localStorage.getItem('auth_token'),
    isLoggedIn: () => currentUser !== null,
    isAdmin: () => currentUser?.role === 'admin',

    async login(email: string, password: string): Promise<AuthUser> {
        const res = await axios.post('/api/auth/login', { email, password })
        const { user, token } = res.data.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        currentUser = user
        notify()
        return user
    },

    async register(name: string, email: string, password: string): Promise<AuthUser> {
        const res = await axios.post('/api/auth/register', { name, email, password })
        const { user, token } = res.data.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        currentUser = user
        notify()
        return user
    },

    logout() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        currentUser = null
        notify()
        window.location.href = '/login'
    },

    subscribe(listener: () => void) {
        authListeners.push(listener)
        return () => { authListeners = authListeners.filter(l => l !== listener) }
    }
}

import { useState, useEffect } from 'react'
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(authStore.getUser())
    useEffect(() => {
        return authStore.subscribe(() => setUser(authStore.getUser()))
    }, [])
    return {
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        login: authStore.login.bind(authStore),
        register: authStore.register.bind(authStore),
        logout: authStore.logout.bind(authStore),
    }
}