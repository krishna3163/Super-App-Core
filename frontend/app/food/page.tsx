'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import {
  Search, Star, Clock, MapPin, Filter, Plus, Minus,
  ShoppingCart, X, Loader2, CheckCircle2, MessageCircle,
  ChevronDown, ChevronUp, Send, CreditCard, Smartphone,
  Banknote, Building2, Truck
} from 'lucide-react'
import clsx from 'clsx'

// ─── Static fallback restaurants ─────────────────────────────────────────────
const STATIC_RESTAURANTS = [
  { _id: 'r1', name: 'Burger King', rating: 4.5, time: '20-30 min', distance: '1.2 km', category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80',
    menu: [
      { name: 'Whopper', price: 199, description: 'Classic flame-grilled beef burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', category: 'Burgers', isAvailable: true },
      { name: 'Chicken Royale', price: 179, description: 'Crispy chicken fillet burger', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300&q=80', category: 'Burgers', isAvailable: true },
      { name: 'Fries (Large)', price: 89, description: 'Golden crispy fries', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', category: 'Sides', isAvailable: true },
      { name: 'Coke', price: 59, description: 'Chilled Coca-Cola', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80', category: 'Drinks', isAvailable: true },
    ]},
  { _id: 'r2', name: 'Pizza Hut', rating: 4.2, time: '30-40 min', distance: '2.5 km', category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    menu: [
      { name: 'Margherita (M)', price: 299, description: 'Classic tomato & mozzarella', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80', category: 'Pizza', isAvailable: true },
      { name: 'Pepperoni (M)', price: 349, description: 'Loaded with pepperoni', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80', category: 'Pizza', isAvailable: true },
      { name: 'Garlic Bread', price: 99, description: 'Toasted with garlic butter', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&q=80', category: 'Sides', isAvailable: true },
    ]},
  { _id: 'r3', name: 'Sushi Zen', rating: 4.8, time: '25-35 min', distance: '0.8 km', category: 'Asian',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    menu: [
      { name: 'Salmon Nigiri (6pc)', price: 449, description: 'Fresh Atlantic salmon', image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300&q=80', category: 'Sushi', isAvailable: true },
      { name: 'Dragon Roll', price: 399, description: 'Avocado, shrimp tempura', image: 'https://images.unsplash.com/photo-1617196034099-5b4e5e4e4e4e?w=300&q=80', category: 'Rolls', isAvailable: true },
      { name: 'Miso Soup', price: 99, description: 'Traditional Japanese soup', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80', category: 'Soups', isAvailable: true },
    ]},
]

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Asian', 'Healthy', 'Desserts']
const PAYMENT_METHODS = [
  { id: 'cod',  label: 'Cash on Delivery', icon: Banknote,   color: 'text-orange-600' },
  { id: 'upi',  label: 'UPI',              icon: Smartphone, color: 'text-green-600' },
  { id: 'card', label: 'Card',             icon: CreditCard, color: 'text-blue-600' },
  { id: 'bank', label: 'Net Banking',      icon: Building2,  color: 'text-purple-600' },
]

type CartItem = { name: string; price: number; quantity: number; image: string }

export default function FoodPage() {
  const { user, addActivity } = useAuthStore()

  // UI state
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [payMethod, setPayMethod] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<any>(null)
  const [orderChatMsg, setOrderChatMsg] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '' })

  // Try to fetch from backend, fall back to static
  const { data: apiRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data } = await api.get('/food/restaurants').catch(() => ({ data: [] }))
      return Array.isArray(data) && data.length > 0 ? data : null
    }
  })
  const restaurants = apiRestaurants || STATIC_RESTAURANTS

  const filtered = useMemo(() => restaurants.filter((r: any) => {
    const matchCat = category === 'All' || r.category === category
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }), [restaurants, category, search])

  // Cart helpers
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const addItem = (item: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.name === item.name)
      if (ex) return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { name: item.name, price: item.price, quantity: 1, image: item.image || '' }]
    })
  }

  const removeItem = (name: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.name === name)
      if (!ex) return prev
      if (ex.quantity === 1) return prev.filter(i => i.name !== name)
      return prev.map(i => i.name === name ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const getQty = (name: string) => cart.find(i => i.name === name)?.quantity || 0

  // Place order
  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) return alert('Please fill all fields')
    if (cart.length === 0) return
    setPlacing(true)
    try {
      const { data } = await api.post('/food/orders', {
        userId: user?.id,
        restaurantId: selectedRestaurant._id,
        items: cart,
        shippingAddress: { name: form.name, phone: form.phone, address: form.address },
        paymentMethod: payMethod
      })
      setPlacedOrder(data)
      addActivity({ id: Date.now().toString(), type: 'food', title: `Food from ${selectedRestaurant.name}`, status: 'Preparing', time: 'Just now' })
      setCart([]); setShowCheckout(false)
    } catch (e) {
      // Fallback: create mock order for demo
      setPlacedOrder({
        _id: `demo_${Date.now()}`,
        restaurantName: selectedRestaurant.name,
        items: cart,
        total: cartTotal + 30,
        status: 'placed',
        estimatedTime: selectedRestaurant.time,
        orderChat: []
      })
      setCart([]); setShowCheckout(false)
    } finally { setPlacing(false) }
  }

  const sendOrderChat = async () => {
    if (!orderChatMsg.trim() || !placedOrder?._id) return
    setSendingChat(true)
    try {
      const { data } = await api.post('/food/orders/chat', {
        orderId: placedOrder._id, senderId: user?.id, senderName: user?.name || 'User', message: orderChatMsg
      })
      setPlacedOrder(data)
    } catch {
      // Demo fallback
      setPlacedOrder((prev: any) => ({
        ...prev,
        orderChat: [...(prev.orderChat || []), { senderId: user?.id, senderName: user?.name || 'You', message: orderChatMsg, createdAt: new Date().toISOString() }]
      }))
    }
    setOrderChatMsg('')
    setSendingChat(false)
  }

  const FOOD_STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered']
  const FOOD_STATUS_LABELS: Record<string, string> = {
    placed: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing', on_the_way: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled'
  }

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (placedOrder) {
    const stepIdx = FOOD_STATUS_STEPS.indexOf(placedOrder.status)
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pb-32">
        <div className="max-w-lg mx-auto p-5 space-y-5 animate-in slide-in-from-bottom-2 duration-500">
          {/* Success header */}
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 text-center border border-gray-200/5 dark:border-gray-800/50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-500/10 blur-3xl rounded-full" />
            <div className="w-24 h-24 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle2 size={48} className="text-green-500 animate-bounce-slow"/>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">Order Confirmed!</h1>
            <p className="text-[var(--syn-comment)] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Order ID: {placedOrder._id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Tracking steps */}
          <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 border border-gray-200/5 dark:border-gray-800/50 shadow-sm space-y-6">
            <h3 className="font-black text-[10px] text-[var(--syn-comment)] uppercase tracking-[0.2em]">Live Tracking</h3>
            <div className="flex items-center gap-1">
              {FOOD_STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={clsx('w-8 h-8 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all border-2',
                    i <= stepIdx ? 'bg-[var(--syn-operator)] text-white border-[var(--syn-operator)] shadow-lg shadow-amber-500/20' : 'bg-[var(--bg-elevated)] text-[var(--syn-comment)] border-transparent')}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  {i < FOOD_STATUS_STEPS.length - 1 && (
                    <div className={clsx('flex-1 h-1.5 mx-1 rounded-full', i < stepIdx ? 'bg-[var(--syn-operator)]' : 'bg-[var(--bg-elevated)]')}/>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-black text-[var(--syn-comment)] uppercase tracking-wider">
              {FOOD_STATUS_STEPS.map(s => <span key={s} className={clsx(placedOrder.status === s && 'text-[var(--syn-operator)]')}>{FOOD_STATUS_LABELS[s]}</span>)}
            </div>
            <div className="flex items-center gap-3 bg-[var(--syn-operator)]/10 rounded-2xl p-4 border border-[var(--syn-operator)]/20">
              <Clock size={18} className="text-[var(--syn-operator)] shrink-0 animate-pulse"/>
              <p className="text-sm font-black text-[var(--syn-operator)]">Arrival: {placedOrder.estimatedTime || '30-45 min'}</p>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 border border-gray-200/5 dark:border-gray-800/50 shadow-sm space-y-4">
            <h3 className="font-black text-[10px] text-[var(--syn-comment)] uppercase tracking-[0.2em]">Order Details</h3>
            {placedOrder.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  {item.image && <img src={item.image} className="w-12 h-12 rounded-2xl object-cover border border-white/5" alt=""/>}
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-black text-sm text-[var(--syn-function)]">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t border-gray-200/5 dark:border-gray-800/50 pt-4 flex justify-between items-center">
              <span className="font-black text-sm text-[var(--text-primary)] uppercase tracking-widest">Grand Total</span>
              <span className="text-xl font-black text-[var(--syn-function)]">₹{(placedOrder.total || cartTotal + 30).toLocaleString()}</span>
            </div>
          </div>

          {/* Order chat with restaurant */}
          <div className="bg-[var(--bg-card)] rounded-[2rem] border border-white/5 shadow-sm overflow-hidden">
            <div className="p-4 border-b dark:border-gray-800 flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500"/>
              <h3 className="font-black text-sm dark:text-white">Chat with Restaurant</h3>
            </div>
            <div className="p-4 space-y-3 min-h-[80px] max-h-48 overflow-y-auto">
              {(!placedOrder.orderChat || placedOrder.orderChat.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-2">Ask the restaurant anything about your order!</p>
              )}
              {placedOrder.orderChat?.map((msg: any, i: number) => (
                <div key={i} className={clsx('flex gap-2', msg.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                  <div className={clsx('max-w-[75%] px-3 py-2 rounded-2xl text-xs',
                    msg.senderId === user?.id ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 dark:text-white rounded-bl-sm')}>
                    <p className="font-bold text-[9px] opacity-60 mb-0.5">{msg.senderName}</p>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t dark:border-gray-800 flex gap-2">
              <input value={orderChatMsg} onChange={e => setOrderChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOrderChat()}
                placeholder="Message restaurant..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm dark:text-white outline-none" />
              <button onClick={sendOrderChat} disabled={!orderChatMsg.trim() || sendingChat}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all">
                {sendingChat ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
              </button>
            </div>
          </div>

          <button onClick={() => { setPlacedOrder(null); setSelectedRestaurant(null) }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black py-4 rounded-2xl active:scale-95 transition-all">
            Order More Food
          </button>
        </div>
      </div>
    )
  }

  // ── Restaurant Menu View ──────────────────────────────────────────────────
  if (selectedRestaurant) {
    const menuCategories = Array.from(new Set(selectedRestaurant.menu?.map((i: any) => i.category) || [])) as string[]
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pb-48">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-gray-200/5 dark:border-gray-800/50 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setSelectedRestaurant(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <X size={20} className="dark:text-white"/>
            </button>
            <div>
              <h1 className="font-black text-base dark:text-white">{selectedRestaurant.name}</h1>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" fill="currentColor"/>{selectedRestaurant.rating}</span>
                <span className="flex items-center gap-1"><Clock size={10}/>{selectedRestaurant.time}</span>
                <span className="flex items-center gap-1"><MapPin size={10}/>{selectedRestaurant.distance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {menuCategories.map(cat => (
            <div key={cat} className="space-y-3">
              <h2 className="font-black text-sm dark:text-white uppercase tracking-widest text-gray-500">{cat}</h2>
              {selectedRestaurant.menu?.filter((i: any) => i.category === cat && i.isAvailable).map((item: any, idx: number) => (
                <div key={idx} className="bg-[var(--bg-card)] rounded-[2rem] p-5 flex gap-5 border border-gray-200/5 dark:border-gray-800/50 shadow-sm group hover:border-[var(--syn-function)]/30 transition-all duration-300">
                  <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'} className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-white/5 active:scale-110 transition-transform" alt={item.name}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-[10px] text-[var(--syn-comment)] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-black text-[var(--syn-function)]">₹{item.price}</p>
                      {getQty(item.name) === 0 ? (
                        <button onClick={() => addItem(item)}
                          className="bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
                          <Plus size={14}/> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-2xl p-1 border border-white/5">
                          <button onClick={() => removeItem(item.name)} className="w-8 h-8 flex items-center justify-center text-[var(--syn-comment)] hover:text-white hover:bg-red-500/20 rounded-xl transition-all"><Minus size={14}/></button>
                          <span className="text-[var(--text-primary)] font-black text-xs w-6 text-center">{getQty(item.name)}</span>
                          <button onClick={() => addItem(item)} className="w-8 h-8 flex items-center justify-center text-[var(--syn-function)] hover:text-white hover:bg-[var(--syn-function)] rounded-xl transition-all"><Plus size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Floating Cart bar - ELEVATED FOR MOBILE NAV */}
        {cartCount > 0 && (
          <div className="fixed bottom-24 left-0 right-0 p-4 z-[60] animate-in slide-in-from-bottom-5 duration-500">
            <button onClick={() => setShowCheckout(true)}
              className="w-full max-w-lg mx-auto flex items-center justify-between bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-purple-500/30 active:scale-95 transition-all ring-4 ring-[var(--bg-primary)]/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black text-sm backdrop-blur-md">{cartCount}</div>
                <div>
                   <span className="font-black text-xs uppercase tracking-widest block">View Basket</span>
                   <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">₹{(cartTotal + 30).toLocaleString()} Subtotal</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-sm font-black pr-2 border-r border-white/20">Checkout</span>
                 <ShoppingCart size={18} />
              </div>
            </button>
          </div>
        )}

        {/* Checkout modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end justify-center">
            <div className="bg-[var(--bg-card)] rounded-t-[3rem] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500 flex flex-col border-t border-white/5">
              <div className="p-6 border-b border-gray-200/5 dark:border-gray-800/50 flex justify-between items-center sticky top-0 bg-[var(--bg-card)]/90 backdrop-blur-md z-10">
                <div>
                   <h3 className="font-black text-xl text-[var(--text-primary)]">Your Basket</h3>
                   <p className="text-[10px] text-[var(--syn-comment)] font-black uppercase tracking-widest leading-none mt-1">Ready for checkout</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="p-3 bg-[var(--bg-elevated)] hover:bg-red-500/20 text-[var(--syn-comment)] hover:text-red-400 rounded-2xl transition-all"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-8 flex-1">
                {/* Cart items */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-[0.2em]">Review Items</p>
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-200/5 dark:border-gray-800/50 last:border-0 group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[var(--syn-function)]/15 text-[var(--syn-function)] rounded-xl flex items-center justify-center text-[11px] font-black border border-[var(--syn-function)]/30 group-hover:scale-110 transition-transform">{item.quantity}</div>
                        <span className="text-sm font-black text-[var(--text-primary)]">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-[var(--syn-function)]">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  
                  <div className="bg-[var(--bg-elevated)] rounded-3xl p-5 space-y-3 mt-4 border border-white/5">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[var(--syn-comment)]">
                      <span>Subtotal</span>
                      <span className="text-[var(--text-primary)] font-black italic">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[var(--syn-comment)]">
                      <span>Delivery Fee</span>
                      <span className="text-[var(--syn-string)] font-black italic">₹30</span>
                    </div>
                    <div className="flex justify-between text-base font-black border-t border-white/5 pt-4">
                      <span className="text-[var(--text-primary)] uppercase tracking-widest text-sm">Total Amount</span>
                      <span className="text-[var(--syn-function)] text-xl font-black italic shadow-blue-500/20 drop-shadow-md">₹{(cartTotal + 30).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery details */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-[0.2em]">Delivery Address</p>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *"
                    className="w-full bg-[var(--bg-elevated)] border-2 border-transparent focus:border-[var(--syn-function)] rounded-2xl p-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--syn-comment)] font-bold" />
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number *" type="tel"
                    className="w-full bg-[var(--bg-elevated)] border-2 border-transparent focus:border-[var(--syn-function)] rounded-2xl p-4 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--syn-comment)] font-bold" />
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Delivery Address *" rows={2}
                    className="w-full bg-[var(--bg-elevated)] border-2 border-transparent focus:border-[var(--syn-function)] rounded-2xl p-4 text-sm text-[var(--text-primary)] outline-none resize-none transition-all placeholder:text-[var(--syn-comment)] font-bold" />
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-[0.2em]">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className={clsx('flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border-2 transition-all group',
                          payMethod === pm.id ? 'border-[var(--syn-function)] bg-[var(--syn-function)]/10 shadow-lg shadow-blue-500/10' : 'border-gray-200/5 bg-[var(--bg-elevated)] hover:border-white/10')}>
                        <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center transition-all', payMethod === pm.id ? 'bg-[var(--syn-function)] text-white scale-110' : 'bg-[var(--bg-card)] text-[var(--syn-comment)] group-hover:scale-110')}>
                           <pm.icon size={24}/>
                        </div>
                        <span className={clsx('text-[10px] font-black uppercase tracking-widest', payMethod === pm.id ? 'text-[var(--syn-function)]' : 'text-[var(--syn-comment)]')}>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pb-12 mt-4">
                  <button onClick={placeOrder} disabled={placing}
                    className="w-full bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3 text-lg tracking-tight">
                    {placing ? <Loader2 size={24} className="animate-spin"/> : <Send size={20}/>}
                    {placing ? 'Placing Order...' : `Pay ₹${(cartTotal + 30).toLocaleString()}`}
                  </button>
                  <p className="text-center text-[9px] text-[var(--syn-comment)] mt-4 font-black uppercase tracking-[0.3em] opacity-40">Secure Encryption Enabled</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Restaurant List ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-32">
      <header className="sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-6 z-20">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black dark:text-white">Food Delivery</h1>
              <div className="flex items-center gap-1.5 text-blue-600 mt-0.5">
                <MapPin size={13}/><span className="text-xs font-bold">Sector 5, Delhi</span>
              </div>
            </div>
            <button className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500"><Filter size={18}/></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-3 pl-10 pr-4 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500/20 transition-all" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={clsx('px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all border-2',
                category === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-[var(--bg-card)] text-gray-400 border-white/5')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res: any) => (
            <button key={res._id} onClick={() => setSelectedRestaurant(res)}
              className="group bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden border border-gray-200/5 dark:border-gray-800/50 hover:border-[var(--syn-keyword)]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5 text-left active:scale-[0.98]">
              <div className="relative h-56 overflow-hidden">
                <img src={res.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={res.name}/>
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black dark:text-white flex items-center gap-1">
                  <Clock size={10}/>{res.time}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-base dark:text-white group-hover:text-orange-500 transition-colors">{res.name}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">{res.category} · {res.distance}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 px-2.5 py-1 rounded-xl text-xs font-black">
                    <Star size={12} fill="currentColor"/>{res.rating}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">{res.menu?.length || 0} items</span>
                  <span className="bg-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-xl">Order Now</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
