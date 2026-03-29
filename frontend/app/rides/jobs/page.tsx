'use client'

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import {
  Car, MapPin, CheckCircle2, Star, Clock, 
  Navigation, Phone, MessageCircle, AlertCircle,
  TrendingUp, Users, ShieldCheck, Zap, Bell, 
  Map as MapIcon, ChevronRight, Search
} from 'lucide-react'
import Link from 'next/link'

export default function RideJobsPage() {
  const { user, appMode } = useAuthStore()
  const [isOnline, setIsOnline] = useState(false)
  const [requests, setRequests] = useState([
    { 
        id: '1', 
        fare: 320.50, 
        type: 'Auto', 
        pickup: 'Connaught Place (CP)', 
        drop: 'Saket Mall', 
        distance: '8.4 km', 
        pickupDist: '1.2 km',
        user: { name: 'Aditya R.', rating: 4.8 }
    },
    { 
        id: '2', 
        fare: 155.00, 
        type: 'Bike', 
        pickup: 'Hauz Khas Village', 
        drop: 'Green Park Metro', 
        distance: '2.1 km', 
        pickupDist: '0.5 km',
        user: { name: 'Neha S.', rating: 4.9 }
    },
    { 
        id: '3', 
        fare: 540.00, 
        type: 'Sedan', 
        pickup: 'Indira Gandhi Airport (T3)', 
        drop: 'Gurgaon Sector 44', 
        distance: '18.2 km', 
        pickupDist: '3.1 km',
        user: { name: 'Vikram M.', rating: 4.7 }
    }
  ])

  // Mock earnings
  const earnings = { today: 1240.00, rides: 8, hours: 5.5 }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Car size={120} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Driver Dashboard</h1>
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Status: {isOnline ? 'Accepting Rides' : 'Offline'}</p>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                isOnline 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-white hover:bg-emerald-50 text-emerald-600 shadow-white/10'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Today</p>
                <p className="text-lg font-black">₹{earnings.today}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Rides</p>
                <p className="text-lg font-black">{earnings.rides}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Hours</p>
                <p className="text-lg font-black">{earnings.hours}</p>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 -mt-6 space-y-6">
        {/* Toggle Alert */}
        {!isOnline && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <p className="font-black text-sm text-amber-900 dark:text-amber-200 uppercase tracking-tight">You are currently offline</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Go online to start receiving ride requests in your area.</p>
                </div>
            </div>
        )}

        {/* Live Requests Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">
                    {isOnline ? 'Live Requests Nearby' : 'Recent Activity'}
                </h2>
                {isOnline && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
            </div>

            <div className="space-y-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                                    {req.type === 'Auto' ? '🛺' : req.type === 'Bike' ? '🏍️' : '🚗'}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-white text-base">₹{req.fare.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.type} · {req.distance}</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                                {req.pickupDist} away
                            </div>
                        </div>

                        <div className="space-y-3 mb-5 pl-2 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-2">
                            <div className="flex items-start gap-3 relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 shadow-lg shadow-blue-500/40" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pickup</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{req.pickup}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0 shadow-lg shadow-orange-500/40" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Drop-off</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{req.drop}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                                <img src={`https://i.pravatar.cc/100?u=u_${req.id}`} className="w-8 h-8 rounded-xl object-cover" alt="" />
                                <div>
                                    <p className="text-[10px] font-black dark:text-white leading-none">{req.user.name}</p>
                                    <div className="flex items-center gap-1 text-yellow-500 text-[9px] mt-0.5 font-bold">
                                        <Star size={8} fill="currentColor" /> {req.user.rating}
                                    </div>
                                </div>
                            </div>
                            <button 
                                disabled={!isOnline}
                                className={`flex-[1.5] py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    isOnline 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                Accept <CheckCircle2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Safety & Info */}
        <div className="grid grid-cols-2 gap-4 pb-10">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-800">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center text-blue-600 mb-3">
                    <ShieldCheck size={20} />
                </div>
                <p className="font-black text-blue-900 dark:text-blue-200 text-xs uppercase tracking-tight">Insurance</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold mt-1">Your rides are fully covered by SuperApp Protect.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-[2rem] border border-purple-100 dark:border-purple-800">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-800/40 flex items-center justify-center text-purple-600 mb-3">
                    <TrendingUp size={20} />
                </div>
                <p className="font-black text-purple-900 dark:text-purple-200 text-xs uppercase tracking-tight">Incentives</p>
                <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-1">Complete 5 more rides to earn ₹500 bonus!</p>
            </div>
        </div>
      </main>
    </div>
  )
}
