'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { 
  LayoutDashboard, ShoppingCart, TrendingUp, Users, Package, 
  Settings, ToggleLeft as Toggle, MapPin, Calendar, 
  Clock, CheckCircle2, XCircle, MessageCircle, MoreVertical,
  Hotel, Utensils, Car, Bike, Info, Loader2
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

export default function BusinessDashboardPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['business-summary', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/business-dashboard/summary/${user?.id}`)
      return data.data
    },
    enabled: !!user?.id
  })

  // --- Mutations ---
  const acceptRideMutation = useMutation({
    mutationFn: async (rideId: string) => api.patch(`/rides/${rideId}/accept`, { driverId: user?.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-summary'] })
  })

  const rejectRideMutation = useMutation({
    mutationFn: async (rideId: string) => api.patch(`/rides/${rideId}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-summary'] })
  })

  const updateTableStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => 
      api.patch(`/food/restaurants/table-bookings/${bookingId}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-summary'] })
  })

  const updateHotelStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => 
      api.patch(`/hotels/bookings/${bookingId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-summary'] })
  })

  if (isLoading) return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-gray-400">Loading Business Hub...</div>
  if (error) return <div className="p-8 text-center text-red-500 font-bold">Business mode not enabled or service error.</div>

  const { profile, activeData, revenue, orders } = dashboard

  const renderActiveSection = () => {
    if (activeTab === 'overview') return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
               <TrendingUp className="text-blue-600" /> Earnings Analytics
            </h3>
            <div className="h-64 flex items-end justify-around gap-2 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl">
               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                 <div key={i} className="w-full bg-blue-600 rounded-t-xl hover:bg-blue-500 transition-all relative group cursor-pointer" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[10px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-black">₹{h * 100}</div>
                 </div>
               ))}
            </div>
         </section>

         <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter flex items-center justify-between">
               Live Updates <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </h3>
            <div className="space-y-4">
               {activeData?.orders?.length > 0 ? activeData.orders.slice(0, 3).map((ord: any) => (
                 <div key={ord._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center font-black">#</div>
                       <div>
                          <p className="font-black text-sm uppercase">Order {ord._id.slice(-6)}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{ord.status}</p>
                       </div>
                    </div>
                    <Link href={`/chat/${ord.userId}`} className="p-2.5 bg-white dark:bg-gray-700 rounded-xl text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600">
                       <MessageCircle size={18} />
                    </Link>
                 </div>
               )) : (
                 <div className="text-center py-10 opacity-30">
                    <Info className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase">No active transactions</p>
                 </div>
               )}
            </div>
         </section>
      </div>
    )

    if (activeTab === 'driver' || activeTab === 'rider') return (
      <div className="space-y-6">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Pending Ride Requests</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeData?.rides?.map((ride: any) => (
              <div key={ride._id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 space-y-5">
                 <div className="flex justify-between items-start">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">₹{ride.fare}</div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{ride.vehicleType}</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex gap-3">
                       <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                       <p className="text-sm font-bold dark:text-gray-200">{ride.pickup.address}</p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                       <p className="text-sm font-bold dark:text-gray-200">{ride.drop.address}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => acceptRideMutation.mutate(ride._id)}
                      disabled={acceptRideMutation.isPending}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      {acceptRideMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Accept'}
                    </button>
                    <button 
                      onClick={() => rejectRideMutation.mutate(ride._id)}
                      disabled={rejectRideMutation.isPending}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400"
                    >
                      <XCircle size={20}/>
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    )

    if (activeTab === 'restaurant') return (
      <div className="space-y-10">
         <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Table Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {activeData?.tableBookings?.map((book: any) => (
                 <div key={book._id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 flex justify-between items-center">
                    <div className="flex gap-4">
                       <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl">
                          {book.guests}
                       </div>
                       <div>
                          <p className="font-black dark:text-white uppercase">{book.guestName}</p>
                          <p className="text-xs text-gray-400 font-bold flex items-center gap-1"><Clock size={12} /> {book.bookingTime} · {new Date(book.bookingDate).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Link href={`/chat/${book.userId}`} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><MessageCircle size={20}/></Link>
                       <button 
                         onClick={() => updateTableStatusMutation.mutate({ bookingId: book._id, status: 'confirmed' })}
                         className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"
                       >
                         <CheckCircle2 size={20}/>
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </section>
      </div>
    )

    if (activeTab === 'hotel') return (
      <div className="space-y-6">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Room Bookings</h2>
         <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <tr>
                     <th className="px-8 py-5">Guest</th>
                     <th className="px-8 py-5">Stay Dates</th>
                     <th className="px-8 py-5">Room</th>
                     <th className="px-8 py-5">Status</th>
                     <th className="px-8 py-5">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y dark:divide-gray-800">
                  {activeData?.hotelBookings?.map((book: any) => (
                    <tr key={book._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                       <td className="px-8 py-6">
                          <p className="font-black text-sm dark:text-white">{book.guestName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{book.phone}</p>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-xs font-bold dark:text-gray-300">{new Date(book.checkIn).toLocaleDateString()} → {new Date(book.checkOut).toLocaleDateString()}</p>
                       </td>
                       <td className="px-8 py-6 text-xs font-black uppercase text-blue-600">{book.roomType}</td>
                       <td className="px-8 py-6">
                          <span className="text-[9px] font-black uppercase px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800">{book.status}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex gap-2">
                             <Link href={`/chat/${book.userId}`} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-colors"><MessageCircle size={18}/></Link>
                             <button 
                               onClick={() => updateHotelStatusMutation.mutate({ bookingId: book._id, status: 'confirmed' })}
                               className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
                             >
                               <CheckCircle2 size={18}/>
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    )

    return <div className="text-center py-20 font-black text-gray-400 uppercase tracking-widest">Section Coming Soon</div>
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col hidden md:flex">
        <div className="p-8 border-b dark:border-gray-800">
          <h2 className="text-2xl font-black text-blue-600 tracking-tighter uppercase italic">Business Hub</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest", activeTab === 'overview' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
            <LayoutDashboard size={18} /> Overview
          </button>
          
          {profile.roles?.includes('seller') && (
            <button onClick={() => setActiveTab('products')} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest", activeTab === 'products' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
              <Package size={18} /> Marketplace
            </button>
          )}

          {profile.roles?.includes('restaurant') && (
            <button onClick={() => setActiveTab('restaurant')} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest", activeTab === 'restaurant' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
              <Utensils size={18} /> Dining & Food
            </button>
          )}

          {profile.roles?.includes('rider') && (
            <button onClick={() => setActiveTab('rider')} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest", activeTab === 'rider' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
              <Car size={18} /> Logistics
            </button>
          )}

          {profile.roles?.includes('hotel') && (
            <button onClick={() => setActiveTab('hotel')} className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest", activeTab === 'hotel' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
              <Hotel size={18} /> Hospitality
            </button>
          )}
        </nav>
        <div className="p-6 border-t dark:border-gray-800">
           <button className="flex items-center gap-4 p-4 w-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all font-black text-xs uppercase tracking-widest">
             <Settings size={18} /> Settings
           </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black dark:text-white uppercase tracking-tighter">{activeTab}</h1>
            <p className="text-gray-500 font-bold text-sm mt-1 uppercase tracking-widest">Control panel for your business operations</p>
          </div>
          <div className="flex items-center gap-3 bg-green-500/10 text-green-600 px-5 py-2.5 rounded-full border border-green-500/20 font-black text-[10px] uppercase tracking-widest">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live System Active
          </div>
        </header>

        {/* Dynamic Stats for Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm hover:border-blue-500/50 transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Earnings</p>
              <p className="text-4xl font-black dark:text-white">₹{revenue?.total || 0}</p>
              <div className="mt-4 text-[10px] font-bold text-emerald-500 uppercase">+12% vs last month</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm hover:border-blue-500/50 transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Orders</p>
              <p className="text-4xl font-black dark:text-white">{orders?.total || 0}</p>
              <div className="mt-4 text-[10px] font-bold text-blue-500 uppercase">{orders?.completed || 0} completed</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm hover:border-blue-500/50 transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Rating</p>
              <p className="text-4xl font-black dark:text-white">{profile.rating || '4.8'}</p>
              <div className="mt-4 text-[10px] font-bold text-orange-500 uppercase">{profile.reviewCount || 0} reviews</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm hover:border-blue-500/50 transition-all">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Active Data</p>
              <p className="text-4xl font-black dark:text-white">{(activeData?.orders?.length || 0) + (activeData?.rides?.length || 0)}</p>
              <div className="mt-4 text-[10px] font-bold text-purple-500 uppercase">Live interactions</div>
            </div>
          </div>
        )}

        {renderActiveSection()}
      </main>
    </div>
  )
}
