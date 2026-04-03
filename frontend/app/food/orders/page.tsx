'use client'

import { useState } from 'react'
import { 
  Receipt, Clock, CheckCircle2, XCircle, 
  MapPin, Phone, MessageCircle, ShoppingBag,
  TrendingUp, Star, ChevronRight, AlertCircle
} from 'lucide-react'

export default function FoodOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-5542',
      customer: 'Rahul Gupta',
      items: ['Butter Paneer (2)', 'Tandoori Roti (4)', 'Dal Makhani'],
      total: 840.00,
      status: 'new',
      time: 'Just now',
      address: 'Vasant Kunj, Sector B'
    },
    {
      id: 'ORD-5539',
      customer: 'Priya Sharma',
      items: ['Chicken Biryani (Large)', 'Salad', 'Coke (500ml)'],
      total: 520.00,
      status: 'preparing',
      time: '12 mins ago',
      address: 'GK-2, Block E'
    },
    {
      id: 'ORD-5535',
      customer: 'Aman Deep',
      items: ['Masala Dosa', 'Filter Coffee'],
      total: 210.00,
      status: 'ready',
      time: '25 mins ago',
      address: 'Lajpat Nagar IV'
    }
  ])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="bg-red-600 dark:bg-red-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Restaurant Panel</h1>
            <p className="text-red-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Accepting Orders · Kitchen Active</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Receipt size={24} />
          </div>
        </div>
      </header>

      <main className="px-6 -mt-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex justify-around">
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incoming</p>
                <p className="text-xl font-black text-red-600">3</p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">5</p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earnings</p>
                <p className="text-xl font-black text-emerald-600">₹4.2k</p>
            </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">Live Orders</h2>
          
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">#{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{order.time}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === 'new' ? 'bg-red-100 text-red-600' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-1">{order.customer}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{order.items.join(', ')}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-black text-lg text-slate-800 dark:text-white">₹{order.total.toFixed(2)}</p>
                  <div className="flex gap-2">
                    {order.status === 'new' ? (
                      <>
                        <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                          <XCircle size={18} />
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                          Accept Order
                        </button>
                      </>
                    ) : (
                      <button className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                        Mark as Ready
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
