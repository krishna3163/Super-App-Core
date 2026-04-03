'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import Link from 'next/link'
import {
  ChevronLeft, Package, Clock, CheckCircle2, Truck,
  AlertCircle, MessageCircle, MapPin, Send, X, ChevronDown, ChevronUp
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
}
const STATUS_ICONS: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle2, processing: Package,
  shipped: Truck, out_for_delivery: Truck, delivered: CheckCircle2, cancelled: AlertCircle
}

function OrderCard({ order }: { order: any }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showChat, setShowChat] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [sending, setSending] = useState(false)

  const stepIdx = STATUS_STEPS.indexOf(order.status)
  const Icon = STATUS_ICONS[order.status] || Package

  const sendChat = async () => {
    if (!chatMsg.trim()) return
    setSending(true)
    try {
      await api.post(`/orders/${order._id}/chat`, { senderId: user?.id, senderName: user?.name || 'User', message: chatMsg })
      qc.invalidateQueries({ queryKey: ['orders', user?.id] })
      setChatMsg('')
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm border dark:border-gray-800">
      {/* Order header */}
      <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
          <p className="text-sm font-black dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
          <p className="text-xs font-bold dark:text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-5 space-y-3">
        {order.items?.map((item: any, i: number) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0">
              <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm dark:text-white truncate">{item.name || `Product ${i+1}`}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status + tracking toggle */}
      <div className="px-5 pb-3">
        <button onClick={() => setShowTracking(!showTracking)}
          className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center gap-2">
            <Icon size={18} className={order.status === 'delivered' ? 'text-green-500' : order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'}/>
            <span className={clsx('text-xs font-black uppercase tracking-widest',
              order.status === 'delivered' ? 'text-green-500' : order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500')}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            {order.tracking?.estimatedDelivery && (
              <span className="text-[10px] font-bold">ETA: {new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            )}
            {showTracking ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </div>
        </button>
      </div>

      {/* Tracking steps */}
      {showTracking && (
        <div className="px-5 pb-4 space-y-3">
          {/* Progress bar */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center gap-1 mb-4">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all',
                    i <= stepIdx ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400')}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={clsx('flex-1 h-1 mx-0.5 rounded-full transition-all', i < stepIdx ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700')}/>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Current location */}
          {order.tracking?.currentLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={14} className="text-blue-500 shrink-0"/>
              <span className="font-bold">{order.tracking.currentLocation}</span>
            </div>
          )}

          {/* Event timeline */}
          <div className="space-y-2 mt-2">
            {order.tracking?.events?.slice().reverse().map((ev: any, i: number) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', i === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600')}/>
                <div>
                  <p className="text-xs font-black dark:text-white">{ev.status}</p>
                  {ev.description && <p className="text-[10px] text-gray-400">{ev.description}</p>}
                  {ev.location && <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={9}/>{ev.location}</p>}
                  <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">{new Date(ev.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="px-5 pb-5 flex items-center justify-between border-t dark:border-gray-800 pt-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
          <p className="text-lg font-black text-blue-600">₹{order.totalAmount?.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">
          <MessageCircle size={15}/> {showChat ? 'Close Chat' : 'Chat with Seller'}
        </button>
      </div>

      {/* Order chat */}
      {showChat && (
        <div className="border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
          <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
            {order.orderChat?.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No messages yet. Ask the seller anything!</p>
            )}
            {order.orderChat?.map((msg: any, i: number) => (
              <div key={i} className={clsx('flex gap-2', msg.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                <div className={clsx('max-w-[75%] px-3 py-2 rounded-2xl text-xs',
                  msg.senderId === user?.id ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-bl-sm')}>
                  <p className="font-bold text-[9px] opacity-60 mb-0.5">{msg.senderName}</p>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 flex gap-2 border-t dark:border-gray-800">
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Message seller..."
              className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-sm dark:text-white outline-none focus:ring-2 ring-blue-500/20" />
            <button onClick={sendChat} disabled={!chatMsg.trim() || sending}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all">
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { user, isReady } = useAuth()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/user/${user?.id}`)
      return Array.isArray(data) ? data : []
    },
    enabled: !!user?.id
  })

  if (!isReady || isLoading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 px-5 py-4 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/marketplace" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><ChevronLeft size={20} className="dark:text-white"/></Link>
          <h1 className="text-xl font-black dark:text-white">Your Orders</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-[2rem] text-center space-y-4 border dark:border-gray-800">
            <Package size={48} className="mx-auto text-gray-300"/>
            <h2 className="text-xl font-black dark:text-white">No orders yet</h2>
            <p className="text-gray-500 text-sm">When you buy something, it will appear here.</p>
            <Link href="/marketplace" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm">Shop Now</Link>
          </div>
        ) : orders.map((order: any) => <OrderCard key={order._id} order={order} />)}
      </main>
    </div>
  )
}
