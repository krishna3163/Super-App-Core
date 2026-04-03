'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Users } from 'lucide-react'

export default function CallUI({ isVideo, callerName, onEndCall }: { isVideo: boolean, callerName: string, onEndCall: () => void }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(isVideo)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setDuration(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
        <div>
          <h2 className="text-2xl font-bold">{callerName}</h2>
          <p className="text-gray-300 font-mono tracking-widest mt-1">{formatTime(duration)}</p>
        </div>
        <div className="flex gap-4">
          <button className="p-2 bg-gray-800/50 hover:bg-gray-700 backdrop-blur-md rounded-lg transition-colors">
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Main Video/Avatar Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {isVideoOn ? (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            {/* Main Video Stream */}
            <span className="text-gray-600 font-mono tracking-widest uppercase">Remote Video Stream Active</span>
            
            {/* Picture-in-Picture (Local Stream) */}
            <div className="absolute bottom-32 right-6 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 z-20 flex items-center justify-center">
              <span className="text-xs text-gray-500">You</span>
            </div>
          </div>
        ) : (
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-6xl font-bold shadow-2xl shadow-blue-900/50 animate-pulse">
            {callerName[0]}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black/90 to-transparent p-8 pb-12 flex justify-center items-center gap-6 absolute bottom-0 w-full">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-black' : 'bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md text-white'}`}
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {isVideo && (
          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-all ${!isVideoOn ? 'bg-white text-black' : 'bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md text-white'}`}
          >
            {isVideoOn ? <Video size={28} /> : <VideoOff size={28} />}
          </button>
        )}

        {isVideo && (
          <button className="p-4 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md rounded-full text-white transition-all">
            <MonitorUp size={28} />
          </button>
        )}

        <button 
          onClick={onEndCall}
          className="p-5 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg shadow-red-900/50 transition-all hover:scale-105"
        >
          <PhoneOff size={32} />
        </button>
      </div>
    </div>
  )
}
