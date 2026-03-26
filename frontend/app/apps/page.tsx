'use client'

import Link from 'next/link'
import useAuthStore from '@/store/useAuthStore'
import { 
  ShoppingBag, Utensils, Wallet, Code2, Briefcase, Car, ShieldCheck,
  Heart, MessageSquare, Zap, ZapOff, Smartphone, MapPin, Search
} from 'lucide-react'

const appsList = [
  // Social & Communication
  { name: 'Dating',         icon: Heart,        color: 'bg-gradient-to-br from-pink-500 to-red-500',    href: '/dating',                desc: 'Swipe & match' },
  { name: 'Blind Date',     icon: MessageSquare,color: 'bg-gradient-to-br from-purple-600 to-blue-600', href: '/random-chat',           desc: 'Anonymous chat' },
  { name: 'Stories',        icon: Smartphone,   color: 'bg-gradient-to-br from-yellow-400 to-orange-500',href: '/status',               desc: 'Share your day' },
  { name: 'Snaps',          icon: ZapOff,       color: 'bg-gradient-to-br from-yellow-500 to-amber-600',href: '/snaps',                 desc: 'Disappearing media' },

  // Rides & Travel
  { name: 'Ride Hailing',   icon: Car,          color: 'bg-gradient-to-br from-blue-500 to-indigo-600', href: '/rides',                 desc: 'Car, Auto, Bike' },
  { name: 'Hotel Booking',  icon: MapPin,       color: 'bg-gradient-to-br from-teal-500 to-cyan-600',   href: '/services/hotel',        desc: 'Book rooms' },
  { name: 'Table Booking',  icon: Utensils,     color: 'bg-gradient-to-br from-orange-500 to-red-500',  href: '/services/table-booking',desc: 'Reserve a table' },

  // Shopping & Food
  { name: 'Marketplace',    icon: ShoppingBag,  color: 'bg-gradient-to-br from-blue-600 to-blue-800',   href: '/marketplace',           desc: 'Buy & sell' },
  { name: 'Food Delivery',  icon: Utensils,     color: 'bg-gradient-to-br from-red-500 to-orange-500',  href: '/food',                  desc: 'Order food' },

  // Games
  { name: 'Games',          icon: Zap,          color: 'bg-gradient-to-br from-green-500 to-emerald-600',href: '/apps/games',           desc: 'Play with friends' },

  // Professional
  { name: 'Coding Hub',     icon: Code2,        color: 'bg-gradient-to-br from-indigo-500 to-purple-600',href: '/coding',               desc: 'Dev stats' },
  { name: 'Professional',   icon: Briefcase,    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',href: '/professional',          desc: 'Jobs & network' },

  // Finance
  { name: 'Wallet',         icon: Wallet,       color: 'bg-gradient-to-br from-blue-500 to-cyan-500',   href: '/wallet',                desc: 'Payments' },
  { name: 'Local Services', icon: ShieldCheck,  color: 'bg-gradient-to-br from-gray-600 to-gray-800',   href: '/services',              desc: 'Hire pros' },
]

export default function AppsPage() {
  const { addActivity } = useAuthStore()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-24 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">Mini Apps</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Explore the unified ecosystem.</p>
        </div>
        <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search mini apps..." 
                className="w-full bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] py-3 pl-12 pr-4 outline-none dark:text-white shadow-sm transition-all"
            />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {appsList.map((app) => (
          <Link 
            key={app.name} 
            href={app.href} 
            onClick={() => {
                addActivity({
                    id: Date.now().toString(),
                    type: 'purchase',
                    title: `Opened ${app.name}`,
                    status: 'Active',
                    time: 'Just now'
                })
            }}
            className="group bg-white dark:bg-gray-900 p-5 md:p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className={`${app.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <app.icon size={28} />
              </div>
              <div>
                <h3 className="font-black text-sm md:text-lg dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-1">{app.name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">{app.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
