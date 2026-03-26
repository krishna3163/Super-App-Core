'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getSettings, updateSettings } from '@/services/apiServices'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react'
import { updateEmail, updatePassword } from '@/services/authApi'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [securityStatus, setSecurityStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({ username: '', bio: '', avatar: '' })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => getSettings(user?.id as string),
    enabled: !!user?.id
  })

  // Sync state when settings load
  if (settings?.profile && !profileData.username && !profileData.bio && !profileData.avatar) {
      setProfileData({
          username: settings.profile.username || '',
          bio: settings.profile.bio || '',
          avatar: settings.profile.avatar || ''
      })
  }

  const mutation = useMutation({
    mutationFn: ({ section, data }: { section: string, data: any }) => updateSettings(user?.id as string, section, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
      alert('Settings updated successfully')
    }
  })

  const handleSaveProfile = () => {
      mutation.mutate({ section: 'profile', data: profileData })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
              alert('⚠️ Storage Bucket not configured. Please create an "avatars" bucket in your Supabase dashboard.');
              // Fallback to local URL for demo purposes
              setProfileData({ ...profileData, avatar: URL.createObjectURL(file) });
              return;
          }
          throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfileData({ ...profileData, avatar: publicUrl })

    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggle = (section: string, key: string, value: boolean, nestedKey?: string) => {
    const currentSectionData = settings[section] || {}
    let newData = { ...currentSectionData }

    if (nestedKey) {
      newData[key] = { ...newData[key], [nestedKey]: value }
    } else {
      newData[key] = value
    }

    mutation.mutate({ section, data: newData })
  }

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>

  const tabs = ['profile', 'privacy', 'notifications', 'chat', 'rideDelivery', 'security']

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-3 text-left rounded-lg capitalize whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-white border-b pb-4 dark:border-gray-700">Profile Settings</h2>
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 py-4">
               <div className="relative group">
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                   {settings?.profile?.avatar ? (
                     <img src={settings.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                       {user?.email?.[0].toUpperCase()}
                     </div>
                   )}
                 </div>
                 <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                   {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                   <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                 </label>
               </div>
               <p className="text-xs text-gray-500">Tap to change profile picture</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input 
                  type="text" 
                  value={profileData.username} 
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-3 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea 
                  value={profileData.bio} 
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-3 dark:text-white"
                  rows={4}
                />
              </div>
              <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
              >
                  Save Profile Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-white border-b pb-4 dark:border-gray-700">Privacy</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white">Read Receipts</p>
                  <p className="text-sm text-gray-500">Let others know you've read their messages</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings?.privacy?.readReceipts ?? true}
                  onChange={(e) => handleToggle('privacy', 'readReceipts', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-white border-b pb-4 dark:border-gray-700">Notifications</h2>
            <div className="space-y-4">
              {['messages', 'likes', 'comments', 'orders', 'rides'].map(cat => (
                <label key={cat} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer">
                  <span className="font-medium capitalize dark:text-white">{cat}</span>
                  <input 
                    type="checkbox" 
                    checked={settings?.notifications?.categories?.[cat] ?? true}
                    onChange={(e) => handleToggle('notifications', 'categories', e.target.checked, cat)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rideDelivery' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-white border-b pb-4 dark:border-gray-700">Ride & Delivery Mode</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Mode</label>
                <select 
                  value={settings?.rideDelivery?.mode || 'user'}
                  onChange={(e) => mutation.mutate({ section: 'rideDelivery', data: { ...settings?.rideDelivery, mode: e.target.value } })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-3 dark:text-white outline-none"
                >
                  <option value="user">User (Book Rides/Food)</option>
                  <option value="driver">Driver (Accept Rides/Delivery)</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-white border-b pb-4 dark:border-gray-700">Security</h2>
            
            {securityStatus.message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                securityStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {securityStatus.type === 'success' && <CheckCircle2 size={16} />}
                {securityStatus.message}
              </div>
            )}

            <div className="space-y-6">
              {/* Email Change */}
              <form onSubmit={handleUpdateEmail} className="space-y-3 p-4 border dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-sm font-semibold dark:text-white">
                  <Mail size={16} className="text-blue-500" />
                  Change Email Address
                </div>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="New email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 dark:text-white text-sm outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={loading || !newEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-gray-500">You will need to verify the new email address.</p>
              </form>

              {/* Password Change */}
              <form onSubmit={handleUpdatePassword} className="space-y-3 p-4 border dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-sm font-semibold dark:text-white">
                  <Lock size={16} className="text-blue-500" />
                  Update Password
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input 
                    type="password" 
                    placeholder="New password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 dark:text-white text-sm outline-none"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 dark:text-white text-sm outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !newPass}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Change Password
                </button>
              </form>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Secure your account with an extra layer of protection</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings?.security?.twoFactorAuth ?? false}
                  onChange={(e) => handleToggle('security', 'twoFactorAuth', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Active Sessions</h3>
                <div className="space-y-2">
                  {settings?.security?.activeSessions?.map((session: any) => (
                    <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{session.deviceType || 'Web Browser'}</p>
                        <p className="text-xs text-gray-500">Last login: {new Date(session.lastLogin).toLocaleDateString()}</p>
                      </div>
                      <button className="text-red-500 text-xs font-bold hover:underline">Revoke</button>
                    </div>
                  )) || <p className="text-sm text-gray-500 italic text-center p-4 text-xs">No other active sessions</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
