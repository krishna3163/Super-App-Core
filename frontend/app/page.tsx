'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import { 
  Car, ShoppingBag, Utensils, Zap, Users, 
  Code2, Briefcase, Sparkles, UserPlus, MessageCircle,
  Clock, Package, MapPin, Search, Grid, Wallet, Gamepad2, ChevronRight, Star,
  Bell, Smartphone, Cpu, CloudRain,
  Heart, CalendarDays, ListTodo, Radio, Phone, FileText, ArrowUpRight, TrendingUp
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), { ssr: false, loading: () => <div className="animate-pulse bg-[var(--bg-card)] w-full h-full rounded-2xl"></div> })

const quickApps = [
  { label: 'Chat',     icon: MessageCircle, color: 'from-blue-500 to-indigo-600',    shadow: 'shadow-blue-500/30',    href: '/chat' },
  { label: 'Dating',   icon: Heart,         color: 'from-pink-500 to-rose-600',      shadow: 'shadow-pink-500/30',    href: '/dating' },
  { label: 'Ride',     icon: Car,           color: 'from-amber-500 to-orange-600',   shadow: 'shadow-amber-500/30',   href: '/rides' },
  { label: 'Food',     icon: Utensils,      color: 'from-red-500 to-rose-600',       shadow: 'shadow-red-500/30',     href: '/food' },
  { label: 'Shop',     icon: ShoppingBag,   color: 'from-violet-500 to-purple-600',  shadow: 'shadow-violet-500/30',  href: '/marketplace' },
  { label: 'Calendar', icon: CalendarDays,  color: 'from-teal-500 to-emerald-600',   shadow: 'shadow-teal-500/30',    href: '/calendar' },
  { label: 'Tasks',    icon: ListTodo,      color: 'from-fuchsia-500 to-pink-600',   shadow: 'shadow-fuchsia-500/30', href: '/tasks' },
  { label: 'Jobs',     icon: Briefcase,     color: 'from-emerald-500 to-green-600',  shadow: 'shadow-emerald-500/30', href: '/professional' },
  { label: 'Live',     icon: Radio,         color: 'from-red-600 to-orange-600',     shadow: 'shadow-red-500/30',     href: '/live' },
  { label: 'Calls',    icon: Phone,         color: 'from-green-500 to-emerald-600',  shadow: 'shadow-green-500/30',   href: '/calls' },
  { label: 'Coding',   icon: Code2,         color: 'from-cyan-500 to-blue-600',      shadow: 'shadow-cyan-500/30',    href: '/coding' },
  { label: 'More',     icon: Grid,          color: 'from-gray-500 to-slate-600',     shadow: 'shadow-gray-500/30',    href: '/apps' },
]

