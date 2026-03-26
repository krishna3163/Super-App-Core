'use client'

import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { LayoutDashboard, ShoppingCart, TrendingUp, Users, Package, Settings, ToggleLeft as Toggle } from 'lucide-react'
import { useState } from 'react'

export default function BusinessDashboardPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['business-summary', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/business-dashboard/summary/${user?.id}`)
      return data
    },
    enabled: !!user?.id
  })

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-500">Business mode not enabled or service error.</div>

  const { profile, seller, driver } = dashboard

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Dashboard Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-black text-blue-600 tracking-tighter uppercase">Business Hub</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} />
            <span className="font-bold text-sm">Overview</span>
          </button>
          
          {profile.roles?.includes('seller') && (
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Package size={20} />
              <span className="font-bold text-sm">My Products</span>
            </button>
          )}

          {profile.roles?.includes('restaurant') && (
            <button onClick={() => setActiveTab('restaurant')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'restaurant' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <ShoppingCart size={20} />
              <span className="font-bold text-sm">Food Orders</span>
            </button>
          )}

          {profile.roles?.includes('driver') && (
            <button onClick={() => setActiveTab('driver')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'driver' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Users size={20} />
              <span className="font-bold text-sm">Driver Trips</span>
            </button>
          )}

          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <TrendingUp size={20} />
            <span className="font-bold text-sm">Analytics</span>
          </button>
        </nav>
        <div className="p-4 border-t dark:border-gray-800">
           <button className="flex items-center gap-3 p-3 w-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
             <Settings size={20} />
             <span className="font-bold text-sm">Business Settings</span>
           </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black dark:text-white capitalize">{activeTab}</h1>
            <p className="text-gray-500 text-sm">Managing your {profile.roles.join(' & ')} business.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Business Active
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800 space-y-2 hover:border-blue-500 transition-colors">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Earnings</p>
            <p className="text-3xl font-black dark:text-white">${profile.totalEarnings}</p>
            <p className="text-[10px] text-green-500 font-bold">+12% from last month</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800 space-y-2 hover:border-blue-500 transition-colors">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Orders</p>
            <p className="text-3xl font-black dark:text-white">{profile.totalOrders}</p>
            <p className="text-[10px] text-blue-500 font-bold">4 pending review</p>
          </div>
          {seller && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800 space-y-2 hover:border-blue-500 transition-colors">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Products</p>
              <p className="text-3xl font-black dark:text-white">{seller.totalProducts}</p>
              <p className="text-[10px] text-gray-400 font-bold">Across all categories</p>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800 space-y-2 hover:border-blue-500 transition-colors">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Engagement</p>
            <p className="text-3xl font-black dark:text-white">4.8k</p>
            <p className="text-[10px] text-purple-500 font-bold">Profile views this week</p>
          </div>
        </div>

        {/* Analytics Section (Mock Chart Area) */}
        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border dark:border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black dark:text-white">Earnings Analytics</h3>
            <select className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-4 py-2 text-xs font-bold outline-none dark:text-white">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-64 w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-end justify-around p-4 gap-2">
            {/* Mock Chart Bars */}
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="w-full max-w-[40px] bg-blue-600 rounded-t-lg transition-all hover:bg-blue-500 cursor-pointer group relative" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">${h * 10}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-around mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </section>

        {/* Dynamic Role-specific Table */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b dark:border-gray-800">
            <h3 className="text-xl font-black dark:text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {[1, 2, 3].map(i => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-bold dark:text-white">#ORD-00{i}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Alex Smith</td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600 dark:text-blue-400">$120.00</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-bold uppercase border border-green-200 dark:border-green-800">Success</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-bold">2 hours ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
