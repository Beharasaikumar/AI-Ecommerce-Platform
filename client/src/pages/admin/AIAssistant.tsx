import { useState, useRef, useEffect } from 'react'
import { productApi } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const SUGGESTIONS = [
    'What electronics do you have under ₹3000?',
    'Recommend something for fitness',
    'Which products are best for gifting?',
    'What is the most expensive product?',
    'Show me all bag options',
]

export default function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your AI shopping assistant powered by ShopMicro. Ask me anything about our products — I can help you find items, compare prices, or make recommendations! 🛍️",
            timestamp: new Date(),
        }
    ])
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

        const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            const res = await productApi.aiChat(msg)
            const reply = res.data.data?.reply || 'Sorry, I could not process that.'
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
            }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I ran into an error. Please try again.',
                timestamp: new Date(),
            }])
        } finally {
            setLoading(false)
        }
    }

    const clearChat = () => setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI shopping assistant powered by Groq. Ask me anything about our products! 🛍️",
        timestamp: new Date(),
    }])

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">AI Shopping Assistant</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs text-slate-500">Powered by Groq · llama-3.3-70b</p>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={clearChat} className="gap-2 text-xs">
                    <RefreshCw className="w-3 h-3" /> Clear chat
                </Button>
            </div>

            {/* Chat window */}
            <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0 flex flex-col h-[calc(100vh-280px)]">

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex gap-3",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                                    <AvatarFallback className={cn(
                                        "text-xs font-semibold",
                                        msg.role === 'assistant'
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-200 text-slate-700"
                                    )}>
                                        {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                                    msg.role === 'assistant'
                                        ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                                        : "bg-blue-600 text-white rounded-tr-sm"
                                )}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={cn(
                                        "text-xs mt-1",
                                        msg.role === 'assistant' ? "text-slate-400" : "text-blue-200"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex gap-3">
                                <Avatar className="w-7 h-7 shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                        <Bot className="w-3.5 h-3.5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1.5 items-center h-4">
                                        {[0, 1, 2].map(i => (
                                            <span key={i}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                 
                </CardContent>
                   <div className="p-4 border-t border-slate-100 flex gap-2 ">
                        <Input
                            placeholder="Ask about products, prices, recommendations..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            className="flex-1 h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
            </Card>
            
        </div>
    )
}