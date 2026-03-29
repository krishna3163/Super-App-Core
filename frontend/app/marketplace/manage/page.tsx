'use client'

import { useState } from 'react'
import { 
  Store, Plus, Package, Edit3, Trash2, 
  Eye, ShoppingCart, TrendingUp, AlertCircle,
  MoreVertical, CheckCircle2, XCircle
} from 'lucide-react'

export default function MarketplaceManagePage() {
  const [listings, setListings] = useState([
    { id: '1', name: 'iPhone 15 Pro - Titanium', price: '₹1,24,900', status: 'active', views: 420, orders: 3, img: '📱' },
    { id: '2', name: 'MacBook Air M2 (8GB/256GB)', price: '₹94,000', status: 'sold', views: 850, orders: 1, img: '💻' },
    { id: '3', name: 'Sony WH-1000XM5 Headphones', price: '₹24,500', status: 'active', views: 125, orders: 0, img: '🎧' },
  ])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="bg-orange-500 dark:bg-orange-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight">My Listings</h1>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Manage your products & sales</p>
          </div>
          <button className="bg-white text-orange-600 p-3 rounded-2xl shadow-lg active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="px-6 -mt-6 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex justify-around">
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                <p className="text-xl font-black text-orange-600">5</p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Views</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">1.4k</p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                <p className="text-xl font-black text-emerald-600">₹2.1L</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">Recent Listings</h2>
                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-3">
                {listings.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                            {item.img}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 dark:text-white truncate">{item.name}</p>
                            <p className="text-xs font-bold text-orange-600 mt-0.5">{item.price}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                    <Eye size={10} /> {item.views}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                    <ShoppingCart size={10} /> {item.orders}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                    item.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <Edit3 size={16} className="text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                <Trash2 size={16} className="text-red-400" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-blue-600" />
                <p className="font-black text-blue-900 dark:text-blue-200 text-xs uppercase tracking-tight">Pro Tip</p>
            </div>
            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                Items with at least 3 high-quality images sell 4x faster. Update your listings to boost visibility!
            </p>
        </div>
      </main>
    </div>
  )
}
