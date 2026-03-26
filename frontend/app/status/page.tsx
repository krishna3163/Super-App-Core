'use client'

import { useState, useRef, useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { supabase } from '@/lib/supabase'
import {
  Plus, X, Heart, MessageCircle, Eye, Send,
  ChevronLeft, ChevronRight, Loader2, Image as ImageIcon
} from 'lucide-react'
import clsx from 'clsx'

interface Story {
  _id: string; userId: string; userName?: string; userAvatar?: string
  mediaUrl: string; mediaType: 'image' | 'video'; caption?: string
  viewers: string[]; likes: string[]; createdAt: string
}

interface StoryGroup { userId: string; userName: string; avatar: string; stories: Story[]; seen: boolean }

export default function StatusPage() {
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [groups, setGroups] = useState<StoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<{ group: StoryGroup; idx: number } | null>(null)
  const [progress, setProgress] = useState(0)
  const [replyText, setReplyText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [previewFile, setPreviewFile] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => { fetchStories() }, [])

  const fetchStories = async () => {
    try {
      const res = await api.post('/social/stories/feed', { followingIds: [] }).catch(() => ({ data: [] }))
      const raw: Story[] = Array.isArray(res.data) ? res.data : res.data?.data || []
      // Group by userId
      const map = new Map<string, StoryGroup>()
      raw.forEach(s => {
        if (!map.has(s.userId)) map.set(s.userId, { userId: s.userId, userName: s.userName || s.userId, avatar: s.userAvatar || '', stories: [], seen: s.viewers?.includes(user?.id || '') })
        map.get(s.userId)!.stories.push(s)
      })
      // Add own stories first
      const own: StoryGroup = { userId: user?.id || '', userName: 'My Story', avatar: user?.avatar || '', stories: raw.filter(s => s.userId === user?.id), seen: true }
      const others = Array.from(map.values()).filter(g => g.userId !== user?.id)
      setGroups([own, ...others])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Story viewer timer
  useEffect(() => {
    if (!viewing) { clearInterval(timerRef.current); setProgress(0); return }
    setProgress(0)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          nextStory()
          return 0
        }
        return p + 2 // 5 seconds per story (100/2 = 50 ticks * 100ms)
      })
    }, 100)
    // Mark as viewed
    const story = viewing.group.stories[viewing.idx]
    if (story?._id) api.post(`/social/stories/view`, { storyId: story._id, userId: user?.id }).catch(() => {})
    return () => clearInterval(timerRef.current)
  }, [viewing?.group.userId, viewing?.idx])

  const nextStory = () => {
    if (!viewing) return
    if (viewing.idx < viewing.group.stories.length - 1) {
      setViewing({ ...viewing, idx: viewing.idx + 1 })
    } else {
      // Next group
      const gi = groups.findIndex(g => g.userId === viewing.group.userId)
      if (gi < groups.length - 1 && groups[gi + 1].stories.length > 0) {
        setViewing({ group: groups[gi + 1], idx: 0 })
      } else {
        setViewing(null)
      }
    }
  }

  const prevStory = () => {
    if (!viewing) return
    if (viewing.idx > 0) setViewing({ ...viewing, idx: viewing.idx - 1 })
  }

  const handleLike = async () => {
    if (!viewing) return
    const story = viewing.group.stories[viewing.idx]
    await api.post('/social/posts/like', { postId: story._id, userId: user?.id }).catch(() => {})
  }

  const handleReply = async () => {
    if (!replyText.trim() || !viewing) return
    const story = viewing.group.stories[viewing.idx]
    await api.post('/chats', { userId: user?.id, targetUserId: story.userId }).catch(() => {})
    setReplyText('')
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video') ? 'video' : 'image'
    setPreviewFile({ url: URL.createObjectURL(file), type, file })
  }

  const uploadStory = async () => {
    if (!previewFile) return
    setUploading(true)
    try {
      let mediaUrl = previewFile.url
      try {
        const ext = previewFile.file.name.split('.').pop()
        const path = `stories/${user?.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('media').upload(path, previewFile.file, { upsert: true })
        if (!error) {
          const { data } = supabase.storage.from('media').getPublicUrl(path)
          mediaUrl = data.publicUrl
        }
      } catch {}
      await api.post('/social/stories', { userId: user?.id, userName: user?.name, userAvatar: user?.avatar, mediaUrl, mediaType: previewFile.type, caption })
      setPreviewFile(null); setCaption('')
      fetchStories()
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const currentStory = viewing ? viewing.group.stories[viewing.idx] : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="px-5 py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-20">
        <h1 className="text-xl font-black dark:text-white">Stories</h1>
      </div>

      {/* Story circles */}
      <div className="p-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {/* Add story */}
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 flex items-center justify-center">
              <Plus size={24} className="text-blue-500"/>
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Add</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFilePick}/>

          {/* Story groups */}
          {loading ? [1,2,3,4].map(i => <div key={i} className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0"/>)
          : groups.filter(g => g.stories.length > 0).map(g => (
            <button key={g.userId} onClick={() => setViewing({ group: g, idx: 0 })} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={clsx('w-16 h-16 rounded-2xl p-0.5', g.seen ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500')}>
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900">
                  {g.avatar ? <img src={g.avatar} className="w-full h-full object-cover" alt=""/> :
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl uppercase">{g.userName[0]}</div>}
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 max-w-[64px] truncate">{g.userId === user?.id ? 'My Story' : g.userName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload preview */}
      {previewFile && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            {previewFile.type === 'image' ? <img src={previewFile.url} className="w-full h-full object-cover" alt=""/> :
              <video src={previewFile.url} autoPlay loop className="w-full h-full object-cover"/>}
            <button onClick={() => setPreviewFile(null)} className="absolute top-6 left-6 p-2 bg-black/50 rounded-full text-white"><X size={20}/></button>
          </div>
          <div className="bg-black p-5 space-y-3">
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..."
              className="w-full bg-white/10 text-white rounded-2xl px-4 py-3 outline-none text-sm placeholder:text-white/50"/>
            <button onClick={uploadStory} disabled={uploading}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
              {uploading ? <Loader2 size={16} className="animate-spin"/> : null}
              {uploading ? 'Uploading...' : 'Share Story'}
            </button>
          </div>
        </div>
      )}

      {/* Story viewer */}
      {viewing && currentStory && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
            {viewing.group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className={clsx('h-full bg-white rounded-full transition-none', i < viewing.idx ? 'w-full' : i === viewing.idx ? '' : 'w-0')}
                  style={i === viewing.idx ? { width: `${progress}%`, transition: 'width 0.1s linear' } : {}}/>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-600">
                {viewing.group.avatar ? <img src={viewing.group.avatar} className="w-full h-full object-cover" alt=""/> :
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase">{viewing.group.userName[0]}</div>}
              </div>
              <div>
                <p className="text-white font-black text-sm">{viewing.group.userName}</p>
                <p className="text-white/60 text-[10px]">{new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button onClick={() => setViewing(null)} className="p-2 bg-black/30 rounded-full text-white"><X size={18}/></button>
          </div>

          {/* Media */}
          <div className="flex-1 relative" onClick={nextStory}>
            {currentStory.mediaType === 'video' ? <video src={currentStory.mediaUrl} autoPlay loop className="w-full h-full object-cover"/> :
              <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt=""/>}
            {currentStory.caption && (
              <div className="absolute bottom-24 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-3">
                <p className="text-white text-sm font-medium">{currentStory.caption}</p>
              </div>
            )}
            {/* Tap zones */}
            <div className="absolute inset-y-0 left-0 w-1/3" onClick={e => { e.stopPropagation(); prevStory() }}/>
            <div className="absolute inset-y-0 right-0 w-1/3" onClick={e => { e.stopPropagation(); nextStory() }}/>
          </div>

          {/* View count + actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 space-y-3">
            {viewing.group.userId === user?.id && (
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
                <Eye size={14}/> {currentStory.viewers?.length || 0} views
              </div>
            )}
            <div className="flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply to story..."
                className="flex-1 bg-white/10 text-white rounded-2xl px-4 py-3 outline-none text-sm placeholder:text-white/50 border border-white/20"/>
              <button onClick={handleLike} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all">
                <Heart size={18}/>
              </button>
              <button onClick={handleReply} disabled={!replyText.trim()} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 disabled:opacity-40 active:scale-90 transition-all">
                <Send size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
