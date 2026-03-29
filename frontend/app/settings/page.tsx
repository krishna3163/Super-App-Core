'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getSettings, updateSettings, updateDatingProfile } from '@/services/apiServices'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, Mail, Lock, CheckCircle2, AlertCircle, Shield, Bell, Eye, Car, Briefcase, ChevronRight, User, Palette, Settings, Check, Package, Utensils, Hotel } from 'lucide-react'
import { updateEmail, updatePassword } from '@/services/authApi'
import api from '@/services/api'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, appMode, setAppMode, businessEnabled, setBusinessEnabled, businessType, setBusinessType } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [securityStatus, setSecurityStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', bio: '', avatar: '', username: '' })

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => getSettings(user?.id as string),
    enabled: !!user?.id
  })

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/users/profile/${user?.id}`)
      return data.data
    },
    enabled: !!user?.id
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      })
    }
  }, [profile])

  useEffect(() => {
    const enabled = settings?.business?.enabled
    if (typeof enabled === 'boolean') {
      setBusinessEnabled(enabled)
      if (!enabled && appMode === 'business') {
        setAppMode('user')
      }
    }
  }, [settings, setBusinessEnabled, appMode, setAppMode])

  const mutation = useMutation({
    mutationFn: ({ section, data }: { section: string, data: any }) => updateSettings(user?.id as string, section, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await api.post('/users/profile', { userId: user?.id, ...data })
        return response.data
      } catch (error: any) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to save profile')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      setSecurityStatus({ type: 'success', message: 'Profile saved successfully! ✨' })
      setTimeout(() => setSecurityStatus({ type: '', message: '' }), 3000)
    },
    onError: (error: any) => {
      setSecurityStatus({ type: 'error', message: error.message || 'Failed to save profile' })
    }
  })

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData)
    } catch (error) {
      console.error('Profile save error:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    try {
      setIsUploading(true)
      // Mock upload for local dev if supabase fails
      const mockUrl = URL.createObjectURL(file)
      setProfileData({ ...profileData, avatar: mockUrl })
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        setProfileData({ ...profileData, avatar: publicUrl })
      }
    } catch (error: any) {
      console.warn('Avatar upload failed, used local preview')
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggle = (section: string, key: string, value: boolean, nestedKey?: string) => {
    const currentSectionData = settings?.[section] || {}
    let newData = { ...currentSectionData }
    if (nestedKey) {
      newData[key] = { ...newData[key], [nestedKey]: value }
    } else {
      newData[key] = value
    }
    mutation.mutate({ section, data: newData })
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) return
    setLoading(true)
    try {
      await updateEmail(newEmail)
      setSecurityStatus({ type: 'success', message: 'Email update sent. Check your inbox.' })
      setNewEmail('')
    } catch (err: any) {
      setSecurityStatus({ type: 'error', message: err.message || 'Failed to update email' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPass || newPass !== confirmPass) {
      setSecurityStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await updatePassword(newPass)
      setSecurityStatus({ type: 'success', message: 'Password updated successfully!' })
      setNewPass(''); setConfirmPass('')
    } catch (err: any) {
      setSecurityStatus({ type: 'error', message: err.message || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  if (isSettingsLoading || isProfileLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <p className="text-sm font-bold text-gray-500">Loading settings...</p>
      </div>
    </div>
  )

  const tabs = [
    { id: 'profile',       label: 'Profile',        icon: User,     color: 'text-purple-600',  bg: 'bg-purple-500/10' },
    { id: 'business',      label: 'Business Mode',  icon: Briefcase, color: 'text-emerald-600',  bg: 'bg-emerald-500/10' },
    { id: 'privacy',       label: 'Privacy',        icon: Eye,      color: 'text-cyan-600',     bg: 'bg-cyan-500/10' },
    { id: 'notifications', label: 'Notifications',  icon: Bell,     color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { id: 'security',      label: 'Security',       icon: Shield,   color: 'text-red-600', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 pb-20">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-black mb-6 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          <Settings size={22} className="text-blue-500" /> Settings
        </h1>
        <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={clsx("flex items-center gap-3 p-3 text-left rounded-2xl whitespace-nowrap transition-all text-sm",
                  isActive ? `${tab.bg} ${tab.color} font-bold shadow-sm` : "text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]")}>
                <tab.icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden text-xs font-bold">{tab.label.split(' ')[0]}</span>
                {isActive && <ChevronRight size={14} className="ml-auto hidden md:block" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-[var(--bg-card)]/95 rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-800/40 p-6 backdrop-blur-sm" key={activeTab}>
        
        {/* ─── PROFILE ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black flex items-center gap-2 border-b border-gray-200/20 dark:border-gray-800/50 pb-4">
              <User size={20} className="text-purple-600" /> Profile Settings
            </h2>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[var(--bg-elevated)] border-4 border-gray-200/20 dark:border-gray-800/50 shadow-xl">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--syn-comment)] font-black text-3xl">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-xl text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                </label>
              </div>
              <p className="text-xs text-[var(--syn-comment)] font-bold uppercase tracking-widest">Change Profile Photo</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest mb-2">Display Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-[var(--text-primary)] transition-all font-bold hover:border-gray-200/40 dark:hover:border-gray-700/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest mb-2">Username</label>
                  <input type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-[var(--text-primary)] transition-all font-bold hover:border-gray-200/40 dark:hover:border-gray-700/50" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest mb-2">Bio</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-[var(--text-primary)] transition-all font-medium hover:border-gray-200/40 dark:hover:border-gray-700/50" rows={4} />
              </div>
              {securityStatus.type && (
                <div className={clsx("p-3 rounded-xl flex items-center gap-2 text-sm font-bold",
                  securityStatus.type === 'success' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
                )}>
                  {securityStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {securityStatus.message}
                </div>
              )}
              <button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {updateProfileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} 
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* ─── BUSINESS MODE ─── */}
        {activeTab === 'business' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black flex items-center gap-2 border-b border-gray-200/20 dark:border-gray-800/50 pb-4">
              <Briefcase size={20} className="text-emerald-600" /> Business Mode
            </h2>
            <div className={clsx("p-6 rounded-3xl border-2 transition-all duration-300", businessEnabled ? "border-emerald-500 bg-emerald-500/5" : "border-gray-200/30 dark:border-gray-800/40 bg-[var(--bg-secondary)]")}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", businessEnabled ? "bg-emerald-500 text-white" : "bg-[var(--bg-elevated)] text-[var(--syn-comment)]")}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="font-black dark:text-white uppercase tracking-tighter">Enable Business Hub</p>
                    <p className="text-xs text-gray-500 font-bold">Unlocks vendor tools and analytics</p>
                  </div>
                </div>
                <button onClick={() => {
                  const nextEnabled = !businessEnabled
                  setBusinessEnabled(nextEnabled)
                  setAppMode(nextEnabled ? 'business' : 'user')
                  mutation.mutate({ section: 'business', data: { enabled: nextEnabled } })
                }}
                  className={clsx("w-14 h-8 rounded-full relative transition-all duration-300", businessEnabled ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700")}>
                  <div className={clsx("w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm", businessEnabled ? "left-7" : "left-1")} />
                </button>
              </div>
              {businessEnabled && (
                <div className="space-y-4 animate-in slide-in-from-top-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Your Business Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'product_seller', label: 'Product Seller', icon: Package },
                      { id: 'rider', label: 'Ride/Delivery Driver', icon: Car },
                      { id: 'restaurant_manager', label: 'Restaurant Manager', icon: Utensils },
                      { id: 'hotel_manager', label: 'Hotel Manager', icon: Hotel }
                    ].map(role => (
                      <button key={role.id} onClick={() => setBusinessType(role.id as any)}
                        className={clsx("flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left", 
                          businessType === role.id ? "border-emerald-500 bg-[var(--bg-card)] shadow-md" : "border-transparent bg-[var(--bg-elevated)] grayscale opacity-70 hover:grayscale-0 hover:opacity-100")}>
                        <role.icon size={20} className={businessType === role.id ? "text-emerald-500" : "text-gray-400"} />
                        <span className="font-black text-sm uppercase tracking-tight">{role.label}</span>
                        {businessType === role.id && <Check size={16} className="ml-auto text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PRIVACY ─── */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black flex items-center gap-2 border-b dark:border-gray-800 pb-4">
              <Eye size={20} className="text-cyan-600" /> Privacy & Visibility
            </h2>
            <div className="space-y-3">
              {[
                { id: 'readReceipts', label: 'Read Receipts', desc: 'Others see when you read messages' },
                { id: 'showOnlineStatus', label: 'Online Status', desc: 'Show when you are active' },
                { id: 'privateProfile', label: 'Private Profile', desc: 'Only followers can see your posts' }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between p-5 bg-[var(--bg-elevated)] rounded-2xl cursor-pointer hover:bg-cyan-500/5 transition-all">
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={settings?.privacy?.[item.id] ?? true}
                    onChange={(e) => handleToggle('privacy', item.id, e.target.checked)} className="w-5 h-5 accent-cyan-500" />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ─── NOTIFICATIONS ─── */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black flex items-center gap-2 border-b dark:border-gray-800 pb-4">
              <Bell size={20} className="text-orange-600" /> Notifications
            </h2>
            <div className="space-y-2">
              {['messages', 'likes', 'comments', 'orders', 'rides'].map(cat => (
                <label key={cat} className="flex items-center justify-between p-5 bg-[var(--bg-elevated)] rounded-2xl cursor-pointer hover:bg-orange-500/5 transition-all">
                  <span className="font-black capitalize text-sm uppercase tracking-tight">{cat}</span>
                  <input type="checkbox" checked={settings?.notifications?.categories?.[cat] ?? true}
                    onChange={(e) => handleToggle('notifications', 'categories', e.target.checked, cat)} className="w-5 h-5 accent-orange-500" />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ─── SECURITY ─── */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black flex items-center gap-2 border-b dark:border-gray-800 pb-4">
              <Shield size={20} className="text-red-600" /> Account Security
            </h2>
            <div className="space-y-5">
              <form onSubmit={handleUpdatePassword} className="space-y-4 p-6 border border-gray-200/30 dark:border-gray-800/40 rounded-[2rem] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  <Lock size={14} /> Change Password
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-[var(--text-primary)] transition-all font-bold hover:border-gray-200/40 dark:hover:border-gray-700/50" />
              <input type="password" placeholder="Confirm password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-700/40 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-[var(--text-primary)] transition-all font-bold hover:border-gray-200/40 dark:hover:border-gray-700/50" />
                </div>
                <button type="submit" disabled={loading || !newPass}
                  className="w-full bg-red-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all">
                  Update Security Credentials
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
