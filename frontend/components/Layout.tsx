'use client'

import { useAuth } from '@/hooks/useAuth'
import useAuthStore from '@/store/useAuthStore'
import { 
  Home, MessageCircle, Compass, Grid, User, LogOut, 
  LayoutDashboard, Briefcase, Code2, Rss, Utensils, 
  ShoppingBag, Wallet, ChevronRight, ShieldCheck, 
  Truck, Store, Info
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isReady } = useAuth()
  const { appMode, setAppMode } = useAuthStore()
  const pathname = usePathname()
  const [showModeInfo, setShowModeInfo] = useState(false)

  if (!isReady) return null
  if (!isAuthenticated) return <>{children}</>

  const navItems = {
    user: [
      { label: 'Home', icon: Home, href: '/' },
      { label: 'Feed', icon: Rss, href: '/feed' },
      { label: 'Messages', icon: MessageCircle, href: '/chat' },
      { label: 'Apps', icon: Grid, href: '/apps' },
      { label: 'Settings', icon: User, href: '/settings' },
    ],
    business: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/business-dashboard' },
      { label: 'Listings', icon: Store, href: '/marketplace/manage' },
      { label: 'Ride Jobs', icon: Truck, href: '/rides/jobs' },
      { label: 'Analytics', icon: ShieldCheck, href: '/business/analytics' },
      { label: 'Settings', icon: User, href: '/settings' },
    ]
  }

  const currentNav = navItems[appMode as 'user' | 'business'] || navItems.user

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-6">
            <h1 className="font-black text-2xl tracking-tighter text-blue-600 dark:text-blue-400">SUPERAPP</h1>
        </div>

        {/* Mode Switcher */}
        <div className="px-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl flex gap-1 border dark:border-gray-700">
                {(['user', 'business'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setAppMode(mode)}
                        className={clsx(
                            "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                            appMode === mode 
                                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" 
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {mode}
                    </button>
                ))}
            </div>
            <button 
                onMouseEnter={() => setShowModeInfo(true)}
                onMouseLeave={() => setShowModeInfo(false)}
                className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-blue-500 ml-1 transition-colors"
            >
                <Info size={12} />
                What are App Modes?
            </button>
            
            {showModeInfo && (
                <div className="absolute left-72 top-20 w-64 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-50 animate-in fade-in slide-in-from-left-2">
                    <h4 className="font-bold text-sm mb-2 dark:text-white">Switching App Modes</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="text-blue-500 font-bold">USER:</span> Standard mode for social, shopping, and booking.<br/><br/>
                        <span className="text-green-500 font-bold">BUSINESS:</span> Management tools for merchants, service providers, and drivers.
                    </p>
                </div>
            )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentNav.map(item => (
            <Link key={item.href} href={item.href} className={clsx(
              "flex items-center justify-between group p-3 rounded-xl transition-all",
              pathname === item.href 
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}>
              <div className="flex items-center gap-3">
                <item.icon size={20} className={clsx(pathname === item.href ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                <span className="font-medium">{item.label}</span>
              </div>
              {pathname === item.href && <ChevronRight size={14} />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button onClick={logout} className="flex items-center gap-3 p-3 w-full text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t dark:border-gray-700 flex justify-around p-3 pb-safe z-50">
        {currentNav.slice(0, 5).map(item => (
          <Link key={item.href} href={item.href} className={clsx(
            "flex flex-col items-center gap-1 px-2 py-1 rounded-lg",
            pathname === item.href ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
          )}>
            <item.icon size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
