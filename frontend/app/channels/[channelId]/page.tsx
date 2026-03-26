'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { ArrowLeft, Bell, Info, Send, X, Users, Shield, Edit3, Check, Loader2, Plus } from 'lucide-react'
import clsx from 'clsx'

export default function ChannelPage() {
  const { channelId } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const endRef = useRef<HTMLDivElement>(null)

  const [showInfo, setShowInfo] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [editDesc, setEditDesc] = useState(false)
  const [descVal, setDescVal] = useState('')
  const [addAdminId, setAddAdminId] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  const { data: channel, isLoading } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const { data } = await api.get(`/super-comm/channel/${channelId}`)
      return data
    },
    enabled: !!channelId
  })

  useEffect(() => {
    if (!channelId) return
    api.get(`/super-comm/channel/${channelId}/messages`).then(r => {
      setMessages(Array.isArray(r.data) ? r.data : [])
    }).catch(() => {})
  }, [channelId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (channel?.description) setDescVal(channel.description) }, [channel])

  const isAdmin = channel?.admins?.includes(user?.id)

  const sendMsg = async () => {
    if (!msgText.trim() || !isAdmin) return
    setSending(true)
    try {
      const { data } = await api.post(`/super-comm/channel/${channelId}/message`, {
        senderId: user?.id, content: msgText
      })
      setMessages(prev => [...prev, data])
      setMsgText('')
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const saveDesc = async () => {
    await api.patch(`/super-comm/channel/${channelId}`, { description: descVal }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['channel', channelId] })
    setEditDesc(false)
  }

  const makeAdmin = async () => {
    if (!addAdminId.trim()) return
    await api.post(`/super-comm/channel/${channelId}/admin`, { userId: addAdminId }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['channel', channelId] })
    setAddAdminId('')
  }

  if (isLoading) return <div className="p-8 text-center dark:text-white animate-pulse">Loading channel...</div>

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ArrowLeft size={20} className="dark:text-white"/></button>
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
            {channel?.name?.[0] || 'C'}
          </div>
          <div>
            <p className="font-black text-sm dark:text-white">{channel?.name || 'Channel'}</p>
            <p className="text-[10px] text-gray-400">{channel?.subscribers?.length || 0} subscribers</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"><Bell size={18}/></button>
          <button onClick={() => setShowInfo(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"><Info size={18}/></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="font-bold">No posts yet</p>
            {isAdmin && <p className="text-sm mt-1">You're an admin — send the first message!</p>}
          </div>
        )}
        {messages.map((msg: any) => (
          <div key={msg._id} className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border dark:border-gray-800">
            <p className="text-sm dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            <p className="text-[10px] text-gray-400 mt-3 font-bold">
              {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input — only admins can post */}
      {isAdmin ? (
        <div className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-3 flex gap-2">
          <input value={msgText} onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Broadcast a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500/20" />
          <button onClick={sendMsg} disabled={!msgText.trim() || sending}
            className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all">
            {sending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 text-center">
          <button onClick={async () => {
            await api.post(`/super-comm/channel/${channelId}/subscribe`, { userId: user?.id }).catch(() => {})
            qc.invalidateQueries({ queryKey: ['channel', channelId] })
          }} className="bg-indigo-600 text-white font-black px-8 py-3 rounded-2xl text-sm active:scale-95 transition-all">
            Subscribe to Channel
          </button>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl border dark:border-gray-800 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-black text-lg dark:text-white">Channel Info</h3>
              <button onClick={() => setShowInfo(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Channel name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                  {channel?.name?.[0]}
                </div>
                <div>
                  <p className="font-black text-lg dark:text-white">{channel?.name}</p>
                  <p className="text-sm text-gray-400">{channel?.subscribers?.length} subscribers</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                  {isAdmin && (
                    <button onClick={() => setEditDesc(!editDesc)} className="text-indigo-500 text-xs font-bold flex items-center gap-1">
                      <Edit3 size={12}/> {editDesc ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>
                {editDesc ? (
                  <div className="space-y-2">
                    <textarea value={descVal} onChange={e => setDescVal(e.target.value)} rows={3}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-indigo-500 rounded-xl p-3 text-sm dark:text-white outline-none resize-none" />
                    <button onClick={saveDesc} className="w-full bg-indigo-600 text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                      <Check size={14}/> Save Description
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{channel?.description || 'No description yet.'}</p>
                )}
              </div>

              {/* Admins */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admins</p>
                {channel?.admins?.map((adminId: string) => (
                  <div key={adminId} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                      {adminId[0]}
                    </div>
                    <p className="text-sm font-bold dark:text-white flex-1">{adminId}</p>
                    <Shield size={14} className="text-indigo-500"/>
                  </div>
                ))}
              </div>

              {/* Add admin (owner only) */}
              {channel?.ownerId === user?.id && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Sub-Admin</p>
                  <div className="flex gap-2">
                    <input value={addAdminId} onChange={e => setAddAdminId(e.target.value)}
                      placeholder="User ID to make admin"
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none" />
                    <button onClick={makeAdmin} className="bg-indigo-600 text-white px-4 rounded-xl font-black text-sm active:scale-95 transition-all">
                      <Plus size={16}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
