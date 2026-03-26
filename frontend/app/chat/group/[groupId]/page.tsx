'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { socketService } from '@/lib/socket'
import {
  ArrowLeft, Send, Plus, Info, X, Users, Shield, ShieldOff,
  UserMinus, Edit3, Check, Loader2, BarChart2, Calendar,
  Clock, Bell, AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Msg { _id: string; senderId: string; content: string; type?: string; createdAt: string; reactions?: any[] }

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, isMe }: { msg: Msg; isMe: boolean }) {
  let parsed: any = null
  if (msg.type && msg.type !== 'text') try { parsed = JSON.parse(msg.content) } catch {}

  const renderContent = () => {
    if (parsed && msg.type === 'poll') return (
      <div className="space-y-2 min-w-[180px]">
        <p className="font-black text-sm">{parsed.question}</p>
        {parsed.options?.map((o: string, i: number) => (
          <div key={i} className="p-2 rounded-xl border-2 border-white/20 bg-white/10 text-xs font-bold">{o}</div>
        ))}
      </div>
    )
    if (msg.type === 'alert') return <div className="flex items-center gap-2"><AlertTriangle size={14}/><p className="text-sm font-bold">{msg.content}</p></div>
    if (msg.type === 'notice') return <div className="flex items-center gap-2"><Bell size={14}/><p className="text-sm font-bold">{msg.content}</p></div>
    if (msg.type === 'reminder') return <div className="flex items-center gap-2"><Clock size={14}/><p className="text-sm font-bold">{msg.content}</p></div>
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
  }

  return (
    <div className={clsx('flex px-4 mb-3', isMe ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-[75%] px-4 py-3 rounded-2xl shadow-sm',
        isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border dark:border-gray-700',
        msg.type === 'alert' && 'bg-red-500 text-white',
        msg.type === 'notice' && 'bg-amber-400 text-black',
        msg.type === 'reminder' && 'bg-indigo-500 text-white',
      )}>
        {renderContent()}
        <p className={clsx('text-[9px] mt-1 text-right', isMe ? 'opacity-60' : 'text-gray-400')}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default function GroupChatPage() {
  const { groupId } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const endRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [modal, setModal] = useState<'poll'|'event'|'reminder'|'notice'|'alert'|null>(null)
  const [specialText, setSpecialText] = useState('')
  const [pollQ, setPollQ] = useState(''); const [pollOpts, setPollOpts] = useState(['',''])
  const [eventData, setEventData] = useState({ title:'', date:'', time:'', location:'' })

  // Info panel state
  const [editDesc, setEditDesc] = useState(false)
  const [descVal, setDescVal] = useState('')
  const [addMemberId, setAddMemberId] = useState('')
  const [savingDesc, setSavingDesc] = useState(false)

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data } = await api.get(`/super-comm/group/${groupId}`)
      return data
    },
    enabled: !!groupId
  })

  const chatId = group?.chatId?._id || group?.chatId

  // Load messages
  useEffect(() => {
    if (!chatId) return
    api.get(`/super-comm/chat/${chatId}/messages`).then(r => {
      setMessages(Array.isArray(r.data) ? r.data : [])
    }).catch(() => {})
  }, [chatId])

  // Socket
  useEffect(() => {
    if (!user || !chatId) return
    const socket = socketService.connect(user)
    socketService.joinChat(chatId)
    socket?.on('message_received', (m: any) => {
      if (m.chatId === chatId) { setMessages(prev => [...prev, m]); endRef.current?.scrollIntoView({ behavior: 'smooth' }) }
    })
    return () => { socket?.off('message_received') }
  }, [user, chatId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (group?.description) setDescVal(group.description) }, [group])

  const isAdmin = group?.admins?.includes(user?.id)
  const groupName = group?.chatId?.chatName || 'Group'
  const participants: string[] = group?.chatId?.participants || []

  const sendMsg = async (type = 'text', content?: string) => {
    const msgContent = content ?? text
    if (!msgContent.trim() || !chatId) return
    setSending(true)
    const tempId = `t_${Date.now()}`
    const temp: Msg = { _id: tempId, senderId: user?.id || '', content: msgContent, type, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, temp])
    setText('')
    try {
      const { data } = await api.post('/super-comm/chat/message', { chatId, senderId: user?.id, content: msgContent })
      socketService.sendMessage(data)
      setMessages(prev => prev.map(m => m._id === tempId ? data : m))
    } catch { setMessages(prev => prev.filter(m => m._id !== tempId)) }
    finally { setSending(false) }
  }

  const sendSpecial = () => {
    if (modal === 'poll') {
      const opts = pollOpts.filter(o => o.trim())
      if (!pollQ.trim() || opts.length < 2) return
      sendMsg('poll', JSON.stringify({ question: pollQ, options: opts }))
      setPollQ(''); setPollOpts(['',''])
    } else if (modal === 'event') {
      if (!eventData.title.trim()) return
      sendMsg('event', JSON.stringify(eventData))
      setEventData({ title:'', date:'', time:'', location:'' })
    } else if (modal) {
      if (!specialText.trim()) return
      sendMsg(modal, specialText)
      setSpecialText('')
    }
    setModal(null)
  }

  const saveDesc = async () => {
    setSavingDesc(true)
    await api.patch(`/super-comm/group/${groupId}/description`, { description: descVal }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['group', groupId] })
    setEditDesc(false); setSavingDesc(false)
  }

  const makeAdmin = async (uid: string) => {
    await api.post(`/super-comm/group/${groupId}/admin`, { userId: uid }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['group', groupId] })
  }

  const removeAdmin = async (uid: string) => {
    await api.delete(`/super-comm/group/${groupId}/admin/${uid}`).catch(() => {})
    qc.invalidateQueries({ queryKey: ['group', groupId] })
  }

  const removeMember = async (uid: string) => {
    await api.delete(`/super-comm/group/${groupId}/members/${uid}`).catch(() => {})
    qc.invalidateQueries({ queryKey: ['group', groupId] })
  }

  const addMember = async () => {
    if (!addMemberId.trim()) return
    await api.post(`/super-comm/group/${groupId}/members`, { userIds: [addMemberId] }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['group', groupId] })
    setAddMemberId('')
  }

  if (isLoading) return <div className="flex items-center justify-center h-full dark:bg-gray-950"><Loader2 size={28} className="animate-spin text-blue-600"/></div>

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ArrowLeft size={20} className="dark:text-white"/></button>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
            {groupName[0]}
          </div>
          <div>
            <p className="font-black text-sm dark:text-white">{groupName}</p>
            <p className="text-[10px] text-gray-400">{participants.length} members</p>
          </div>
        </div>
        <button onClick={() => setShowInfo(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"><Info size={18}/></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {messages.map(msg => <Bubble key={msg._id} msg={msg} isMe={msg.senderId === user?.id}/>)}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-3 relative z-10">
        <div className="flex items-end gap-2">
          <button onClick={() => setShowAttach(!showAttach)}
            className={clsx('p-3 rounded-2xl transition-all shrink-0', showAttach ? 'bg-blue-600 text-white rotate-45' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
            <Plus size={22}/>
          </button>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 border-2 border-transparent focus-within:border-blue-500 transition-all">
            <textarea value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
              placeholder="Message group..." rows={1}
              className="w-full bg-transparent outline-none dark:text-white resize-none max-h-28 text-sm"/>
          </div>
          <button onClick={() => sendMsg()} disabled={!text.trim() || sending}
            className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0">
            {sending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
          </button>
        </div>
        {showAttach && (
          <div className="absolute bottom-full mb-3 left-3 right-3 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border dark:border-gray-800 p-5 grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
            {[
              { icon: BarChart2, label: 'Poll',     color: 'bg-purple-500', action: () => { setModal('poll');     setShowAttach(false) } },
              { icon: Calendar,  label: 'Event',    color: 'bg-blue-500',   action: () => { setModal('event');    setShowAttach(false) } },
              { icon: Clock,     label: 'Reminder', color: 'bg-indigo-500', action: () => { setModal('reminder'); setShowAttach(false) } },
              { icon: Bell,      label: 'Notice',   color: 'bg-amber-500',  action: () => { setModal('notice');   setShowAttach(false) } },
              { icon: AlertTriangle, label: 'Alert', color: 'bg-red-500',   action: () => { setModal('alert');    setShowAttach(false) } },
            ].map(item => (
              <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-2 group">
                <div className={clsx('p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform', item.color)}><item.icon size={22}/></div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Group Info Panel */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl border dark:border-gray-800 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-black text-lg dark:text-white">Group Info</h3>
              <button onClick={() => setShowInfo(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Group avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">{groupName[0]}</div>
                <div>
                  <p className="font-black text-lg dark:text-white">{groupName}</p>
                  <p className="text-sm text-gray-400">{participants.length} members</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                  {isAdmin && (
                    <button onClick={() => setEditDesc(!editDesc)} className="text-blue-500 text-xs font-bold flex items-center gap-1">
                      <Edit3 size={12}/>{editDesc ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>
                {editDesc ? (
                  <div className="space-y-2">
                    <textarea value={descVal} onChange={e => setDescVal(e.target.value)} rows={3}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-blue-500 rounded-xl p-3 text-sm dark:text-white outline-none resize-none"/>
                    <button onClick={saveDesc} disabled={savingDesc}
                      className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      {savingDesc ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{group?.description || 'No description yet.'}</p>
                )}
              </div>

              {/* Members */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Members ({participants.length})</p>
                {participants.map((uid: string) => {
                  const isThisAdmin = group?.admins?.includes(uid)
                  const isMe = uid === user?.id
                  return (
                    <div key={uid} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm uppercase shrink-0">{uid[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold dark:text-white truncate">{uid}{isMe && ' (You)'}</p>
                        {isThisAdmin && <p className="text-[9px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1"><Shield size={9}/>Admin</p>}
                      </div>
                      {isAdmin && !isMe && (
                        <div className="flex gap-1">
                          {!isThisAdmin ? (
                            <button onClick={() => makeAdmin(uid)} title="Make admin" className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"><Shield size={14}/></button>
                          ) : (
                            <button onClick={() => removeAdmin(uid)} title="Remove admin" className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"><ShieldOff size={14}/></button>
                          )}
                          <button onClick={() => removeMember(uid)} title="Remove member" className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><UserMinus size={14}/></button>
                        </div>
                      )}
                      {/* Self: remove self as admin */}
                      {isMe && isThisAdmin && (
                        <button onClick={() => removeAdmin(uid)} className="text-[10px] text-orange-500 font-black px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          Leave Admin
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add member */}
              {isAdmin && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Member</p>
                  <div className="flex gap-2">
                    <input value={addMemberId} onChange={e => setAddMemberId(e.target.value)} placeholder="User ID"
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                    <button onClick={addMember} className="bg-blue-600 text-white px-4 rounded-xl font-black text-sm active:scale-95 transition-all">Add</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special message modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl border dark:border-gray-800 overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-black text-lg dark:text-white capitalize">Create {modal}</h3>
              <button onClick={() => setModal(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              {modal === 'poll' && (
                <>
                  <input value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Your question..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 rounded-xl p-3.5 font-bold dark:text-white outline-none"/>
                  {pollOpts.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={o} onChange={e => { const n=[...pollOpts]; n[i]=e.target.value; setPollOpts(n) }} placeholder={`Option ${i+1}`}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                      {pollOpts.length > 2 && <button onClick={() => setPollOpts(pollOpts.filter((_,j)=>j!==i))} className="p-2 text-red-400"><X size={16}/></button>}
                    </div>
                  ))}
                  {pollOpts.length < 6 && <button onClick={() => setPollOpts([...pollOpts,''])} className="text-purple-500 text-xs font-black uppercase tracking-widest">+ Add Option</button>}
                </>
              )}
              {modal === 'event' && (
                <>
                  <input value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} placeholder="Event title"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 font-bold dark:text-white outline-none"/>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} placeholder="Date"
                      className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                    <input value={eventData.time} onChange={e => setEventData({...eventData, time: e.target.value})} placeholder="Time"
                      className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                  </div>
                  <input value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} placeholder="Location"
                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                </>
              )}
              {['reminder','notice','alert'].includes(modal) && (
                <textarea value={specialText} onChange={e => setSpecialText(e.target.value)} placeholder={`${modal} message...`} rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 dark:text-white outline-none resize-none"/>
              )}
            </div>
            <div className="p-5 border-t dark:border-gray-800">
              <button onClick={sendSpecial} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl uppercase tracking-widest active:scale-95 transition-all">
                Send {modal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
