import { useState, useRef, useEffect } from 'react'
import { productApi } from '@/lib/api'
import { useAuth } from '@/lib/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Send, User, Sparkles, RefreshCw, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cartStore'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const SUGGESTIONS = [
    'What electronics are under ₹3000?',
    'Best products for fitness',
    'What is your most popular product?',
    'Compare headphones and smartwatch',
    'Show me all bags',
]

export default function AIChat() {
    const { user } = useAuth()
    const { items } = useCart()
    const cartCount = items.reduce((s, i) => s + i.quantity, 0)
    const [messages, setMessages] = useState<Message[]>([{
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI shopping assistant powered by Groq. Ask me anything about our products — I can help you find items, compare prices, or make recommendations! 🛍️`,
        timestamp: new Date(),
    }])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text?: string) => {
        const msg = (text || input).trim()
        if (!msg || loading) return
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
        setLoading(true)
        try {
            const res = await productApi.aiChat(msg)
            const reply = res.data.data?.reply || 'Sorry, I could not process that.'
            setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I ran into an error. Please try again.',
                timestamp: new Date(),
            }])
        } finally { setLoading(false) }
    }

    const clearChat = () => setMessages([{
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 Ask me anything about our products!`,
        timestamp: new Date(),
    }])

    return (
        <div className="max-w-3xl mx-auto space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">AI Shopping Assistant</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs text-slate-500">Powered by Groq · llama-3.3-70b</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {cartCount > 0 && (
                        <Link to="/cart">
                            <Button variant="outline" size="sm" className="gap-2 border-slate-200 rounded-xl relative">
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Cart ({cartCount})
                            </Button>
                        </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={clearChat} className="gap-1.5 rounded-xl border-slate-200 text-xs">
                        <RefreshCw className="w-3 h-3" /> Clear
                    </Button>
                </div>
            </div>

            {/* Chat window */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                                    <AvatarFallback className={cn(
                                        msg.role === 'assistant' ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"
                                    )}>
                                        {msg.role === 'assistant'
                                            ? <Bot className="w-4 h-4" />
                                            : <span className="text-xs font-bold">{user?.name?.[0] || 'U'}</span>
                                        }
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                    msg.role === 'assistant'
                                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                                        : "bg-blue-600 text-white rounded-tr-sm"
                                )}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={cn("text-xs mt-1.5", msg.role === 'assistant' ? "text-slate-400" : "text-blue-200")}>
                                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                        <Bot className="w-4 h-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5 items-center h-4">
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestions - show only at start */}
                    {messages.length === 1 && (
                        <div className="px-5 pb-3">
                            <p className="text-xs text-slate-400 mb-2 font-medium">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => sendMessage(s)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input bar */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                        <Input
                            placeholder="Ask about products, prices, or get recommendations..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            className="flex-1 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="h-11 w-11 p-0 bg-blue-600 hover:bg-blue-700 rounded-xl shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}