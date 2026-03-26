'use client'

import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import { 
  Car, ShoppingBag, Utensils, Zap, Users, 
  Code2, Briefcase, Sparkles, UserPlus, MessageCircle,
  Clock, Package, MapPin, Search, Grid, Wallet, Gamepad2, ChevronRight, Star,
  Bell, Smartphone, Cpu, CloudRain,
  Heart, CalendarDays, ListTodo, Radio, Phone, FileText
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import MapComponent from '@/components/ui/MapComponent'
import clsx from 'clsx'

export default function HomePage() {
  const { user, isReady } = useAuth()
  const { activities } = useAuthStore()
  const [randomUsers, setRandomUsers] = useState<any[]>([])

  // Fetch all users and pick 5 random ones
  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      const { data } = await api.get('/users/profile/list').catch(() => ({ data: [] }))
      return data
    },
    enabled: isReady
  })

  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const shuffled = [...allUsers].sort(() => 0.5 - Math.random())
      setRandomUsers(shuffled.slice(0, 5))
    } else {
      setRandomUsers([])
    }
  }, [allUsers])

  // Notification polling for unread badge
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/${user?.id}`);
      return data?.filter((n: any) => !n.isRead)?.length || 0;
    },
    enabled: isReady && !!user?.id,
    refetchInterval: 15000
  })

  if (!isReady) return <div className="p-8 text-center dark:text-white">Loading your experience...</div>

  // IMAGE REFERENCE UI COMPONENTS
  const MobileView = () => (
    <div className="md:hidden flex flex-col bg-gray-50 dark:bg-gray-950 min-h-screen pb-32">
        {/* Header */}
        <header className="p-6 pb-2 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black dark:text-white tracking-tight">Hi {user?.name?.split(' ')[0] || 'User'},</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/notifications" prefetch={false} className="relative p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[8px] font-bold text-white flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/settings" prefetch={false}>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </Link>
                </div>
            </div>
            <form action={(formData) => {
                const query = formData.get('search')
                if (query) window.location.href = `/explore?q=${query}`
            }} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    name="search"
                    type="text" 
                    placeholder="Search in Super App"
                    className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl py-3.5 pl-12 pr-4 shadow-sm outline-none dark:text-white font-medium text-sm focus:ring-2 ring-blue-500/20 transition-all"
                />
            </form>
        </header>

        {/* Quick Icon Grid */}
        <section className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Chat', icon: MessageCircle, color: 'bg-indigo-600', href: '/chat' },
                    { label: 'Dating', icon: Heart, color: 'bg-pink-500', href: '/dating' },
                    { label: 'Ride', icon: Car, color: 'bg-yellow-500', href: '/rides' },
                    { label: 'Food', icon: Utensils, color: 'bg-orange-500', href: '/food' },
                    { label: 'Shop', icon: ShoppingBag, color: 'bg-rose-500', href: '/marketplace' },
                    { label: 'Calendar', icon: CalendarDays, color: 'bg-teal-500', href: '/calendar' },
                    { label: 'Tasks', icon: ListTodo, color: 'bg-purple-500', href: '/tasks' },
                    { label: 'Jobs', icon: Briefcase, color: 'bg-emerald-500', href: '/professional' },
                    { label: 'Live', icon: Radio, color: 'bg-red-500', href: '/live' },
                    { label: 'Calls', icon: Phone, color: 'bg-green-500', href: '/calls' },
                    { label: 'Coding', icon: Code2, color: 'bg-cyan-600', href: '/coding' },
                    { label: 'More', icon: Grid, color: 'bg-blue-600', href: '/apps' },
                ].map(item => (
                    <Link key={item.label} href={item.href} prefetch={false} className="flex flex-col items-center gap-2">
                        <div className={`${item.color} p-3.5 rounded-[1.25rem] text-white shadow-lg active:scale-90 transition-transform`}>
                            <item.icon size={22} />
                        </div>
                        <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{item.label}</span>
                    </Link>
                ))}
            </div>
        </section>

        {/* Ride Nearby Scroller */}
        <section className="px-6 py-4 space-y-3">
            <div className="flex justify-between items-center px-1">
                <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Ride Nearby</h2>
                <Link href="/rides" prefetch={false} className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-all cursor-pointer"><Clock size={10}/> 2 min</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {[
                    { name: 'Tesla Model S', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80', price: '$12' },
                    { name: 'BMW i8', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80', price: '$18' }
                ].map((car, i) => (
                    <Link href="/rides" prefetch={false} key={i} className="min-w-[240px] bg-white dark:bg-gray-900 rounded-[2rem] p-2 shadow-sm border dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all active:scale-98">
                        <img src={car.img} className="w-20 h-20 rounded-2xl object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-xs dark:text-white truncate">{car.name}</p>
                            <p className="text-[10px] font-bold text-blue-600">{car.price} • Now</p>
                        </div>
                        <div className="mr-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400"><ChevronRight size={16}/></div>
                    </Link>
                ))}
            </div>
        </section>

        {/* Order Food Scroller */}
        <section className="px-6 py-4 space-y-3">
            <h2 className="font-black text-sm dark:text-white uppercase tracking-widest px-1">Order Food</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {[
                    { name: 'Pizza Hut', time: '20 mins', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
                    { name: 'Burger Hub', time: '15 mins', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' }
                ].map((food, i) => (
                    <Link href="/food" prefetch={false} key={i} className="min-w-[200px] bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm border dark:border-gray-800 hover:shadow-md transition-all active:scale-98">
                        <img src={food.img} className="w-full h-24 object-cover" />
                        <div className="p-3 flex justify-between items-center">
                            <div>
                                <p className="font-black text-[10px] dark:text-white">{food.name}</p>
                                <p className="text-[8px] font-bold text-gray-400">{food.time}</p>
                            </div>
                            <div className="flex items-center gap-0.5 text-yellow-500"><Star size={10} fill="currentColor"/><span className="text-[10px] font-black">4.5</span></div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* Trending Mini Apps */}
        <section className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Trending Mini Apps</h2>
                <ChevronRight size={18} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { name: 'Flashcards', icon: Smartphone, color: 'bg-red-100 text-red-600', href: '/notes' },
                    { name: 'Weather', icon: CloudRain, color: 'bg-blue-100 text-blue-600', href: '/apps/weather' },
                    { name: 'Crypto', icon: Cpu, color: 'bg-orange-100 text-orange-600', href: '/wallet' },
                ].map(app => (
                    <Link href={app.href} key={app.name} className="bg-white dark:bg-gray-900 p-4 rounded-3xl border dark:border-gray-800 shadow-sm flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">
                        <div className={`${app.color} p-2.5 rounded-xl`}><app.icon size={20}/></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{app.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    </div>
  )

  const DesktopView = () => (
    <div className="hidden md:block p-8 space-y-8 max-w-6xl mx-auto pb-24">
      {/* Welcome Header */}
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Hey, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Your world, unified.</p>
        </div>
        <div className="flex flex-row items-center gap-6">
            <Link href="/notifications" className="relative p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <Bell size={24} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>
            <Link href="/settings">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-xl rotate-3 text-2xl hover:rotate-0 transition-all cursor-pointer border-2 border-transparent hover:border-blue-400">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </Link>
        </div>
      </section>

      {/* NEW: Active Activities Section */}
      {activities.length > 0 && (
          <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-blue-500" size={20} />
                  <h2 className="text-lg font-bold dark:text-white uppercase tracking-wider text-sm">Active Orders & Rides</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {activities.map((act) => (
                      <Link href={`/${act.type === 'ride' ? 'rides' : act.type === 'food' ? 'food' : 'marketplace'}`} key={act.id} className="min-w-[280px] bg-white dark:bg-gray-800 p-4 rounded-3xl border-2 border-blue-500/20 shadow-sm flex items-center gap-4 hover:border-blue-500/50 transition-all active:scale-98">
                          <div className={clsx(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                              act.type === 'ride' ? 'bg-orange-500' : act.type === 'food' ? 'bg-red-500' : 'bg-blue-500'
                          )}>
                              {act.type === 'ride' ? <Car size={24}/> : act.type === 'food' ? <Utensils size={24}/> : <Package size={24}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="font-black text-sm dark:text-white truncate">{act.title}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{act.status}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold">{act.time}</p>
                          </div>
                      </Link>
                  ))}
              </div>
          </section>
      )}

      {/* Mini Apps Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-500" size={20} />
            <h2 className="text-lg font-bold dark:text-white uppercase tracking-wider text-sm">Mini Apps</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: 'Messaging', icon: MessageCircle, color: 'bg-indigo-600', href: '/chat' },
            { name: 'Coding Hub', icon: Code2, color: 'bg-indigo-500', href: '/coding' },
            { name: 'Dating', icon: Heart, color: 'bg-pink-500', href: '/dating' },
            { name: 'Marketplace', icon: ShoppingBag, color: 'bg-blue-500', href: '/marketplace' },
            { name: 'Professional', icon: Briefcase, color: 'bg-emerald-500', href: '/professional' },
            { name: 'Calendar', icon: CalendarDays, color: 'bg-teal-500', href: '/calendar' },
            { name: 'Tasks', icon: ListTodo, color: 'bg-purple-500', href: '/tasks' },
            { name: 'Live', icon: Radio, color: 'bg-red-500', href: '/live' },
            { name: 'Calls', icon: Phone, color: 'bg-green-500', href: '/calls' },
            { name: 'Forms', icon: FileText, color: 'bg-violet-500', href: '/forms' },
            { name: 'Ride Hailing', icon: Car, color: 'bg-orange-500', href: '/rides' },
            { name: 'Food Delivery', icon: Utensils, color: 'bg-rose-500', href: '/food' },
          ].map((app) => (
            <Link key={app.name} href={app.href} className="flex flex-col items-center gap-2 group">
              <div className={`${app.color} p-4 rounded-3xl text-white shadow-lg group-hover:scale-110 transition-all group-hover:-rotate-3`}>
                <app.icon size={24} />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 text-center">{app.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold dark:text-white">People you may know</h2>
                <Link href="/chat?search=true" className="text-blue-600 text-xs font-bold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {randomUsers.map((u) => (
                    <div key={u.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl flex items-center gap-4 shadow-sm border dark:border-gray-700 hover:border-blue-500/50 transition-colors">
                        <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover border dark:border-gray-700 shadow-sm" alt="" />
                        <div className="flex-1">
                            <p className="font-bold text-sm dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-gray-500">Recently joined</p>
                        </div>
                        <Link href={`/chat/${u.id}`} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                            <MessageCircle size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold dark:text-white">Around You</h2>
            <Link href="/explore" className="block bg-white dark:bg-gray-800 h-48 rounded-3xl overflow-hidden border dark:border-gray-700 shadow-sm relative group cursor-pointer transition-all hover:ring-2 ring-blue-500/20">
                <MapComponent className="h-full w-full grayscale dark:invert group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/60 dark:bg-black/60 backdrop-blur-md p-2 rounded-xl text-[10px] font-bold text-center dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">Open Explore View</div>
            </Link>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="font-bold mb-2">Switch to Business Mode</h3>
                    <p className="text-xs opacity-80 mb-4">Start selling your products or services to thousands of users.</p>
                    <Link href="/settings" className="block w-full text-center bg-white text-blue-600 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform">Get Started</Link>
                </div>
                <Briefcase size={80} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
        </section>
      </div>
    </div>
  )

  return (
      <>
        <MobileView />
        <DesktopView />
      </>
  )
}