export default function HomePage() {
  const { user, isReady } = useAuth()
  const { activities, appMode } = useAuthStore()
  const [greeting, setGreeting] = useState('Hello')
  const queryClient = useQueryClient()

  const rawDisplayName =
    user?.name?.trim() ||
    user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ||
    user?.id?.replace(/^user-?/i, '') ||
    'User'

  const displayName = rawDisplayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  const firstName = displayName.split(' ')[0] || 'User'
  const userInitial = firstName.charAt(0).toUpperCase() || 'U'
  const profileHref = user?.id ? `/u/${encodeURIComponent(user.id)}` : '/'

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good Morning')
    else if (h < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const { data: suggestions = [] } = useQuery({
    queryKey: ['people-you-may-know', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await api.get(`/super-comm/profile/${user.id}/suggestions?limit=6`).catch(() => ({ data: [] }))
      return Array.isArray(data) ? data : []
    },
    enabled: isReady && !!user?.id
  })

  const followSuggestionMutation = useMutation({
    mutationFn: async (followingId: string) => {
      if (!user?.id || !followingId) return
      await api.post('/super-comm/profile/follow', {
        followerId: user.id,
        followingId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people-you-may-know', user?.id] })
    }
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/${user?.id}`)
      const list = Array.isArray(data) ? data : (data?.data || [])
      return list.filter((n: any) => !n.isRead)?.length || 0
    },
    enabled: isReady && !!user?.id,
    refetchInterval: 15000
  })

  if (!isReady) return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--syn-keyword)] to-[var(--syn-function)] flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap size={28} className="text-white" />
        </div>
        <p className="text-sm font-bold text-[var(--syn-comment)]">Loading your experience...</p>
      </div>
    </div>
  )

  const MobileView = () => (
    <div className="md:hidden flex flex-col bg-[var(--bg-primary)] min-h-screen pb-32">
      <header className="p-5 pb-3 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-[var(--syn-type)] uppercase tracking-[0.2em] mb-1">{greeting}</p>
            <h1 className="text-2xl font-black tracking-tight">{firstName} 👋</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/notifications" className="relative p-2.5 bg-[var(--bg-card)] rounded-2xl shadow-sm border border-gray-200/30 dark:border-gray-800/30 interactive">
              <Bell size={20} className="text-[var(--syn-variable)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--syn-constant)] rounded-full border-2 border-[var(--bg-primary)] text-[9px] font-black text-white flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href={profileHref}>
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--syn-keyword)] to-[var(--syn-function)] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20 interactive">
                {userInitial}
              </div>
            </Link>
          </div>
        </div>
        <form action={(formData) => {
          const query = formData.get('search')
          if (query) window.location.href = `/explore?q=${query}`
        }} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--syn-comment)] group-focus-within:text-[var(--syn-function)] transition-colors" size={18} />
          <input name="search" type="text" placeholder="Search in Super App..." className="w-full bg-[var(--bg-card)] border border-gray-200/30 dark:border-gray-800/30 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm outline-none font-medium text-sm focus:ring-2 ring-[var(--syn-function)]/20 focus:border-[var(--syn-function)]/30 transition-all"/>
        </form>
      </header>

      <section className="px-5 py-3">
        <div className="grid grid-cols-4 gap-3">
          {quickApps.map(item => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
              <div className={`bg-gradient-to-br ${item.color} p-3 rounded-2xl text-white shadow-lg ${item.shadow} group-active:scale-90 transition-all duration-200`}>
                <item.icon size={22} />
              </div>
              <span className="text-[9px] font-black text-[var(--syn-comment)] uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-3 space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-sm uppercase tracking-widest">Ride Nearby</h2>
          <Link href="/rides" className="text-[10px] font-black text-[var(--syn-string)] bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl flex items-center gap-1 interactive">
            <Clock size={10}/>2 min
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[
            { name: 'Tesla Model S', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80', price: '₹120' },
            { name: 'BMW i8', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80', price: '₹180' }
          ].map((car, i) => (
            <Link href="/rides" key={i} className="min-w-[220px] bg-[var(--bg-card)] rounded-2xl p-2 shadow-sm border border-gray-200/30 dark:border-gray-800/30 flex items-center gap-3 card-hover">
              <img src={car.img} className="w-18 h-18 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs truncate">{car.name}</p>
                <p className="text-[10px] font-bold text-[var(--syn-function)]">{car.price} • Now</p>
              </div>
              <div className="mr-1 p-1.5 bg-[var(--bg-elevated)] rounded-xl">
                <ChevronRight size={14} className="text-[var(--syn-comment)]"/>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-3 space-y-3">
        <h2 className="font-black text-sm uppercase tracking-widest px-1">Order Food</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[
            { name: 'Pizza Hut', time: '20 mins', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
            { name: 'Burger Hub', time: '15 mins', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' }
          ].map((food, i) => (
            <Link href="/food" key={i} className="min-w-[180px] bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm border border-gray-200/30 dark:border-gray-800/30 card-hover">
              <img src={food.img} className="w-full h-24 object-cover" />
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-black text-[11px]">{food.name}</p>
                  <p className="text-[9px] font-bold text-[var(--syn-comment)]">{food.time}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[var(--syn-variable)]">
                  <Star size={10} fill="currentColor"/>
                  <span className="text-[10px] font-black">4.5</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )

  const DesktopView = () => (
    <div className="hidden md:block p-8 space-y-12 max-w-7xl mx-auto pb-32">
      <section className="flex justify-between items-end animate-slide-up">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-0.5 w-12 bg-[var(--syn-keyword)] rounded-full animate-pulse-slow" />
             <p className="text-[10px] font-black text-[var(--syn-type)] uppercase tracking-[0.4em]">{greeting}</p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--syn-comment)] drop-shadow-sm">
            Welcome back, {firstName}
          </h1>
          <p className="text-[var(--syn-comment)] font-black text-xs uppercase tracking-[0.2em] opacity-60">Your decentralized ecosystem is live • 24 active nodes</p>
        </div>
        <div className="flex flex-row items-center gap-6">
          <div className="flex p-1 bg-[var(--bg-card)] rounded-[2rem] border border-gray-200/5 dark:border-gray-800/50 shadow-inner">
             <button className="px-6 py-2.5 rounded-[1.5rem] bg-[var(--bg-elevated)] font-black text-[10px] uppercase tracking-widest text-[var(--syn-function)] shadow-sm">Dashboard</button>
             <button className="px-6 py-2.5 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest text-[var(--syn-comment)] hover:text-[var(--text-primary)]">Analytics</button>
          </div>
          <Link href="/notifications" className="relative p-4 bg-[var(--bg-card)] rounded-2xl shadow-xl border border-gray-200/5 dark:border-gray-800/50 interactive group hover:border-[var(--syn-variable)]/30">
            <Bell size={24} className="text-[var(--syn-variable)] group-hover:animate-swing" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--syn-constant)] rounded-full border-4 border-[var(--bg-primary)] text-[10px] font-black text-white flex items-center justify-center shadow-lg animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href={profileHref}>
            <div className="w-16 h-16 rounded-[2rem] p-1 bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-operator)] shadow-2xl shadow-purple-500/30 interactive group">
              <div className="w-full h-full rounded-[1.7rem] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)] font-black text-2xl group-hover:scale-95 transition-transform overflow-hidden">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : userInitial}
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8 items-start">
         <div className="col-span-12 lg:col-span-8 space-y-12">
            {activities.length > 0 && (
              <section className="space-y-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--syn-function)]/10 rounded-xl text-[var(--syn-function)]"><Zap size={20} /></div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Real-time Operations</h2>
                  </div>
                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-gray-200/5 to-transparent dark:from-gray-800/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((act) => (
                    <Link href={`/${act.type === 'ride' ? 'rides' : act.type === 'food' ? 'food' : 'marketplace'}`} key={act.id} className="group bg-[var(--bg-card)] p-5 rounded-[2.5rem] border border-gray-200/5 dark:border-gray-800/50 shadow-sm flex items-center gap-5 card-hover relative overflow-hidden active:scale-[0.98]">
                      <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", act.type === 'ride' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : act.type === 'food' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600')}>
                        {act.type === 'ride' ? <Car size={24}/> : act.type === 'food' ? <Utensils size={24}/> : <Package size={24}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate uppercase tracking-tight text-[var(--text-primary)]">{act.title}</p>
                        <p className="text-[10px] font-black text-[var(--syn-function)] uppercase tracking-[0.1em]">{act.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[var(--syn-comment)] font-black italic">{act.time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--syn-comment)] px-2">Quick Transport</h2>
                  <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-1 border border-gray-200/5 dark:border-gray-800/50 shadow-xl space-y-1">
                    {[
                      { name: 'Tesla Model S', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80', price: '₹120', time: '2 min' },
                      { name: 'BMW i8 Hybrid', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80', price: '₹180', time: '5 min' }
                    ].map((car, i) => (
                      <Link href="/rides" key={i} className="flex items-center gap-4 p-3 hover:bg-[var(--bg-elevated)] rounded-[2rem] transition-all group">
                        <img src={car.img} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                        <div className="flex-1"><p className="font-black text-xs uppercase">{car.name}</p><p className="text-[10px] text-[var(--syn-comment)]">{car.time}</p></div>
                        <p className="text-xs font-black text-[var(--syn-function)]">{car.price}</p>
                      </Link>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--syn-comment)] px-2">Top Cuisines</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Pizza Hut', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', rating: '4.8' },
                      { name: 'Burger Hub', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80', rating: '4.5' }
                    ].map((food, i) => (
                      <Link href="/food" key={i} className="group bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden border border-gray-200/5 dark:border-gray-800/50 shadow-sm aspect-[4/5] relative card-hover">
                         <img src={food.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                         <div className="absolute bottom-5 left-5"><p className="text-white font-black text-xs uppercase">{food.name}</p></div>
                      </Link>
                    ))}
                  </div>
               </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--syn-keyword)]/10 rounded-xl text-[var(--syn-keyword)]"><Grid size={20} /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">System Control Center</h2>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
                {quickApps.map((app) => (
                  <Link key={app.label} href={app.href} className="flex flex-col items-center gap-4 group">
                    <div className={`bg-gradient-to-br ${app.color} p-5 rounded-[2rem] text-white shadow-2xl ${app.shadow} group-hover:scale-110 transition-all duration-500`}>
                      <app.icon size={28} />
                    </div>
                    <span className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-[0.2em]">{app.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-6">
               <h2 className="text-sm font-black uppercase tracking-[0.2em]">Marketplace Trends</h2>
               <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'MacBook Pro M3', price: '₹1.5L', color: 'bg-indigo-500/10' },
                    { label: 'AirPods Max', price: '₹45k', color: 'bg-rose-500/10' },
                    { label: 'PS5 Slim', price: '₹50k', color: 'bg-blue-500/10' },
                    { label: 'Desk Setup', price: '₹12k', color: 'bg-emerald-500/10' }
                  ].map((item, i) => (
                    <div key={i} className={clsx("p-6 rounded-[2.5rem] border border-white/5 card-hover", item.color)}>
                       <p className="font-black text-xs uppercase text-[var(--text-primary)]">{item.label}</p>
                       <p className="text-[10px] font-black text-[var(--syn-function)] mt-1">{item.price}</p>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-12 sticky top-8">
            <section className="bg-[var(--bg-card)] rounded-[3rem] p-8 border border-gray-200/5 dark:border-gray-800/50 shadow-2xl space-y-8">
               <h2 className="text-sm font-black uppercase tracking-[0.2em]">Social Pulse</h2>
               <div className="space-y-6">
                  {suggestions.slice(0, 4).map((u: any) => (
                    <div key={u.userId} className="flex items-center gap-4 group cursor-pointer">
                      <img src={u.avatar || 'https://i.pravatar.cc/120?u=anonymous'} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs uppercase text-[var(--text-primary)] truncate">{u.username || u.userId}</p>
                        <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest opacity-60">{u.followersCount || 0} followers</p>
                      </div>
                      <button onClick={() => followSuggestionMutation.mutate(u.userId)} className="p-3 bg-[var(--bg-elevated)] text-[var(--syn-comment)] rounded-2xl border border-white/5 hover:bg-[var(--syn-function)] hover:text-white transition-all"><UserPlus size={18} /></button>
                    </div>
                  ))}
               </div>
               <Link href="/feed" className="block w-full text-center py-4 bg-[var(--bg-elevated)] rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] text-[var(--syn-comment)]">Open Global Feed</Link>
            </section>

            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--syn-comment)] ml-2">Geospatial Intelligence</h2>
              <Link href="/explore" className="block bg-[var(--bg-card)] h-64 rounded-[3rem] overflow-hidden border border-gray-200/5 dark:border-gray-800/50 shadow-2xl relative group cursor-pointer">
                <MapComponent className="h-full w-full grayscale dark:invert group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              </Link>
            </section>
         </div>
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
