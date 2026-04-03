'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import {
  ArrowLeft, Heart, Share2, ShoppingCart, MessageCircle,
  MapPin, ShieldCheck, Star, X, Loader2, CreditCard,
  Smartphone, Truck, Banknote, Building2, CheckCircle2
} from 'lucide-react'
import clsx from 'clsx'

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI',              icon: Smartphone, color: 'text-green-600' },
  { id: 'card', label: 'Card',             icon: CreditCard, color: 'text-blue-600' },
  { id: 'cod',  label: 'Cash on Delivery', icon: Banknote,   color: 'text-orange-600' },
  { id: 'bank', label: 'Net Banking',      icon: Building2,  color: 'text-purple-600' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, addActivity } = useAuthStore()

  const [showCheckout, setShowCheckout] = useState(false)
  const [payMethod, setPayMethod] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '', pincode: '' })

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/marketplace/products/${id}`)
      return data
    },
    enabled: !!id
  })

  const addToCart = async () => {
    if (!user?.id || !product) return
    await api.post('/cart/add', { userId: user.id, productId: product._id, quantity: 1, price: product.price }).catch(() => {})
    alert('Added to cart!')
  }

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) return alert('Please fill all required fields')
    setPlacing(true)
    try {
      const { data } = await api.post('/orders/place', {
        userId: user?.id,
        vendorId: product.sellerId,
        items: [{ productId: product._id, name: product.title, image: product.images?.[0] || '', quantity: 1, price: product.price }],
        totalAmount: product.price + 40,
        shippingAddress: { name: form.name, phone: form.phone, addressLine1: form.address, city: form.city, pincode: form.pincode },
        paymentMethod: payMethod
      })
      setOrderId(data._id)
      setOrdered(true)
      addActivity({ id: Date.now().toString(), type: 'purchase', title: `Ordered: ${product.title}`, status: 'Confirmed', time: 'Just now' })
    } catch (e) { console.error(e); alert('Order failed, try again') }
    finally { setPlacing(false) }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 size={32} className="animate-spin text-blue-600"/></div>
  if (!product) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 text-red-500">Product not found</div>

  if (ordered) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={48} className="text-green-600"/>
      </div>
      <h1 className="text-3xl font-black dark:text-white mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-2">Order #{orderId.slice(-8).toUpperCase()}</p>
      <p className="text-gray-400 text-sm mb-8">Estimated delivery in 3-5 days</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => router.push('/marketplace/orders')} className="bg-blue-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">Track Order</button>
        <Link href={`/chat/${product.sellerId}`} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl text-center flex items-center justify-center gap-2">
          <MessageCircle size={18}/> Chat with Seller
        </Link>
        <button onClick={() => router.push('/marketplace')} className="text-blue-600 font-bold text-sm">Continue Shopping</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 px-4 py-3 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ArrowLeft size={20} className="dark:text-white"/></button>
          <h1 className="font-black text-base dark:text-white truncate max-w-[200px]">{product.title}</h1>
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><Share2 size={19} className="dark:text-white"/></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><Heart size={19} className="dark:text-white"/></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Image */}
        <div className="aspect-square md:aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden md:rounded-3xl md:mt-4 md:mx-4">
          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} className="w-full h-full object-cover" alt={product.title} />
        </div>

        <div className="p-5 space-y-5">
          {/* Title + Price */}
          <div>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{product.category}</span>
            <h2 className="text-2xl font-black dark:text-white mt-2">{product.title}</h2>
            <div className="flex items-baseline gap-3 mt-1">
              <p className="text-3xl font-black text-blue-600">₹{product.price?.toLocaleString()}</p>
              <span className="text-sm text-gray-400 line-through">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
              <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">17% OFF</span>
            </div>
          </div>

          {/* Location */}
          {product.location?.address && (
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <MapPin size={18} className="text-gray-400 shrink-0"/>
              <p className="text-sm font-bold dark:text-white">{product.location.address}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-black text-base dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Seller */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg uppercase">
                {product.sellerId?.[0] || 'S'}
              </div>
              <div>
                <p className="font-black text-sm dark:text-white">{product.sellerId || 'Seller'}</p>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={11} fill="currentColor"/>
                  <span className="text-[10px] font-black">4.8 · Verified Seller</span>
                </div>
              </div>
            </div>
            <Link href={`/chat/${product.sellerId}`}
              className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">
              <MessageCircle size={15}/> Chat
            </Link>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <ShieldCheck size={15}/>
            <span className="text-[10px] font-bold uppercase tracking-widest">Protected by SuperApp Buyer Guarantee</span>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t dark:border-gray-800 p-4 flex gap-3 z-30">
        <button onClick={addToCart} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <ShoppingCart size={18}/> Add to Cart
        </button>
        <button onClick={() => setShowCheckout(true)} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
          Buy Now
        </button>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] w-full max-w-lg shadow-2xl border-t dark:border-gray-800 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="font-black text-lg dark:text-white">Checkout</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Order summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex gap-3">
                <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate">{product.title}</p>
                  <p className="text-blue-600 font-black">₹{product.price?.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">+ ₹40 delivery</p>
                </div>
              </div>

              {/* Delivery details */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Details</p>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none transition-all" />
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number *" type="tel"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none transition-all" />
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full Address *" rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none resize-none transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City"
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none" />
                  <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="Pincode"
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none" />
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                      className={clsx('flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all',
                        payMethod === pm.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800')}>
                      <pm.icon size={20} className={payMethod === pm.id ? 'text-blue-600' : pm.color}/>
                      <span className={clsx('text-xs font-black', payMethod === pm.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400')}>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Product</span><span className="font-bold dark:text-white">₹{product.price?.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="font-bold dark:text-white">₹40</span></div>
                <div className="flex justify-between text-base border-t dark:border-gray-700 pt-2 mt-2">
                  <span className="font-black dark:text-white">Total</span>
                  <span className="font-black text-blue-600">₹{(product.price + 40)?.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={placeOrder} disabled={placing}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {placing && <Loader2 size={16} className="animate-spin"/>}
                {placing ? 'Placing Order...' : `Place Order · ₹${(product.price + 40)?.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
