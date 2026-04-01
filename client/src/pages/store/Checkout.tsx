import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '@/lib/cartStore'
import { orderApi, paymentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  CheckCircle, CreditCard, MapPin,
  Loader2, ShoppingBag, AlertCircle,
  Smartphone, Building2, Lock, Eye, EyeOff
} from 'lucide-react'
import { useAuth } from '@/lib/authStore'

type Step = 'form' | 'processing' | 'success' | 'failed'

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
]

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const USER_ID   = user?.id ?? 0

  const [step,    setStep]    = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [method,  setMethod]  = useState<'card'|'upi'|'netbanking'>('card')
  const [result,  setResult]  = useState<any>(null)
  const [showCvv, setShowCvv] = useState(false)
  const [delivery, setDelivery] = useState({
    name: '', email: user?.email || '', phone: '', address: ''
  })
  const [card, setCard] = useState({
    number: '', expiry: '', cvv: '', name: ''
  })
  const [upi, setUpi] = useState({ id: '', mpin: '' })
  const [bank, setBank] = useState({ name: '', userId: '', password: '' })
  const isDeliveryValid = delivery.name.trim() && delivery.address.trim()

  const isPaymentValid = () => {
    if (method === 'card') {
      const digits = card.number.replace(/\s/g, '')
      return digits.length === 16 && card.expiry.length === 5 &&
             card.cvv.length >= 3 && card.name.trim()
    }
    if (method === 'upi') {
      return upi.id.includes('@') && upi.mpin.length === 6
    }
    if (method === 'netbanking') {
      return bank.name && bank.userId.trim() && bank.password.trim()
    }
    return false
  }

  const canSubmit = isDeliveryValid && isPaymentValid()

  const handlePlaceOrder = async () => {
    if (!canSubmit) return
    setLoading(true)
    setStep('processing')
    try {
      await new Promise(r => setTimeout(r, 2000))

      const orderPromises = items.map(item =>
        orderApi.create({
          user_id:     USER_ID,
          product_id:  item.id,
          quantity:    item.quantity,
          total_price: item.price * item.quantity,
        })
      )
      const orders       = await Promise.all(orderPromises)
      const firstOrderId = orders[0].data.data.id
      const payment      = await paymentApi.process({
        order_id: firstOrderId, amount: total, method
      })
      const paymentData  = payment.data.data

      setResult({ orders, payment: paymentData })
      if (paymentData.status === 'success') {
        clearCart()
        setStep('success')
      } else {
        setStep('failed')
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step === 'form') {
    navigate('/shop')
    return null
  }

  if (step === 'processing') return (
    <div className="max-w-lg mx-auto py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">Processing payment...</h1>
        <p className="text-slate-500 mt-2 text-sm">
          {method === 'card'       && 'Verifying your card details securely'}
          {method === 'upi'        && 'Waiting for UPI confirmation'}
          {method === 'netbanking' && 'Redirecting to your bank'}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Lock className="w-3.5 h-3.5" />
        <span>256-bit SSL encrypted · Do not refresh</span>
      </div>
    </div>
  )

  if (step === 'success') return (
    <div className="max-w-lg mx-auto py-12 text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <span className="absolute top-0 right-1/2 translate-x-16 -translate-y-2 text-2xl">🎉</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Successful!</h1>
        <p className="text-slate-500 mt-2">
          Thank you {delivery.name.split(' ')[0]}! Your order is confirmed.
        </p>
      </div>
      <Card className="border-slate-200 rounded-2xl text-left">
        <CardContent className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Receipt</p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <Badge className="bg-emerald-100 text-emerald-700 border-0">✓ Paid</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Method</span>
            <span className="text-slate-700 font-medium capitalize">
              {method === 'card' && `Card ····${card.number.replace(/\s/g,'').slice(-4)}`}
              {method === 'upi'  && `UPI · ${upi.id}`}
              {method === 'netbanking' && `Net Banking · ${bank.name}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono text-xs text-slate-600 max-w-40 truncate">
              {result?.payment?.transaction_id}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Delivery to</span>
            <span className="text-slate-700 text-right max-w-48 truncate">{delivery.address}</span>
          </div>
          <Separator className="bg-slate-100" />
          <div className="flex justify-between font-bold">
            <span className="text-slate-700">Amount Paid</span>
            <span className="text-blue-600 text-lg">
              ₹{Number(result?.payment?.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3 justify-center">
        <Link to="/my-orders">
          <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
            <ShoppingBag className="w-4 h-4" /> My Orders
          </Button>
        </Link>
        <Link to="/shop">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )

  if (step === 'failed') return (
    <div className="max-w-lg mx-auto py-12 text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Failed</h1>
        <p className="text-slate-500 mt-2">Your order was created but payment didn't go through.</p>
        <p className="text-xs text-slate-400 mt-1 font-mono">{result?.payment?.transaction_id}</p>
      </div>
      <Card className="border-red-100 bg-red-50 rounded-xl text-left">
        <CardContent className="p-4">
          <p className="text-sm text-red-700 font-medium">What to do next:</p>
          <ul className="text-xs text-red-600 mt-2 space-y-1 list-disc list-inside">
            <li>Check your card/UPI balance</li>
            <li>Make sure your card is not expired</li>
            <li>Try a different payment method</li>
          </ul>
        </CardContent>
      </Card>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setStep('form')} className="rounded-xl border-slate-200">
          Try Again
        </Button>
        <Link to="/my-orders">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">View Orders</Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your purchase securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Full Name *</Label>
                  <Input placeholder="Arjun Sharma" value={delivery.name}
                    onChange={e => setDelivery(d => ({ ...d, name: e.target.value }))}
                    className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input type="email" placeholder="arjun@email.com" value={delivery.email}
                    onChange={e => setDelivery(d => ({ ...d, email: e.target.value }))}
                    className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Phone</Label>
                  <Input placeholder="+91 98765 43210" value={delivery.phone}
                    onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))}
                    className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Delivery Address *</Label>
                <Input placeholder="Flat 4B, MG Road, Visakhapatnam, AP 530001" value={delivery.address}
                  onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))}
                  className="h-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-violet-600" />
                </div>
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'card',       icon: CreditCard,  label: 'Card',        sub: 'Debit / Credit' },
                  { value: 'upi',        icon: Smartphone,  label: 'UPI',         sub: 'GPay, PhonePe'  },
                  { value: 'netbanking', icon: Building2,   label: 'Net Banking', sub: 'All banks'      },
                ] as const).map(opt => (
                  <button key={opt.value} onClick={() => setMethod(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      method === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}>
                    <opt.icon className={`w-5 h-5 mb-1.5 ${
                      method === opt.value ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                    <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {method === 'card' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Card Number</Label>
                    <div className="relative">
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                        className="h-11 rounded-xl font-mono tracking-widest pr-14"
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        {card.number.startsWith('4') && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">VISA</span>
                        )}
                        {(card.number.startsWith('5') || card.number.startsWith('2')) && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">MC</span>
                        )}
                        {card.number.startsWith('6') && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">RUPAY</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Expiry Date</Label>
                      <Input
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                        className="h-11 rounded-xl font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">CVV</Label>
                      <div className="relative">
                        <Input
                          type={showCvv ? 'text' : 'password'}
                          placeholder="•••"
                          value={card.cvv}
                          onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                          className="h-11 rounded-xl font-mono pr-10"
                          maxLength={4}
                        />
                        <button type="button" onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Cardholder Name</Label>
                    <Input
                      placeholder="As printed on card"
                      value={card.name}
                      onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                      className="h-11 rounded-xl font-mono tracking-wide uppercase"
                    />
                  </div>

                  {card.number && (
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-4 text-white">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-8 h-6 rounded bg-amber-400/80" />
                        <span className="text-xs opacity-60">
                          {card.number.startsWith('4') ? 'VISA' :
                           card.number.startsWith('5') ? 'MASTERCARD' :
                           card.number.startsWith('6') ? 'RUPAY' : ''}
                        </span>
                      </div>
                      <p className="font-mono text-lg tracking-widest mb-3">
                        {card.number || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between text-xs">
                        <div>
                          <p className="opacity-50 text-xs">Cardholder</p>
                          <p className="font-medium">{card.name || 'YOUR NAME'}</p>
                        </div>
                        <div className="text-right">
                          <p className="opacity-50 text-xs">Expires</p>
                          <p className="font-medium">{card.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Your card details are encrypted and never stored</span>
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">UPI ID</Label>
                    <Input
                      placeholder="yourname@upi"
                      value={upi.id}
                      onChange={e => setUpi(u => ({ ...u, id: e.target.value }))}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-slate-400">
                      Format: username@bankname (e.g. ram@oksbi, ram@paytm)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Quick fill by app</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: 'GPay',     suffix: '@okicici' },
                        { label: 'PhonePe',  suffix: '@ybl' },
                        { label: 'Paytm',    suffix: '@paytm' },
                        { label: 'BHIM',     suffix: '@upi' },
                      ].map(app => (
                        <button key={app.label}
                          onClick={() => setUpi(u => ({
                            ...u,
                            id: u.id.split('@')[0]
                              ? u.id.split('@')[0] + app.suffix
                              : app.suffix.slice(1) + app.suffix
                          }))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                          {app.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">UPI PIN (MPIN)</Label>
                    <Input
                      type="password"
                      placeholder="6-digit PIN"
                      value={upi.mpin}
                      onChange={e => setUpi(u => ({ ...u, mpin: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                      className="h-11 rounded-xl font-mono tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-slate-400">
                      This is the PIN you set in your UPI app
                    </p>
                  </div>

                  {upi.id && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Payment request will be sent to</p>
                        <p className="text-xs text-blue-600 font-mono mt-0.5">{upi.id}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>UPI PIN is encrypted · Never share with anyone</span>
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Select Bank</Label>
                    <Select value={bank.name} onValueChange={v => setBank(b => ({ ...b, name: v }))}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {bank.name && (
                    <>
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Simulated {bank.name} login
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            In production this would redirect to your bank's secure portal
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Net Banking User ID</Label>
                        <Input
                          placeholder="Enter your User ID"
                          value={bank.userId}
                          onChange={e => setBank(b => ({ ...b, userId: e.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter your net banking password"
                          value={bank.password}
                          onChange={e => setBank(b => ({ ...b, password: e.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bank credentials are only used for this demo and not stored</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm rounded-2xl sticky top-24">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-bold text-slate-800">Order Summary</h2>

              <div className="space-y-3 max-h-52 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image_url} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Delivery</span>
                  <span className="font-medium">{total >= 999 ? 'FREE' : '₹99'}</span>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span className="text-blue-600 text-xl">₹{total.toLocaleString('en-IN')}</span>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl h-12 font-semibold text-base disabled:opacity-40"
                onClick={handlePlaceOrder}
                disabled={loading || !canSubmit}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{total.toLocaleString('en-IN')}
                    </>
                }
              </Button>

              {!isDeliveryValid && (
                <p className="text-xs text-slate-400 text-center">Fill Name and Address to continue</p>
              )}
              {isDeliveryValid && !isPaymentValid() && (
                <p className="text-xs text-amber-500 text-center">
                  {method === 'card'       && 'Enter complete card details'}
                  {method === 'upi'        && 'Enter valid UPI ID and 6-digit PIN'}
                  {method === 'netbanking' && 'Select bank and enter credentials'}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Secured by ShopMicro Pay</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}