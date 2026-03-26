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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        <div className="max-w-lg mx-auto p-5 space-y-5">
          {/* Success header */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 text-center border dark:border-gray-800 shadow-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-green-600"/>
            </div>
            <h1 className="text-2xl font-black dark:text-white">Order Placed!</h1>
            <p className="text-gray-500 text-sm mt-1">#{placedOrder._id.slice(-8).toUpperCase()}</p>
            <p className="text-gray-400 text-xs mt-1">from <span className="font-bold text-blue-600">{placedOrder.restaurantName || selectedRestaurant?.name}</span></p>
          </div>

          {/* Tracking steps */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 border dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-black text-sm dark:text-white uppercase tracking-widest">Order Status</h3>
            <div className="flex items-center gap-1">
              {FOOD_STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all',
                    i <= stepIdx ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400')}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  {i < FOOD_STATUS_STEPS.length - 1 && (
                    <div className={clsx('flex-1 h-1 mx-0.5 rounded-full', i < stepIdx ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700')}/>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {FOOD_STATUS_STEPS.map(s => <span key={s}>{FOOD_STATUS_LABELS[s]}</span>)}
            </div>
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
              <Clock size={16} className="text-orange-500 shrink-0"/>
              <p className="text-sm font-bold text-orange-600">Estimated: {placedOrder.estimatedTime || '30-45 min'}</p>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 border dark:border-gray-800 shadow-sm space-y-3">
            <h3 className="font-black text-sm dark:text-white uppercase tracking-widest">Your Order</h3>
            {placedOrder.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.image && <img src={item.image} className="w-10 h-10 rounded-xl object-cover" alt=""/>}
                  <div>
                    <p className="text-sm font-bold dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-gray-400">x{item.quantity}</p>
                  </div>
                </div>
                <p className="font-black text-sm text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t dark:border-gray-800 pt-3 flex justify-between">
              <span className="font-black dark:text-white">Total</span>
              <span className="font-black text-blue-600">₹{(placedOrder.total || cartTotal + 30).toLocaleString()}</span>
            </div>
          </div>

          {/* Order chat with restaurant */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800 shadow-sm overflow-hidden">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 z-20">
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
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-4 flex gap-4 border dark:border-gray-800 shadow-sm">
                  <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt={item.name}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-black text-blue-600">₹{item.price}</p>
                      {getQty(item.name) === 0 ? (
                        <button onClick={() => addItem(item)}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 active:scale-90 transition-all">
                          <Plus size={14}/> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-blue-600 rounded-xl overflow-hidden">
                          <button onClick={() => removeItem(item.name)} className="p-1.5 text-white hover:bg-blue-700 transition-colors"><Minus size={14}/></button>
                          <span className="text-white font-black text-sm w-5 text-center">{getQty(item.name)}</span>
                          <button onClick={() => addItem(item)} className="p-1.5 text-white hover:bg-blue-700 transition-colors"><Plus size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Cart bar */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-30">
            <button onClick={() => setShowCheckout(true)}
              className="w-full max-w-lg mx-auto flex items-center justify-between bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-300 dark:shadow-none active:scale-95 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">{cartCount}</div>
                <span className="font-black">View Cart</span>
              </div>
              <span className="font-black">₹{(cartTotal + 30).toLocaleString()}</span>
            </button>
          </div>
        )}

        {/* Checkout modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4">
              <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h3 className="font-black text-lg dark:text-white">Checkout</h3>
                <button onClick={() => setShowCheckout(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
              </div>
              <div className="p-5 space-y-5">
                {/* Cart items */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Order</p>
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                        <span className="text-sm font-bold dark:text-white">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-gray-500">Delivery fee</span>
                    <span className="font-bold dark:text-white">₹30</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t dark:border-gray-800 pt-2">
                    <span className="dark:text-white">Total</span>
                    <span className="text-blue-600">₹{(cartTotal + 30).toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery details */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Details</p>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none transition-all" />
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number *" type="tel"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none transition-all" />
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Delivery Address *" rows={2}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none resize-none transition-all" />
                </div>

                {/* Payment */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className={clsx('flex items-center gap-2 p-3 rounded-2xl border-2 transition-all',
                          payMethod === pm.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800')}>
                        <pm.icon size={18} className={payMethod === pm.id ? 'text-blue-600' : pm.color}/>
                        <span className={clsx('text-xs font-black', payMethod === pm.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400')}>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={placeOrder} disabled={placing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {placing && <Loader2 size={16} className="animate-spin"/>}
                  {placing ? 'Placing Order...' : `Place Order · ₹${(cartTotal + 30).toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Restaurant List ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 px-5 py-4 z-20">
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
                category === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res: any) => (
            <button key={res._id} onClick={() => setSelectedRestaurant(res)}
              className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border-2 border-gray-50 dark:border-gray-800 hover:border-orange-400/50 transition-all duration-300 hover:shadow-xl text-left">
              <div className="relative h-48 overflow-hidden">
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
