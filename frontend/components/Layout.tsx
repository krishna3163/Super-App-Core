'use client'

import { useAuth } from '@/hooks/useAuth'
import useAuthStore from '@/store/useAuthStore'
import { 
  Home, MessageCircle, Compass, Grid, User, LogOut, 
  LayoutDashboard, Briefcase, Code2, Rss, Utensils, 
  ShoppingBag, Wallet, ChevronRight, ShieldCheck, 
  Truck, Store, Info, Moon, Sun, Zap, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useState, useEffect } from 'react'
import OfflineBanner from '@/components/OfflineBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isReady } = useAuth()
  const { appMode, setAppMode, businessEnabled, user } = useAuthStore()
  const pathname = usePathname()
  const [showModeInfo, setShowModeInfo] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    if (!businessEnabled && appMode === 'business') {
      setAppMode('user')
    }
  }, [businessEnabled, appMode, setAppMode])

  if (!isReady) return null
  if (!isAuthenticated) return <>{children}</>

  const profileHref = user?.id ? `/u/${encodeURIComponent(user.id)}` : '/'

  // Color-coded nav items — each icon/label has its own unique hue like syntax highlighting
  const navItems = {
    user: [
      { label: 'Home', icon: Home, href: '/', color: 'text-[var(--syn-keyword)]', bg: 'bg-purple-500/10' },
      { label: 'Feed', icon: Rss, href: '/feed', color: 'text-[var(--syn-variable)]', bg: 'bg-orange-500/10' },
      { label: 'Messages', icon: MessageCircle, href: '/chat', color: 'text-[var(--syn-function)]', bg: 'bg-blue-500/10' },
      { label: 'Apps', icon: Grid, href: '/apps', color: 'text-[var(--syn-type)]', bg: 'bg-cyan-500/10' },
      { label: 'Profile', icon: User, href: profileHref, color: 'text-[var(--syn-comment)]', bg: 'bg-gray-500/10' },
    ],
    business: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/business-dashboard', color: 'text-[var(--syn-string)]', bg: 'bg-emerald-500/10' },
      { label: 'Listings', icon: Store, href: '/marketplace/manage', color: 'text-[var(--syn-variable)]', bg: 'bg-orange-500/10' },
      { label: 'Ride Jobs', icon: Truck, href: '/rides/jobs', color: 'text-[var(--syn-function)]', bg: 'bg-blue-500/10' },
      { label: 'Analytics', icon: ShieldCheck, href: '/business/analytics', color: 'text-[var(--syn-keyword)]', bg: 'bg-purple-500/10' },
      { label: 'Profile', icon: User, href: profileHref, color: 'text-[var(--syn-comment)]', bg: 'bg-gray-500/10' },
    ]
  }

  const currentNav = navItems[appMode as 'user' | 'business'] || navItems.user

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] font-inter select-none overflow-hidden">
      {/* ─── Sidebar (Desktop) ─── */}
      <aside className="hidden md:flex flex-col w-72 bg-[var(--bg-card)] border-r border-gray-200/20 dark:border-gray-800/50 relative z-40 transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--syn-keyword)]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        {/* Logo */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[var(--syn-keyword)] to-[var(--syn-function)] flex items-center justify-center shadow-xl shadow-purple-500/20 group cursor-pointer active:scale-90 transition-all duration-300">
            <Zap size={24} className="text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter shimmer-text">SUPERAPP</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-[0.25em]">Core v2.0</p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        {businessEnabled && (
          <div className="px-6 mb-6">
            <div className="bg-[var(--bg-elevated)] p-1.5 rounded-[1.5rem] flex gap-1 border border-gray-200/10 dark:border-gray-700/30 shadow-inner">
              {(['user', 'business'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAppMode(mode)}
                  className={clsx(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-500",
                    appMode === mode
                      ? mode === 'user'
                        ? "bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-white shadow-lg shadow-purple-500/25"
                        : "bg-gradient-to-r from-[var(--syn-string)] to-[var(--syn-type)] text-white shadow-lg shadow-emerald-500/25"
                      : "text-[var(--syn-comment)] hover:text-[var(--text-primary)] hover:bg-white/5"
                  )}
                >
                  {mode === 'user' ? 'Personal' : 'Business'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {currentNav.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={clsx(
                "flex items-center justify-between group p-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? `${item.bg} ${item.color} shadow-sm translate-x-1` 
                  : "text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              )}>
                <div className="flex items-center gap-4 relative z-10">
                  <div className={clsx(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isActive ? "bg-white/10 scale-110" : "group-hover:bg-white/5 group-hover:scale-110"
                  )}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={clsx("font-black text-sm tracking-tight", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>
                    {item.label}
                  </span>
                </div>
                {isActive && <div className="w-1.5 h-6 rounded-full bg-current absolute right-0 translate-x-1/2 opacity-20" />}
                {isActive && <ChevronRight size={14} className="animate-float" />}
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-6 border-t border-gray-200/10 dark:border-gray-800/50 mx-4 my-4 bg-[var(--bg-elevated)] rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[var(--syn-function)] flex items-center justify-center text-white font-black">
                {user?.name?.[0] || 'U'}
             </div>
             <div>
                <p className="text-xs font-black truncate w-24 capitalize">{user?.name || 'Super User'}</p>
                <p className="text-[9px] font-black text-[var(--syn-comment)] uppercase tracking-widest">{appMode} Mode</p>
             </div>
          </div>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ─── Main View ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile/Tablet Header with Shortcuts */}
        <header className="md:hidden glass border-b border-gray-200/10 dark:border-gray-800/50 p-4 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()}
                className="p-2.5 bg-[var(--bg-elevated)] rounded-2xl text-[var(--text-primary)] active:scale-90 transition-all shadow-sm"
              >
                 <ArrowLeft size={20} />
              </button>
              <h2 className="font-black text-xs uppercase tracking-[0.2em]">{pathname === '/' ? 'Home' : pathname.split('/')[1] || 'Dashboard'}</h2>
           </div>
           
           <div className="flex items-center gap-2">
              <Link href="/apps" className="p-2.5 bg-gradient-to-br from-[var(--syn-keyword)] to-[var(--syn-function)] text-white rounded-2xl shadow-lg shadow-purple-500/20 active:scale-90 transition-all flex items-center gap-2">
                 <Grid size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest pr-1">Apps</span>
              </Link>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-24 md:pb-0 bg-[var(--bg-primary)]">
          {children}
        </div>
      </main>

      {/* ─── Bottom Nav (Mobile) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-gray-200/10 dark:border-gray-800/50 flex items-center justify-between px-2 h-[76px] pb-safe z-50 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.4)]">
        {currentNav.slice(0, 5).map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={clsx(
              "flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 transition-all duration-300 h-full",
              isActive 
                ? `${item.color} scale-105` 
                : "text-[var(--syn-comment)] opacity-60"
            )}>
              <div className={clsx("p-2 rounded-2xl transition-all", isActive && item.bg)}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[7.5px] font-black tracking-tight uppercase truncate w-full text-center px-0.5">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <OfflineBanner />
    </div>
  )
}
