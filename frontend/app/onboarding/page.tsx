'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions, PermissionType } from '@/hooks/usePermissions'
import useAuthStore from '@/store/useAuthStore'

const PERMISSIONS_TO_REQUEST: { type: PermissionType | 'storage'; label: string; icon: string; description: string }[] = [
  { type: 'camera', label: 'Camera', icon: '📷', description: 'Used for snaps, video calls, and profile photos.' },
  { type: 'microphone', label: 'Microphone', icon: '🎤', description: 'Used for voice calls, voice notes, and video audio.' },
  { type: 'location', label: 'Location', icon: '📍', description: 'Used for ride-sharing, food delivery, and local explore.' },
  { type: 'notifications', label: 'Notifications', icon: '🔔', description: 'Stay updated on messages, orders, and alerts.' },
  { type: 'contacts', label: 'Contacts', icon: '👥', description: 'Find and connect with friends easily.' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const { permissions, requestPermission } = usePermissions()
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const currentPermission = PERMISSIONS_TO_REQUEST[step]

  const handleNext = async () => {
    if (step < PERMISSIONS_TO_REQUEST.length - 1) {
      setStep(step + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleRequest = async () => {
    if (currentPermission.type !== 'storage') {
      await requestPermission(currentPermission.type as PermissionType)
    } else {
      // Mock storage permission request
      console.log('Requesting storage permission')
    }
    handleNext()
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      // Save to user-service settings
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:5002'}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          permissions,
          onboardingCompleted: true,
        }),
      })
      if (response.ok) {
        router.push('/feed')
      } else {
        console.error('Failed to save settings:', await response.text())
        router.push('/feed')
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      router.push('/feed') // Fallback
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <h1 className="text-2xl font-bold mb-4">Welcome to SuperApp!</h1>
        <p className="mb-6 text-slate-600">Please log in to continue with the setup.</p>
        <button 
          onClick={() => router.push('/login')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Setup SuperApp</h1>
            <span className="text-sm font-medium text-slate-400">Step {step + 1} of {PERMISSIONS_TO_REQUEST.length}</span>
          </div>

          <div className="text-center mb-8 h-48 flex flex-col justify-center">
            <div className="text-6xl mb-4 animate-bounce">{currentPermission.icon}</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{currentPermission.label} Access</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{currentPermission.description}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRequest}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50"
            >
              Allow Access
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t flex gap-2">
          {PERMISSIONS_TO_REQUEST.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
