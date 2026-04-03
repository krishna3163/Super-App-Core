'use client'

import { 
  BarChart3, TrendingUp, Users, ShoppingBag, 
  ArrowUpRight, ArrowDownRight, Calendar,
  Filter, Download, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

export default function BusinessAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const stats = [
    { label: 'Total Revenue', value: '₹42,840', change: '+12.5%', trend: 'up', color: 'text-emerald-600' },
    { label: 'Total Orders', value: '156', change: '+8.2%', trend: 'up', color: 'text-blue-600' },
    { label: 'New Customers', value: '42', change: '-3.1%', trend: 'down', color: 'text-orange-600' },
    { label: 'Conversion Rate', value: '4.8%', change: '+1.2%', trend: 'up', color: 'text-purple-600' },
  ]

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Business Analytics</h1>
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time performance metrics</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['24h', '7d', '30d', '90d', 'All'].map(range => (
                <button key={range} onClick={() => setTimeRange(range)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        timeRange === range ? 'bg-white text-emerald-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}>
                    {range}
                </button>
            ))}
        </div>
      </header>

      <main className="px-6 -mt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            {stats.map(stat => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-2 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        <span className="text-[10px] font-black">{stat.change}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Charts Placeholder */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">Revenue Growth</h2>
                <button className="p-2 text-slate-400"><Filter size={16} /></button>
            </div>
            
            <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                    <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-t-lg relative group transition-all hover:bg-emerald-500" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{h * 100}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 px-2">
                <span className="text-[8px] font-black text-slate-400 uppercase">Mon</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">Wed</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">Fri</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">Sun</span>
            </div>
        </div>

        {/* Top Products/Services */}
        <div className="space-y-4">
            <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">Top Performance</h2>
            <div className="space-y-3">
                {[
                    { name: 'Evening Ride CP to Saket', sales: 42, revenue: '₹12,400', icon: '🛺' },
                    { name: 'Butter Chicken Special', sales: 38, revenue: '₹8,200', icon: '🍛' },
                    { name: 'Airport Pickup (SUV)', sales: 25, revenue: '₹15,000', icon: '🚙' }
                ].map(item => (
                    <div key={item.name} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-slate-800 dark:text-white">{item.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sales} sales</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-emerald-600">{item.revenue}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            <Download size={14} /> Export Report (PDF)
        </button>
      </main>
    </div>
  )
}
