'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/services/api'
import useAuthStore from '@/store/useAuthStore'
import ReactMarkdown from 'react-markdown'
import { MapPin, Link as LinkIcon, Users, UserPlus, QrCode, LayoutDashboard, Share2 } from 'lucide-react'
import DevStats from '@/components/profile/DevStats'
import ProjectShowcase from '@/components/profile/ProjectShowcase'
import Link from 'next/link'

export default function UserProfilePage() {
  const { username } = useParams()
  const { user, appMode } = useAuthStore()

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
    onSuccess: () => refetch()
  })

  if (isLoading) return <div className="p-8 text-center animate-pulse dark:text-white">Loading profile...</div>
  if (!profile) return <div className="p-8 text-center text-red-500">Profile not found</div>

  const isOwnProfile = user?.id === profile.userId

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
          {profile.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" /> : profile.username[0].toUpperCase()}
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
                        <UserPlus size={18} /> Follow
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
            <div className="flex items-center gap-1"><strong className="dark:text-white">{profile.followersCount}</strong> <span className="text-gray-500 text-xs">followers</span></div>
            <div className="flex items-center gap-1"><strong className="dark:text-white">{profile.followingCount}</strong> <span className="text-gray-500 text-xs">following</span></div>
            <div className="flex items-center gap-1"><strong className="dark:text-white">{profile.connectionsCount}</strong> <span className="text-gray-500 text-xs">connections</span></div>
          </div>
        </div>
      </div>

      {/* Phase N4: Dev Integration */}
      <DevStats handles={profile.codingHandles} />

      {/* GitHub-style Markdown Bio */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
          <h2 className="text-lg font-semibold dark:text-white">README.md</h2>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{profile.profileMarkdown}</ReactMarkdown>
        </article>
      </div>

      {/* Phase N5: Project Showcase */}
      <ProjectShowcase projects={profile.projects} />

      {/* Activity Feed */}
      <div className="space-y-4 pb-10">
        <h2 className="text-xl font-bold dark:text-white">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm dark:text-gray-300">
                  <span className="font-bold">@{profile.username}</span> shared a new post in 
                  <span className="text-blue-500 font-medium"> Tech Communities</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{i} day(s) ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
