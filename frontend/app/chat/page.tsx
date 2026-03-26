'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import { Search, Plus, MessageCircle, X, Users, Hash, ChevronRight, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Av = ({ name, avatar, size = 14 }: { name?: string; avatar?: string; size?: number }) => {
  const sz = `w-${size} h-${size}`
  if (avatar) return <img src={avatar} className={clsx(sz, 'rounded-2xl object-cover shrink-0')} alt="" />
  return (
    <div className={clsx(sz, 'rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shrink-0 uppercase text-sm')}>
      {name?.[0] || 'U'}
    </div>
  )
}

type ModalType = 'chat' | 'group' | 'channel' | null

export default function ChatListPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [modalName, setModalName] = useState('')
  const [modalDesc, setModalDesc] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (searchParams.get('search') === 'true') setSearchQuery(' ')
  }, [searchParams])

  // Fetch existing chats, groups, and channels
  const { data: allConversations = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const [regularChats, superGroups, superChannels] = await Promise.all([
        api.get(`/chats?userId=${user?.id}`).then(r => r.data).catch(() => []),
        api.get(`/super-comm/group/user/${user?.id}`).then(r => r.data).catch(() => []),
        api.get(`/super-comm/channel/user/${user?.id}`).then(r => r.data).catch(() => [])
      ]);

      const merged = [
        ...regularChats.map((c: any) => ({ ...c, type: 'chat' })),
        ...superGroups.map((g: any) => ({ ...g.chat, type: 'group', groupId: g.group._id })),
        ...superChannels.map((c: any) => ({ ...c, type: 'channel', chatId: c._id }))
      ];

      return merged.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    },
    enabled: !!user?.id
  })

  // Search users
  const { data: searchUsers = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', searchQuery.trim()],
    queryFn: async () => {
      const { data } = await api.get('/users/profile/list').catch(() => ({ data: [] }))
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      if (!searchQuery.trim()) return list
      return list.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    enabled: true
  })

  const toggleUser = (u: any) => {
    const id = u.userId || u._id;
    setSelectedUsers(prev =>
      prev.find(x => (x.userId || x._id) === id) ? prev.filter(x => (x.userId || x._id) !== id) : [...prev, u]
    )
  }

  const handleCreate = async () => {
    if (!user?.id) return
    setCreating(true)
    try {
      if (modal === 'channel') {
        const res = await api.post('/super-comm/channel/create', {
          name: modalName, description: modalDesc, ownerId: user.id
        })
        const channelId = res.data?._id || res.data?.id;
        if (channelId && selectedUsers.length > 0) {
          await api.post(`/super-comm/channel/${channelId}/members`, {
            userIds: selectedUsers.map(u => u.userId || u._id)
          }).catch(() => {});
        }
      } else if (modal === 'group') {
        await api.post('/super-comm/group/create', {
          name: modalName, description: modalDesc,
          participants: selectedUsers.map(u => u.userId || u._id),
          adminId: user.id
        })
      } else if (modal === 'chat' && selectedUsers.length > 0) {
        const targetId = selectedUsers[0].userId || selectedUsers[0]._id;
        await api.post('/chats', {
          userId: user.id,
          targetUserId: targetId
        })
        router.push(`/chat/${targetId}`)
        setModal(null); return
      }
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setModal(null); setModalName(''); setModalDesc(''); setSelectedUsers([])
    } catch (e) { console.error(e) }
    finally { setCreating(false) }
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* ── Create Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl border dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg dark:text-white capitalize">Create {modal}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {modal === 'channel' ? 'Broadcast to subscribers' : modal === 'group' ? 'Group conversation' : 'Direct message'}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {modal !== 'chat' && (
                <>
                  <input value={modalName} onChange={e => setModalName(e.target.value)}
                    placeholder={`${modal === 'channel' ? 'Channel' : 'Group'} name`}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 font-bold dark:text-white outline-none transition-all" />
                  <input value={modalDesc} onChange={e => setModalDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none" />
                </>
              )}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {modal === 'chat' ? 'Select person' : 'Add members'}
                </p>
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedUsers.map(u => (
                      <span key={u.userId || u._id} className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                        {u.name}
                        <button onClick={() => toggleUser(u)}><X size={12}/></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {searchUsers.map((u: any) => (
                    <label key={u.userId || u._id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer">
                      <input type={modal === 'chat' ? 'radio' : 'checkbox'} name="user"
                        checked={!!selectedUsers.find(x => (x.userId || x._id) === (u.userId || u._id))}
                        onChange={() => modal === 'chat' ? setSelectedUsers([u]) : toggleUser(u)}
                        className="accent-blue-600 w-4 h-4" />
                      <Av name={u.name} avatar={u.avatar} size={9} />
                      <div>
                        <p className="text-sm font-bold dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-gray-400">@{u.userId || u._id}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-800">
              <button onClick={handleCreate}
                disabled={creating || (modal !== 'chat' && !modalName.trim()) || (modal === 'chat' && selectedUsers.length === 0)}
                className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95">
                {creating && <Loader2 size={16} className="animate-spin" />}
                {modal === 'chat' ? 'Open Chat' : `Create ${modal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="p-5 border-b dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Messages</h1>
          <div className="flex gap-2">
            <button onClick={() => setModal('channel')} className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl text-[10px] font-black flex items-center gap-1 px-3">
              <Hash size={14}/> Channel
            </button>
            <button onClick={() => setModal('group')} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1 px-3">
              <Users size={14}/> Group
            </button>
            <button onClick={() => setModal('chat')} className="p-2 bg-blue-600 text-white rounded-xl">
              <Plus size={18}/>
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search people, groups..."
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 ring-blue-500/20 dark:text-white text-sm transition-all" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">People</p>
            {searching && <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>}
            {searchUsers.map((u: any) => (
              <Link href={`/chat/${u.userId || u._id}`} key={u.userId || u._id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group">
                <Av name={u.name} avatar={u.avatar} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm dark:text-white">{u.name}</p>
                  <p className="text-[10px] text-gray-400">@{u.userId || u._id}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white p-2 rounded-xl">
                  <MessageCircle size={16}/>
                </div>
              </Link>
            ))}
            {!searching && searchUsers.length === 0 && (
              <p className="p-6 text-center text-gray-400 text-sm">No users found</p>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent</p>
            {chatsLoading ? (
              [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mx-1 mb-2" />)
            ) : allConversations.length > 0 ? allConversations.map((chat: any) => {
              const isGroup = chat.type === 'group'
              const isChannel = chat.type === 'channel'
              const otherUser = chat.users?.find((u: any) => u.userId !== user?.id)
              const name = chat.chatName || chat.name || otherUser?.userId || 'Chat'
              
              let href = `/chat/${chat._id}`
              if (isGroup) href = `/chat/group/${chat.groupId}`
              if (isChannel) href = `/channels/${chat.chatId}`
              
              return (
                <Link href={href} key={chat._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group">
                  <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0',
                    isGroup ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 
                    isChannel ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}>
                    {isGroup ? <Users size={22}/> : isChannel ? <Hash size={22}/> : name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm dark:text-white truncate">{name}</p>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{chat.latestMessage?.content || 'No messages yet'}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Link>
              )
            }) : (
              <div className="p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
                  <MessageCircle size={32}/>
                </div>
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <button onClick={() => setModal('chat')} className="text-blue-600 text-xs font-black uppercase tracking-widest">Start chatting</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
