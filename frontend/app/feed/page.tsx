'use client'

import React, { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { supabase } from '@/lib/supabase'
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  Image as ImageIcon, Send, Sparkles,
  BarChart3, Calendar, Clock, Bell, AlertCircle,
  X, Globe, Loader2, Video
} from 'lucide-react'
import clsx from 'clsx'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostType = 'text' | 'image' | 'video' | 'poll' | 'event' | 'alert' | 'notice' | 'reminder'

interface MediaItem { url: string; mediaType: 'image' | 'video' }

interface Post {
  _id: string
  userId: string
  userName: string
  userAvatar: string
  type: PostType
  content: string
  media: MediaItem[]
  hashtags: string[]
  likes: string[]
  interested?: string[]
  pollVotes?: Record<string, string[]>
  createdAt: string
  metadata?: any
}

interface Comment {
  _id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
const Avatar = ({ name, avatar, size = 'md' }: { name?: string; avatar?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-11 h-11 text-sm'
  if (avatar) return <img src={avatar} className={clsx(sz, 'rounded-2xl object-cover border dark:border-gray-700 shrink-0')} alt="" />
  return (
    <div className={clsx(sz, 'rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shrink-0 uppercase')}>
      {name?.[0] || 'U'}
    </div>
  )
}

// ─── Comment item ─────────────────────────────────────────────────────────────
const CommentItem = ({ c }: { c: Comment }) => (
  <div className="flex gap-3">
    <Avatar name={c.userName} avatar={c.userAvatar} size="sm" />
    <div className="flex-1">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
        <p className="font-bold text-xs dark:text-white mb-0.5">{c.userName || c.userId}</p>
        <p className="text-xs dark:text-gray-300 leading-relaxed">{c.content}</p>
      </div>
      <p className="text-[9px] text-gray-400 font-bold mt-1 ml-2">{new Date(c.createdAt).toLocaleTimeString()}</p>
    </div>
  </div>
)

// ─── Post content renderer ────────────────────────────────────────────────────
const PostContent = ({ post, userId, onVote, onInterest }: { 
  post: Post; 
  userId: string; 
  onVote: (postId: string, idx: number) => void;
  onInterest: (postId: string) => void;
}) => {
  if (post.type === 'poll' && post.metadata?.options) {
    const totalVotes = Object.values(post.pollVotes || {}).reduce((s, arr) => s + arr.length, 0)
    const userVoted = Object.entries(post.pollVotes || {}).findIndex(([, arr]) => arr.includes(userId))
    return (
      <div className="space-y-3 bg-purple-50 dark:bg-purple-900/20 p-5 rounded-[2rem] border-2 border-purple-100 dark:border-purple-800">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <BarChart3 size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Poll</span>
        </div>
        <h3 className="font-black text-base dark:text-white">{post.content}</h3>
        <div className="space-y-2">
          {post.metadata.options.map((opt: string, i: number) => {
            const votes = (post.pollVotes?.[String(i)] || []).length
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
            const isChosen = userVoted === i
            return (
              <button key={i} onClick={() => onVote(post._id, i)}
                className={clsx('w-full text-left p-3 rounded-xl border-2 font-bold text-sm relative overflow-hidden transition-all',
                  isChosen ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                           : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 dark:text-gray-200')}>
                <div className="absolute inset-0 bg-purple-200/40 dark:bg-purple-700/20 transition-all" style={{ width: `${pct}%` }} />
                <span className="relative flex justify-between">
                  <span>{opt}</span>
                  {totalVotes > 0 && <span className="text-[10px] font-black text-purple-500">{pct}%</span>}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 font-bold">{totalVotes} votes</p>
      </div>
    )
  }

  if (post.type === 'event' && post.metadata) {
    return (
      <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2rem] border-2 border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-600"><Calendar size={16}/><span className="text-[10px] font-black uppercase tracking-widest">{post.metadata.type || 'Event'}</span></div>
        <h3 className="text-lg font-black dark:text-white">{post.content}</h3>
        <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><Clock size={12}/>{post.metadata.date} {post.metadata.startTime && `• ${post.metadata.startTime}`}</p>
        {post.metadata.location && <p className="text-xs text-gray-400 font-bold flex items-center gap-2"><Globe size={12}/>{post.metadata.location}</p>}
        <button 
          onClick={() => onInterest(post._id)}
          className={clsx(
            "w-full font-black py-3 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md",
            post.interested?.includes(userId)
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white"
          )}
        >
          {post.interested?.includes(userId) ? '✓ Interested' : 'Interested'}
        </button>
      </div>
    )
  }

  if (['alert', 'notice', 'reminder'].includes(post.type)) {
    const cfg = {
      alert:    { cls: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:border-red-900/30',    Icon: AlertCircle },
      notice:   { cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30', Icon: Bell },
      reminder: { cls: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30', Icon: Clock },
    }[post.type as 'alert' | 'notice' | 'reminder']
    return (
      <div className={clsx('p-5 rounded-[2rem] border-2 flex gap-4 items-start', cfg.cls)}>
        <div className="p-2.5 rounded-xl bg-white/50 dark:bg-white/10 shrink-0"><cfg.Icon size={22}/></div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">{post.type}</p>
          <p className="text-sm font-bold leading-relaxed">{post.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[15px] dark:text-gray-200 leading-relaxed font-medium">
        {post.content.split(' ').map((w, i) =>
          w.startsWith('#') ? <span key={i} className="text-blue-500 font-bold">{w} </span> : w + ' '
        )}
      </p>
      {post.media?.map((m, i) => (
        <div key={i} className="rounded-[1.5rem] overflow-hidden border dark:border-gray-800">
          {m.mediaType === 'video'
            ? <video src={m.url} controls className="w-full max-h-[500px]" />
            : <img src={m.url} className="w-full max-h-[500px] object-cover" alt="" />}
        </div>
      ))}
    </div>
  )
}

// ─── Main Feed Page ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [posting, setPosting]       = useState(false)
  const [uploading, setUploading]   = useState(false)

  const [postType, setPostType]     = useState<PostType>('text')
  const [inputText, setInputText]   = useState('')
  const [mediaFile, setMediaFile]   = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null)

  // Poll state
  const [showPollModal, setShowPollModal]   = useState(false)
  const [pollQuestion, setPollQuestion]     = useState('')
  const [pollOptions, setPollOptions]       = useState(['', ''])

  // Event state
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventData, setEventData] = useState({ title: '', type: 'Event', date: '', startTime: '', location: '' })

  // Comments
  const [showComments, setShowComments]     = useState<string | null>(null)
  const [comments, setComments]             = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText]       = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => { fetchFeed() }, [])

  // ── Fetch all posts ──────────────────────────────────────────────────────────
  const fetchFeed = async () => {
    try {
      setLoading(true)
      // Pass empty followingIds → backend returns ALL posts (public feed)
      const res = await api.post('/social/feed', { followingIds: [], limit: 50 })
      if (res.data.status === 'success') setPosts(res.data.data)
    } catch (e) {
      console.error('Feed fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Upload media to Supabase storage ─────────────────────────────────────────
  const uploadMedia = async (file: File): Promise<string> => {
    // Try Supabase storage first
    try {
      const ext  = file.name.split('.').pop()
      const path = `posts/${user?.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        return data.publicUrl
      }
      console.warn('Supabase upload failed, using object URL:', error.message)
    } catch (e) {
      console.warn('Supabase not available:', e)
    }
    // Fallback: return object URL (works for same session, not persistent)
    return URL.createObjectURL(file)
  }

  // ── Handle file pick ─────────────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video') ? 'video' : 'image'
    setMediaFile(file)
    setMediaPreview({ url: URL.createObjectURL(file), type })
    setPostType(type)
  }

  // ── Submit post ──────────────────────────────────────────────────────────────
  const handlePost = async (overrideContent?: string, overrideMeta?: any, overrideType?: PostType) => {
    const content = overrideContent ?? inputText
    if (!content.trim() && !mediaFile) return
    setPosting(true)
    try {
      let mediaArr: MediaItem[] = []

      if (mediaFile) {
        setUploading(true)
        const url = await uploadMedia(mediaFile)
        setUploading(false)
        mediaArr = [{ url, mediaType: mediaFile.type.startsWith('video') ? 'video' : 'image' }]
      }

      const res = await api.post('/social/posts', {
        userId:     user?.id,
        userName:   user?.name || 'User',
        userAvatar: user?.avatar || '',
        content,
        type:       overrideType ?? postType,
        media:      mediaArr,
        metadata:   overrideMeta ?? null,
        hashtags:   content.match(/#\w+/g) || [],
      })

      if (res.data.status === 'success') {
        setPosts(prev => [res.data.data, ...prev])
        setInputText(''); setMediaFile(null); setMediaPreview(null); setPostType('text')
        setShowPollModal(false); setShowEventModal(false)
        setPollQuestion(''); setPollOptions(['', ''])
        setEventData({ title: '', type: 'Event', date: '', startTime: '', location: '' })
      }
    } catch (e) {
      console.error('Post error:', e)
    } finally {
      setPosting(false); setUploading(false)
    }
  }

  const handlePollPost = () => {
    if (!pollQuestion.trim()) return
    const opts = pollOptions.filter(o => o.trim())
    if (opts.length < 2) return
    handlePost(pollQuestion, { options: opts }, 'poll')
  }

  const handleEventPost = () => {
    if (!eventData.title.trim()) return
    handlePost(eventData.title, eventData, 'event')
  }

  // ── Like ─────────────────────────────────────────────────────────────────────
  const handleLike = async (postId: string) => {
    try {
      const res = await api.post('/social/posts/like', { postId, userId: user?.id })
      if (res.data.status === 'success')
        setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p))
    } catch (e) { console.error(e) }
  }
  
  // ── Interest ──
  const handleInterest = async (postId: string) => {
    try {
      const res = await api.post('/social/posts/interest', { postId, userId: user?.id })
      if (res.data.status === 'success')
        setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p))
    } catch (e) {
      console.error('Interest error:', e)
    }
  }

  // ── Poll vote ────────────────────────────────────────────────────────────────
  const handleVote = async (postId: string, optionIndex: number) => {
    try {
      const res = await api.post('/social/posts/vote', { postId, userId: user?.id, optionIndex })
      if (res.data.status === 'success')
        setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p))
    } catch (e) { console.error(e) }
  }

  // ── Comments ─────────────────────────────────────────────────────────────────
  const toggleComments = async (postId: string) => {
    if (showComments === postId) { setShowComments(null); return }
    setShowComments(postId)
    if (!comments[postId]) {
      try {
        const res = await api.get(`/social/posts/${postId}/comments`)
        if (res.data.status === 'success')
          setComments(prev => ({ ...prev, [postId]: res.data.data }))
      } catch (e) { console.error(e) }
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      const res = await api.post('/social/posts/comment', {
        postId, userId: user?.id,
        userName: user?.name || 'User',
        userAvatar: user?.avatar || '',
        content: commentText,
      })
      if (res.data.status === 'success') {
        setComments(prev => ({ ...prev, [postId]: [res.data.data, ...(prev[postId] || [])] }))
        setCommentText('')
      }
    } catch (e) { console.error(e) }
    finally { setCommentLoading(false) }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-24 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* ── Post Creator ── */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-5 border-b dark:border-gray-800 sticky top-0 z-30 shadow-sm rounded-b-[2.5rem]">
        <div className="flex gap-3">
          <Avatar name={user?.name} avatar={user?.avatar} />
          <div className="flex-1 min-w-0">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent border-none outline-none resize-none dark:text-white py-1 text-base placeholder:text-gray-400"
              rows={2}
            />

            {/* Media preview */}
            {mediaPreview && (
              <div className="relative mb-3 rounded-2xl overflow-hidden border dark:border-gray-700">
                {mediaPreview.type === 'video'
                  ? <video src={mediaPreview.url} className="w-full max-h-48 object-cover" />
                  : <img src={mediaPreview.url} className="w-full max-h-48 object-cover" alt="" />}
                <button onClick={() => { setMediaFile(null); setMediaPreview(null); setPostType('text') }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={14}/></button>
              </div>
            )}

            {/* Type pills */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-3 pb-1">
              {(['text', 'poll', 'event', 'alert', 'notice', 'reminder'] as PostType[]).map(t => (
                <button key={t} onClick={() => {
                  setPostType(t)
                  if (t === 'poll') setShowPollModal(true)
                  else if (t === 'event') setShowEventModal(true)
                  else { setShowPollModal(false); setShowEventModal(false) }
                }}
                  className={clsx('px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap',
                    postType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:border-gray-700')}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t dark:border-gray-800">
              <div className="flex gap-1">
                {/* Image/Video upload */}
                <button onClick={() => fileRef.current?.click()}
                  className="p-2 text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 relative">
                  <ImageIcon size={20} />
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFilePick} />
                <button onClick={() => fileRef.current?.click()} className="p-2 text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Video size={20} />
                </button>
              </div>
              <button onClick={() => handlePost()} disabled={posting || uploading}
                className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                {(posting || uploading) && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Uploading...' : posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="space-y-5 mt-5 px-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-56 bg-white dark:bg-gray-900 rounded-[2rem] animate-pulse" />)
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No posts yet. Be the first!</p>
          </div>
        ) : posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Post header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={post.userName} avatar={post.userAvatar} />
                <div>
                  <p className="font-black text-sm dark:text-white">{post.userName || post.userId}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {post.type}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><MoreHorizontal size={18}/></button>
            </div>

            {/* Post body */}
            <div className="px-5 pb-4">
              <PostContent post={post} userId={user?.id || ''} onVote={handleVote} onInterest={handleInterest} />
            </div>

            {/* Actions */}
            <div className="px-5 py-3 flex items-center justify-between border-t dark:border-gray-800/50">
              <div className="flex items-center gap-5">
                <button onClick={() => handleLike(post._id)}
                  className={clsx('flex items-center gap-1.5 font-black text-xs uppercase tracking-widest transition-all active:scale-90',
                    post.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400 hover:text-red-400')}>
                  <Heart size={20} fill={post.likes.includes(user?.id || '') ? 'currentColor' : 'none'} />
                  {post.likes.length}
                </button>
                <button onClick={() => toggleComments(post._id)}
                  className="flex items-center gap-1.5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-500 transition-colors">
                  <MessageCircle size={20} />
                  {comments[post._id]?.length || 0}
                </button>
              </div>
              <button className="text-gray-400 hover:text-blue-500 transition-colors"><Share2 size={18}/></button>
            </div>

            {/* Comments section */}
            {showComments === post._id && (
              <div className="px-5 pb-5 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
                <div className="space-y-4 my-4">
                  {(comments[post._id] || []).map(c => <CommentItem key={c._id} c={c} />)}
                  {(comments[post._id] || []).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                  <div className="flex-1 relative">
                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment(post._id)}
                      placeholder="Write a comment..."
                      className="w-full bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500 transition-colors dark:text-white pr-10" />
                    <button onClick={() => handleAddComment(post._id)} disabled={commentLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 disabled:opacity-40">
                      {commentLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16}/>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Poll Modal ── */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl p-7 border-2 border-purple-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-xl dark:text-white">Create Poll</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ask your followers</p>
              </div>
              <button onClick={() => { setShowPollModal(false); setPostType('text') }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                placeholder="What do you want to ask?"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 rounded-xl p-3.5 font-bold dark:text-white outline-none transition-all" />
              <p className="text-[10px] font-black text-gray-400 uppercase ml-1">Options</p>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt} onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n) }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none focus:ring-2 ring-purple-500/20" />
                  {pollOptions.length > 2 && (
                    <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><X size={16}/></button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button onClick={() => setPollOptions([...pollOptions, ''])}
                  className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-colors">
                  + Add Option
                </button>
              )}
            </div>
            <button onClick={handlePollPost} disabled={posting}
              className="mt-6 w-full bg-purple-600 text-white font-black py-3.5 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {posting && <Loader2 size={14} className="animate-spin" />}
              Publish Poll
            </button>
          </div>
        </div>
      )}

      {/* ── Event Modal ── */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl p-7 border-2 border-blue-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-xl dark:text-white">Schedule Event</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public event posting</p>
              </div>
              <button onClick={() => { setShowEventModal(false); setPostType('text') }}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <input value={eventData.title} onChange={e => setEventData({ ...eventData, title: e.target.value })}
                placeholder="Event Title"
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 font-bold dark:text-white outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input value={eventData.date} onChange={e => setEventData({ ...eventData, date: e.target.value })}
                  placeholder="Date (e.g. 24 March)"
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none border dark:border-gray-700" />
                <input value={eventData.startTime} onChange={e => setEventData({ ...eventData, startTime: e.target.value })}
                  placeholder="Time (e.g. 6:00 PM)"
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none border dark:border-gray-700" />
              </div>
              <input value={eventData.location} onChange={e => setEventData({ ...eventData, location: e.target.value })}
                placeholder="Location (optional)"
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none border dark:border-gray-700" />
            </div>
            <button onClick={handleEventPost} disabled={posting}
              className="mt-6 w-full bg-blue-600 text-white font-black py-3.5 rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {posting && <Loader2 size={14} className="animate-spin" />}
              Create Event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
