'use client'

import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getSocialFeed } from '@/services/apiServices'
import { Heart, MessageCircle, Share2, MoreHorizontal, Search } from 'lucide-react'

export default function SocialFeedPage() {
  const { user } = useAuthStore()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-feed', user?.id],
    queryFn: () => getSocialFeed(user?.id as string),
    enabled: !!user?.id
  })

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-120px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-40 right-[-120px] h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-card)]/50 backdrop-blur-xl p-5 border-b border-gray-200/20 dark:border-gray-800/40 z-10 shadow-lg shadow-blue-500/10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text tracking-tight">🔍 Explore</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--syn-comment)]" size={17} />
          <input type="text"
            placeholder="Search posts, people, tags..."
            className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-[var(--text-primary)] placeholder:text-[var(--syn-comment)] text-sm transition-all hover:border-gray-200/40 dark:hover:border-gray-700/50" />
        </div>
      </header>

      {/* Stories Bar */}
      <div className="flex gap-3 overflow-x-auto p-5 bg-[var(--bg-card)]/85 border-b border-gray-200/20 dark:border-gray-800/40 backdrop-blur-xl scrollbar-hide no-scrollbar">
        <button className="flex flex-col items-center gap-1.5 shrink-0 group">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-400/40 dark:border-gray-700/50 flex items-center justify-center p-1 cursor-pointer hover:border-blue-500 transition-all">
            <div className="w-full h-full rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--syn-comment)] group-hover:text-blue-400 group-hover:scale-110 transition-all">
              <span className="text-2xl">+</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-tighter">Your Story</span>
        </button>
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[var(--bg-primary)] rounded-2xl border-2 border-[var(--bg-primary)] overflow-hidden shadow-lg shadow-purple-500/30">
                <div className="w-full h-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] flex items-center justify-center">
                  <span className="text-xs font-black text-[var(--syn-comment)]">U{i}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[var(--syn-comment)] truncate w-16 uppercase tracking-tighter\">User {i}</span>
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4 p-4 pb-20">
        {isLoading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-gray-200/20 dark:border-gray-800/40 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)]" />
                  <div className="space-y-2 flex-1">
                    <div className="w-24 h-3 bg-[var(--bg-elevated)] rounded" />
                    <div className="w-16 h-2 bg-[var(--bg-elevated)] rounded" />
                  </div>
                </div>
                <div className="w-full h-4 bg-[var(--bg-elevated)] rounded mb-2" />
                <div className="w-3/4 h-4 bg-[var(--bg-elevated)] rounded mb-4" />
                <div className="w-full h-48 bg-[var(--bg-elevated)] rounded-[1.5rem]" />
              </div>
            ))}
          </div>
        ) : (posts?.length || 0) > 0 ? (
          posts.map((post: any) => {
            const liked = post.likes?.includes(user?.id)
            return (
            <article key={post._id} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-gray-200/20 dark:border-gray-800/40 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                    {(post.userId || 'U')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">User {post.userId?.substring(0, 4) || 'Anon'}</h3>
                    <p className="text-[10px] text-[var(--syn-comment)]">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-[var(--syn-comment)] hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 p-2 rounded-lg">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <p className="text-[var(--text-primary)] mb-4 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

              {post.media?.length > 0 && (
                <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] h-64 flex items-center justify-center border border-gray-200/10 dark:border-gray-700/30">
                  <span className="text-[var(--syn-comment)] text-sm font-bold">🖼️ Media Content</span>
                </div>
              )}

              <div className="flex gap-4 mt-4 text-[var(--syn-comment)] group-hover:text-gray-300 transition-colors">
                <button className="flex items-center gap-2 hover:text-red-400 transition-colors active:scale-95">
                  <Heart size={18} className={liked ? 'fill-red-400 text-red-400' : ''} />
                  <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors active:scale-95">
                  <MessageCircle size={18} />
                  <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors active:scale-95">
                  <Share2 size={18} />
                </button>
              </div>
            </article>
            )
          })
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="w-20 h-20 bg-[var(--bg-elevated)] rounded-3xl flex items-center justify-center mx-auto text-[var(--syn-comment)] shadow-lg">
              <Search size={48} />
            </div>
            <p className="text-[var(--syn-comment)] font-bold text-sm uppercase tracking-wide\">No posts in feed yet</p>
            <p className="text-[var(--syn-comment)] text-xs opacity-70\">Be the first to post something amazing! 🚀</p>
          </div>
        )}
      </div>
    </div>
  )
}
