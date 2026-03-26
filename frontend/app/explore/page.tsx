'use client'

import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getSocialFeed } from '@/services/apiServices'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'

export default function SocialFeedPage() {
  const { user } = useAuthStore()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-feed', user?.id],
    queryFn: () => getSocialFeed(user?.id as string),
    enabled: !!user?.id
  })

  return (
    <div className="max-w-2xl mx-auto border-x dark:border-gray-800 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b dark:border-gray-800 z-10">
        <h1 className="text-xl font-bold dark:text-white">Explore</h1>
      </header>

      {/* Stories Placeholder */}
      <div className="flex gap-4 p-4 overflow-x-auto bg-white dark:bg-gray-900 border-b dark:border-gray-800 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative">
            <span className="text-gray-400">+</span>
          </div>
          <span className="text-xs text-gray-500">Add Story</span>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300">User {i}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="divide-y dark:divide-gray-800">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading feed...</div>
        ) : posts?.length > 0 ? (
          posts.map((post: any) => (
            <article key={post._id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-sm dark:text-white">User {post.userId.substring(0, 4)}</h3>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">{post.content}</p>

              {post.media?.length > 0 && (
                <div className="rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center">
                  <span className="text-gray-400">Media Content</span>
                </div>
              )}

              <div className="flex gap-6 mt-4">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart size={20} className={post.likes?.includes(user?.id) ? 'fill-red-500 text-red-500' : ''} />
                  <span className="text-sm">{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle size={20} />
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No posts in feed.</div>
        )}
      </div>
    </div>
  )
}
