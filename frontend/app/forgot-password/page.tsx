'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/services/authApi'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await resetPassword(email)
      setMessage('Password reset link sent! Please check your email.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>
        
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <p className="text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm">{error}</p>}
        {message && <p className="text-green-600 mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm font-medium">{message}</p>}
        
        {!message && (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                    <input 
                        type="email" 
                        className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        )}
      </div>
    </div>
  )
}
