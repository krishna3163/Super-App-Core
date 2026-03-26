'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { login, signInWithOAuth } from '@/services/authApi'
import useAuthStore from '@/store/useAuthStore'

import api from '@/services/api'

export default function LoginPage() {
  const { isReady } = useAuth(false)
  const setAuth = useAuthStore(state => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isReady) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login(email, password)
      // Set initial auth state
      setAuth({ id: data.userId, email }, data.token)
      
      // Fetch full profile to get name/avatar etc.
      try {
          const profileRes = await api.get(`/users/profile/${data.userId}`)
          const profile = profileRes.data.data; // user-service returns { status, data: user }
          if (profile) {
              setAuth({ 
                  id: data.userId, 
                  email: profile.email || email,
                  name: profile.name,
                  avatar: profile.avatar
              }, data.token)
          }
      } catch (profileErr) {
          console.error("Could not fetch profile", profileErr)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Super App Login</h1>
        
        {error && <p className="text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-gray-300">Password</label>
                <Link href="/forgot-password" title="Password reset" className="text-xs text-blue-500 hover:underline dark:text-blue-400">Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
            Login
          </button>
        </form>

        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => signInWithOAuth('google')}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl border border-gray-300 shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-all active:scale-95"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                    Google
                </button>
                <button 
                  onClick={() => signInWithOAuth('github')}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl border border-gray-300 shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5 mr-2 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
                    GitHub
                </button>
            </div>
        </div>

        <p className="mt-8 text-center text-sm dark:text-gray-400 font-medium">
          Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign up for free</Link>
        </p>
      </div>
    </div>
  )
}
