'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import { Bell, CheckCircle2, MessageSquare, Heart, ShoppingBag, Car, Info } from 'lucide-react'

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/${user?.id}`)
      return data
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Poll every 15s to sync unread badge/list
    staleTime: 5000
  })

  const markReadMutation = useMutation({
    mutationFn: (notifId: string) => api.patch(`/notifications/${notifId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all', { userId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="text-blue-500" />
      case 'like': return <Heart className="text-red-500 fill-red-500" />
      case 'order': return <ShoppingBag className="text-green-500" />
      case 'ride': return <Car className="text-orange-500" />
      default: return <Info className="text-gray-500" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 border-x dark:border-gray-800">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Bell size={24} /> Notifications
        </h1>
        <button 
          onClick={() => markAllReadMutation.mutate()}
          className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <CheckCircle2 size={16} /> Mark all read
        </button>
      </header>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-800 animate-pulse rounded-xl border dark:border-gray-700"></div>)
        ) : notifications?.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif._id} 
              onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
              className={`p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm cursor-pointer transition-all flex gap-4 items-start ${!notif.isRead ? 'border-l-4 border-l-blue-500 ring-1 ring-blue-500/10' : 'opacity-70'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className={`font-bold text-sm dark:text-white truncate ${!notif.isRead ? '' : 'font-semibold'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
