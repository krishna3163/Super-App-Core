'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/services/api'
import useAuthStore from '@/store/useAuthStore'
import ReactMarkdown from 'react-markdown'
import { MapPin, Link as LinkIcon, UserPlus, LayoutDashboard, Share2, Settings, UserMinus } from 'lucide-react'
import DevStats from '@/components/profile/DevStats'
import ProjectShowcase from '@/components/profile/ProjectShowcase'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export default function UserProfilePage() {
  const { username } = useParams()
  const { user, appMode } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following' | 'suggested' | 'settings'>('posts')

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await api.get(`/super-comm/profile/${username}`)
      return data
    }
  })

  const followMutation = useMutation({
    mutationFn: () => api.post('/super-comm/profile/follow', {
      followerId: user?.id,
      followingId: profile?.userId
    }),
    onSuccess: () => {
      refetch()
      refetchViewerFollowing()
    }
  })

  const followSuggestionMutation = useMutation({
    mutationFn: (followingId: string) => api.post('/super-comm/profile/follow', {
      followerId: user?.id,
      followingId
    }),
    onSuccess: () => {
      refetch()
      refetchViewerFollowing()
    }
  })

  const { data: followers = [] } = useQuery({
    queryKey: ['profile-followers', profile?.userId],
    queryFn: async () => {
      if (!profile?.userId) return []
      const { data } = await api.get(`/super-comm/profile/${profile.userId}/followers`).catch(() => ({ data: [] }))
      return Array.isArray(data) ? data : []
    },
    enabled: !!profile?.userId
  })

  const { data: following = [] } = useQuery({
    queryKey: ['profile-following', profile?.userId],
    queryFn: async () => {
      if (!profile?.userId) return []
      const { data } = await api.get(`/super-comm/profile/${profile.userId}/following`).catch(() => ({ data: [] }))
      return Array.isArray(data) ? data : []
    },
    enabled: !!profile?.userId
  })

  const { data: viewerFollowing = [], refetch: refetchViewerFollowing } = useQuery({
    queryKey: ['viewer-following', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await api.get(`/super-comm/profile/${user.id}/following`).catch(() => ({ data: [] }))
      return Array.isArray(data) ? data : []
    },
    enabled: !!user?.id
  })

  const { data: suggestions = [] } = useQuery({
    queryKey: ['profile-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await api.get(`/super-comm/profile/${user.id}/suggestions?limit=8`).catch(() => ({ data: [] }))
      return Array.isArray(data) ? data : []
    },
    enabled: !!user?.id
  })

  const isFollowingProfile = useMemo(
    () => viewerFollowing.some((item: any) => item.userId === profile?.userId),
    [viewerFollowing, profile?.userId]
  )

  if (isLoading) return <div className="p-8 text-center animate-pulse dark:text-white">Loading profile...</div>
  if (!profile) return <div className="p-8 text-center text-red-500">Profile not found</div>

  const isOwnProfile = user?.id === profile.userId

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
          {profile.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : profile.username[0].toUpperCase()}
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">{profile.username}</h1>
              <p className="text-gray-500 dark:text-gray-400">@{profile.uniqueId}</p>
            </div>
            
            <div className="flex gap-2">
                {isOwnProfile && appMode === 'business' && (
                    <Link 
                        href="/business-dashboard"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <LayoutDashboard size={18} />
                        Business Dashboard
                    </Link>
                )}
                
                {isOwnProfile ? (
                    <button className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        Edit Profile
                    </button>
                ) : (
                    <button 
                        onClick={() => followMutation.mutate()}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90"
                    >
                    {isFollowingProfile ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    {isFollowingProfile ? 'Unfollow' : 'Follow'}
                    </button>
                )}
                
                <button className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-400">
                    <Share2 size={20} />
                </button>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300">{profile.bio || 'No bio provided.'}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {profile.location && (
              <div className="flex items-center gap-1"><MapPin size={16} /> {profile.location}</div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1"><LinkIcon size={16} /> <a href={profile.website} target="_blank" className="text-blue-500 hover:underline">{profile.website}</a></div>
            )}
          </div>

          <div className="flex gap-6 pt-2">
            <button onClick={() => setActiveTab('followers')} className="flex items-center gap-1">
              <strong className="dark:text-white">{followers.length || profile.followersCount || 0}</strong>
              <span className="text-gray-500 text-xs">followers</span>
            </button>
            <button onClick={() => setActiveTab('following')} className="flex items-center gap-1">
              <strong className="dark:text-white">{following.length || profile.followingCount || 0}</strong>
              <span className="text-gray-500 text-xs">following</span>
            </button>
            <div className="flex items-center gap-1"><strong className="dark:text-white">{profile.connectionsCount}</strong> <span className="text-gray-500 text-xs">connections</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-white dark:bg-gray-800 rounded-2xl p-2 border dark:border-gray-700">
        {[
          { key: 'posts', label: 'Posts' },
          { key: 'followers', label: 'Followers' },
          { key: 'following', label: 'Following' },
          { key: 'suggested', label: 'Suggested' },
          { key: 'settings', label: 'Settings' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Phase N4: Dev Integration */}
      <DevStats handles={profile.codingHandles} />

      {activeTab === 'posts' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold dark:text-white">README.md</h2>
            </div>
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{profile.profileMarkdown}</ReactMarkdown>
            </article>
          </div>
          <ProjectShowcase projects={profile.projects} />
        </>
      )}

      {activeTab === 'followers' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold dark:text-white">Followers</h2>
          {followers.map((item: any) => (
            <Link key={item.userId} href={`/u/${item.username || item.userId}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <img src={item.avatar || 'https://i.pravatar.cc/100?u=anon'} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div className="min-w-0">
                <p className="font-semibold dark:text-white truncate">{item.username || item.userId}</p>
                <p className="text-xs text-gray-500 truncate">{item.uniqueId || item.userId}</p>
              </div>
            </Link>
          ))}
          {followers.length === 0 && <p className="text-sm text-gray-500">No followers yet.</p>}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold dark:text-white">Following</h2>
          {following.map((item: any) => (
            <Link key={item.userId} href={`/u/${item.username || item.userId}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <img src={item.avatar || 'https://i.pravatar.cc/100?u=anon'} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div className="min-w-0">
                <p className="font-semibold dark:text-white truncate">{item.username || item.userId}</p>
                <p className="text-xs text-gray-500 truncate">{item.uniqueId || item.userId}</p>
              </div>
            </Link>
          ))}
          {following.length === 0 && <p className="text-sm text-gray-500">Not following anyone yet.</p>}
        </div>
      )}

      {activeTab === 'suggested' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold dark:text-white">People You May Know</h2>
          {suggestions.map((item: any) => (
            <div key={item.userId} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <img src={item.avatar || 'https://i.pravatar.cc/100?u=anon'} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold dark:text-white truncate">{item.username || item.userId}</p>
                <p className="text-xs text-gray-500 truncate">{item.mutualCount || 0} mutual • {item.followersCount || 0} followers</p>
              </div>
              <button
                onClick={() => followSuggestionMutation.mutate(item.userId)}
                className="bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-xs font-bold"
              >
                Follow
              </button>
            </div>
          ))}
          {suggestions.length === 0 && <p className="text-sm text-gray-500">No suggestions right now.</p>}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={18} className="text-gray-500" />
            <h2 className="text-xl font-bold dark:text-white">Profile Settings</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Account and app settings are now accessible from your profile, similar to Instagram.</p>
          <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold">
            Open Full Settings
          </Link>
        </div>
      )}
    </div>
  )
}
