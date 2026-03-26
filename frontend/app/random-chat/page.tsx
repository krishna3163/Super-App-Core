'use client'

import { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { Timer, Search, XCircle, Heart, UserX } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export default function RandomChatPage() {
  const { user } = useAuthStore()
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'searching' | 'connected' | 'finished'>('idle')
  const [timeLeft, setTimeLeft] = useState(60)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5050'
    const socket = io(baseUrl)
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to socket', socket.id)
      if (user?.id) {
        socket.emit('register_user', user.id)
      }
    })

    socket.on('user_matched', (data: any) => {
      setSession({ ...data, status: 'active' })
      setStatus('connected')
      setTimeLeft(60)
      if (data.sessionId) socket.emit('join_session', data.sessionId)
    })

    socket.on('receive_message', (msg: any) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('session_ended', () => {
       setStatus('finished')
    })

    return () => {
      socket.disconnect()
    }
  }, [user?.id])

  const findMatch = async (mode: 'random_chat' | 'micro_dating' = 'random_chat') => {
    setStatus('searching')
    try {
      const { data } = await api.post('/advanced-interactions/random/match', {
        userId: user?.id,
        mode
      })
      
      // If it returns a session that's active, we matched immediately
      if (data.status === 'active') {
        setSession(data)
        setStatus('connected')
        setTimeLeft(60)
        socketRef.current?.emit('join_session', data.sessionId || data._id)
      } else {
        // Wait for 'user_matched' socket event
      }
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  const skipMatch = async () => {
    if (session?._id || session?.sessionId) {
      await api.post('/advanced-interactions/random/skip', { sessionId: session._id || session.sessionId, userId: user?.id })
    }
    setSession(null)
    setMessages([])
    findMatch()
  }

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'connected' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && status === 'connected') {
      setStatus('finished')
      socketRef.current?.emit('end_session', session?.sessionId || session?._id)
    }
    return () => clearInterval(timer)
  }, [status, timeLeft, session])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    const newMsg = { senderId: user?.id, text: inputText, sessionId: session?.sessionId || session?._id }
    setMessages([...messages, newMsg])
    setInputText('')
    
    socketRef.current?.emit('send_message', newMsg)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <UserX className="text-purple-500" /> Anonymous Chat
        </h1>
        {status === 'connected' && (
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold ${timeLeft <= 10 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-800 text-gray-300'}`}>
            <Timer size={18} /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-900/50">
              <UserX size={48} className="text-white" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Talk to Strangers</h2>
              <p className="text-gray-400 max-w-sm">100% Anonymous. 60 seconds per chat. Be kind and have fun!</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => findMatch('random_chat')} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-transform active:scale-95">
                Start Chat
              </button>
              <button onClick={() => findMatch('micro_dating')} className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-transform active:scale-95 flex items-center gap-2">
                <Heart size={18} /> Micro-Dating
              </button>
            </div>
          </div>
        )}

        {status === 'searching' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gray-800"></div>
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent absolute inset-0 animate-spin"></div>
              <Search className="absolute inset-0 m-auto text-purple-500" size={32} />
            </div>
            <p className="text-gray-400 animate-pulse font-medium tracking-widest">LOOKING FOR A STRANGER...</p>
            <button onClick={() => setStatus('idle')} className="text-red-500 text-sm font-bold mt-4 hover:underline">Cancel</button>
          </div>
        )}

        {status === 'connected' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">You are now talking to Stranger</span>
              </div>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.senderId === user?.id ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <button type="button" onClick={skipMatch} className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-full transition-colors flex items-center gap-2 font-bold px-6">
                  Skip
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 bg-gray-800 border-none rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="Type a message..."
                />
              </form>
            </div>
          </>
        )}

        {status === 'finished' && (
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <h2 className="text-3xl font-bold">Time's Up! ⏱️</h2>
            <p className="text-gray-400">Did you enjoy this conversation?</p>
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => findMatch()} className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-gray-700 transition-colors">
                <XCircle className="text-red-500" /> Nah, Skip
              </button>
              <button onClick={() => findMatch()} className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-gray-700 transition-colors">
                <Heart className="text-green-500 fill-green-500" /> Yes, Match!
              </button>
            </div>
            <button onClick={() => setStatus('idle')} className="text-gray-500 hover:text-white text-sm mt-4">Return to menu</button>
          </div>
        )}
      </div>
    </div>
  )
}
