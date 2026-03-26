'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import useAuthStore from '@/store/useAuthStore'
import { getRandomDatingProfiles, swipeDating, getDatingMatches } from '@/services/apiServices'
import { Heart, X, Star, MapPin, MessageCircle, Sparkles, ChevronLeft, Settings, Filter, RotateCcw, Info } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

// ─── Tinder Card Component ──────────────────────────────────────────────────
const DatingCard = ({ profile, onSwipe, active, index }: { profile: any; onSwipe: (dir: 'left' | 'right' | 'up') => void; active: boolean; index: number }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1])
  const superLikeOpacity = useTransform(y, [-50, -150], [0, 1])

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipe('right')
    else if (info.offset.x < -100) onSwipe('left')
    else if (info.offset.y < -100) onSwipe('up')
  }

  return (
    <motion.div
      style={{ x, y, rotate, opacity, zIndex: 50 - index }}
      drag={active ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      className={clsx(
        "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing",
        !active && "pointer-events-none"
      )}
    >
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 dark:border-gray-800">
        <img
          src={profile.photos?.[0] || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80`}
          className="w-full h-full object-cover pointer-events-none"
          alt={profile.name}
        />
        
        {/* Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-12 left-10 border-4 border-green-500 text-green-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[-20deg] z-50">LIKE</motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-12 right-10 border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[20deg] z-50">NOPE</motion.div>
        <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 border-4 border-blue-400 text-blue-400 font-black text-3xl px-4 py-2 rounded-xl z-50 whitespace-nowrap">SUPER LIKE</motion.div>

        {/* Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <div className="flex items-end justify-between">
            <div className="drop-shadow-lg">
              <h2 className="text-4xl font-black text-white">{profile.name}, <span className="font-light">{profile.age || 25}</span></h2>
              <div className="flex items-center gap-2 text-gray-200 mt-2 font-medium">
                <MapPin size={16} className="text-pink-500" />
                <span>{profile.location || 'Within 5 km'}</span>
              </div>
            </div>
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20">
              <Info size={20} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(profile.interests || ['Music', 'Travel', 'Art', 'Fitness']).slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10">{tag}</span>
            ))}
          </div>

          <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 drop-shadow-md">
            {profile.bio || "Just exploring this amazing app and looking for someone to share coffee and stories with. ✨"}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function DatingPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMatches, setShowMatches] = useState(false)
  const [matchPopup, setMatchPopup] = useState<any>(null)
  const [history, setHistory] = useState<number[]>([])

  const { data: profiles = [], isLoading, isError } = useQuery({
    queryKey: ['dating-profiles'],
    queryFn: async () => {
      try {
        const data = await getRandomDatingProfiles()
        return data || []
      } catch {
        return generateFallbackProfiles()
      }
    },
    enabled: !!user?.id
  })

  const { data: matches = [] } = useQuery({
    queryKey: ['dating-matches', user?.id],
    queryFn: async () => {
      try {
        return await getDatingMatches(user!.id) || []
      } catch { return [] }
    },
    enabled: !!user?.id
  })

  const swipeMutation = useMutation({
    mutationFn: async ({ targetUserId, action }: { targetUserId: string; action: 'like' | 'dislike' }) => {
      return swipeDating(user!.id, targetUserId, action)
    },
    onSuccess: (data) => {
      if (data?.matched) {
        setMatchPopup(profiles[currentIndex])
      }
      queryClient.invalidateQueries({ queryKey: ['dating-matches'] })
    }
  })

  const handleSwipe = useCallback((dir: 'left' | 'right' | 'up') => {
    if (currentIndex >= profiles.length) return
    const profile = profiles[currentIndex]
    const action = dir === 'left' ? 'dislike' : 'like'
    
    setHistory(prev => [...prev, currentIndex])
    swipeMutation.mutate({ targetUserId: profile._id || profile.id, action })
    setCurrentIndex(prev => prev + 1)
  }, [currentIndex, profiles, swipeMutation])

  const undoLast = () => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))
    setCurrentIndex(last)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950 text-white relative overflow-hidden font-sans">
      {/* Top Background Gradient */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />

      {/* Match popup overlay */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-sm w-full">
              <motion.div 
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="relative flex justify-center items-center gap-4"
              >
                <div className="w-32 h-32 rounded-full border-4 border-pink-500 overflow-hidden shadow-2xl">
                  <img src={user?.avatar || `https://i.pravatar.cc/150?u=me`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-2xl">
                  <img src={matchPopup.photos?.[0] || `https://i.pravatar.cc/300?u=${matchPopup._id}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-xl">
                    <Heart className="text-pink-500 fill-pink-500" size={32} />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">It's a Match!</h2>
                <p className="text-gray-300 text-lg">You and <span className="font-bold text-white">{matchPopup.name}</span> liked each other.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href={`/chat/${matchPopup._id || matchPopup.id}`} className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 shadow-lg shadow-pink-500/20 active:scale-95 transition-all">
                  <MessageCircle size={22} /> SEND A MESSAGE
                </Link>
                <button onClick={() => setMatchPopup(null)} className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold hover:bg-white/20 transition-all text-white border border-white/10 active:scale-95">
                  KEEP SWIPING
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
           <Link href="/apps" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
             <ChevronLeft size={20} />
           </Link>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <h1 className="text-xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">TINDER CORE</h1>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMatches(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 relative group">
            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-gray-950 animate-bounce">{matches.length}</span>
            )}
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Matches Overlay */}
      <AnimatePresence>
        {showMatches && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full sm:w-96 bg-gray-950 border-l border-white/5 z-[80] flex flex-col shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-gray-950/50 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Your Matches</h2>
              <button onClick={() => setShowMatches(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {matches.length > 0 ? matches.map((match: any) => (
                <Link key={match._id || match.id} href={`/chat/${match._id || match.id}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="relative">
                    <img src={match.photos?.[0] || `https://i.pravatar.cc/150?u=${match._id}`} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg truncate group-hover:text-pink-500 transition-colors">{match.name}</h3>
                    <p className="text-xs text-gray-400 font-medium truncate">You matched with {match.name}!</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    <MessageCircle size={18} />
                  </div>
                </Link>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                    <Heart size={48} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-300">No matches yet</h4>
                    <p className="text-sm text-gray-500 mt-2">The right one is out there. Keep swiping to find them!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card Stack Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="w-full max-w-md aspect-[3/4.5] relative">
          <AnimatePresence>
            {isLoading ? (
              <motion.div 
                key="loading"
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900 rounded-[3rem] animate-pulse border-4 border-white/5 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Finding matches...</p>
                </div>
              </motion.div>
            ) : profiles.length > 0 && currentIndex < profiles.length ? (
              profiles.slice(currentIndex, currentIndex + 3).reverse().map((profile: any, i: number) => {
                const stackIndex = 2 - i; // Correcting slice.reverse logic
                const isActive = stackIndex === 0;
                return (
                  <DatingCard 
                    key={profile._id || profile.id}
                    profile={profile}
                    active={isActive}
                    index={stackIndex}
                    onSwipe={handleSwipe}
                  />
                )
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-8 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 flex items-center justify-center shadow-2xl shadow-pink-500/20">
                  <Sparkles size={48} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">Out of Profiles</h3>
                  <p className="text-gray-400 mt-3 font-medium">You've seen all potential matches in your area. Come back later for more!</p>
                </div>
                <button 
                  onClick={() => { setCurrentIndex(0); setHistory([]); queryClient.invalidateQueries({ queryKey: ['dating-profiles'] }) }} 
                  className="bg-white text-gray-900 px-10 py-4 rounded-3xl font-black flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-white/10"
                >
                  <RotateCcw size={20} /> REFRESH DISCOVERY
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Controls */}
      <div className="px-6 py-10 flex items-center justify-center gap-5 sm:gap-8 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-10">
        <button 
          onClick={undoLast}
          disabled={history.length === 0}
          className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-yellow-500 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <RotateCcw size={20} />
        </button>
        
        <button 
          onClick={() => handleSwipe('left')} 
          disabled={currentIndex >= profiles.length}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500 shadow-xl transition-all active:scale-90 disabled:opacity-50"
        >
          <X size={32} strokeWidth={3} />
        </button>
        
        <button 
          onClick={() => handleSwipe('up')} 
          disabled={currentIndex >= profiles.length}
          className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 active:scale-90 transition-all disabled:opacity-50"
        >
          <Star size={24} fill="currentColor" />
        </button>

        <button 
          onClick={() => handleSwipe('right')} 
          disabled={currentIndex >= profiles.length}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500/10 hover:border-green-500 shadow-xl transition-all active:scale-90 disabled:opacity-50"
        >
          <Heart size={32} fill="currentColor" strokeWidth={0} />
        </button>
        
        <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-400/10 active:scale-90 transition-all">
          <Zap size={20} fill="currentColor" className="text-purple-400" />
        </button>
      </div>

      {/* Lightning Icon Helper */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

function Zap({ size, fill, className }: { size: number; fill?: string; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill || "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function generateFallbackProfiles() {
  return [
    { id: '1', name: 'Aavya', age: 24, bio: 'Coffee addict and dog lover 🐶. Looking for someone to explore Mumbai with!', interests: ['Coffee', 'Dogs', 'Travel', 'Photography'], location: '2 km away', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'] },
    { id: '2', name: 'Ishani', age: 23, bio: 'Fitness freak and foodie. Can beat you in Mario Kart 🏎️', interests: ['Fitness', 'Food', 'Gaming', 'Netflix'], location: '4 km away', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'] },
    { id: '3', name: 'Zoya', age: 22, bio: 'Artist by day, dreamer by night 🎨. Let’s talk about life!', interests: ['Art', 'Music', 'Psychology', 'Nature'], location: '5 km away', photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'] },
    { id: '4', name: 'Diya', age: 25, bio: 'Solo traveler. 30 countries and counting ✈️. Next stop?', interests: ['Travel', 'Adventure', 'Hiking', 'Yoga'], location: '7 km away', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80'] },
    { id: '5', name: 'Riya', age: 24, bio: 'Always down for a spontaneous road trip 🚗', interests: ['Roadtrips', 'Music', 'Movies', 'Pizza'], location: '3 km away', photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80'] },
  ]
}
