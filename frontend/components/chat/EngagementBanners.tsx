'use client'

import { AlertTriangle, BellRing, CalendarClock, X } from 'lucide-react'
import { useState } from 'react'

export function EngagementBanners({ engagements }: { engagements: any[] }) {
  const [hidden, setHidden] = useState<string[]>([])

  const visibleEngagements = engagements.filter(e => !hidden.includes(e._id))

  if (visibleEngagements.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-2 p-2 absolute top-16 left-0 right-0 z-20">
      {visibleEngagements.map(eng => {
        let colors = ''
        let Icon = BellRing
        
        switch(eng.type) {
          case 'alert':
            colors = 'bg-red-500 text-white'
            Icon = AlertTriangle
            break
          case 'notice':
            colors = 'bg-blue-500 text-white'
            Icon = BellRing
            break
          case 'event':
            colors = 'bg-purple-500 text-white'
            Icon = CalendarClock
            break
          default:
            colors = 'bg-gray-800 text-white'
        }

        return (
          <div key={eng._id} className={`flex items-center justify-between p-3 rounded-lg shadow-lg animate-in slide-in-from-top ${colors}`}>
            <div className="flex items-center gap-3">
              <Icon size={20} className={eng.type === 'alert' ? 'animate-pulse' : ''} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{eng.type}</span>
                <p className="font-semibold text-sm leading-tight">{eng.title}</p>
              </div>
            </div>
            <button 
              onClick={() => setHidden([...hidden, eng._id])}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
