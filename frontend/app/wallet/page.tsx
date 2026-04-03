'use client'

import React, { useState, useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, Plus, History, 
  Wallet as WalletIcon, X, Send, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react'
import api from '@/services/api'

interface Transaction {
  _id: string
  senderId: string
  receiverId: string
  amount: number
  type: 'add_money' | 'transfer' | 'payment' | 'refund'
  status: 'pending' | 'success' | 'failed'
  description: string
  createdAt: string
}

interface WalletProfile {
  walletId: string
  balance: number
  upiId: string
}

export default function WalletPage() {
  const [profile, setProfile] = useState<WalletProfile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [amount, setAmount] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { user } = useAuthStore()

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [profileRes, txRes] = await Promise.all([
        api.get('/wallet/profile'),
        api.get('/wallet/transactions')
      ])

      if (profileRes.data.status === 'success') {
        setProfile(profileRes.data.data)
      }
      if (txRes.data.status === 'success') {
        setTransactions(txRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount))) return
    
    setIsProcessing(true)
    try {
      const response = await api.post('/wallet/topup', {
        userId: user?.id,
        amount: Number(amount)
      })
      if (response.data.status === 'success') {
        setProfile(response.data.data)
        setShowTopUp(false)
        setAmount('')
        fetchWalletData()
      }
    } catch (error) {
      console.error('Top up failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSend = async () => {
    if (!amount || !recipientId || isNaN(Number(amount))) return

    setIsProcessing(true)
    try {
      const response = await api.post('/wallet/transfer', {
        senderId: user?.id,
        receiverId: recipientId,
        amount: Number(amount),
        description
      })
      if (response.data.status === 'success') {
        setShowSend(false)
        setAmount('')
        setRecipientId('')
        setDescription('')
        fetchWalletData()
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Transfer failed. Please check balance and recipient ID.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="p-8 text-center animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl mb-8"></div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-900 rounded-2xl"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <header className="p-8 bg-blue-600 text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <WalletIcon size={20} />
                </div>
                <h1 className="text-sm font-black uppercase tracking-widest">My Wallet</h1>
              </div>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-tighter">{profile?.walletId}</p>
            </div>
            
            <div className="mb-8">
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Available Balance</p>
              <h2 className="text-5xl font-black tracking-tighter">₹{profile?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowTopUp(true)}
                className="flex-1 bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Top Up
              </button>
              <button 
                onClick={() => setShowSend(true)}
                className="flex-1 bg-blue-700/50 border border-blue-400/30 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <ArrowUpRight size={18} /> Send
              </button>
            </div>
        </div>
      </header>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-500">Transaction History</h3>
          <History size={18} className="text-gray-300" />
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-[2rem] border-2 border-dashed border-white/5">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No transactions yet</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx._id} className="bg-[var(--bg-card)] p-5 rounded-[2rem] flex items-center gap-4 shadow-sm border border-white/5 hover:scale-[1.02] transition-transform">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.receiverId === user?.id ? 'bg-green-100 text-green-600 dark:bg-green-900/40' : 'bg-red-100 text-red-600 dark:bg-red-900/40'}`}>
                  {tx.receiverId === user?.id ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate uppercase tracking-tight">{tx.description || (tx.type === 'add_money' ? 'Wallet Top-up' : `To: ${tx.receiverId}`)}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()} • {tx.status}</p>
                </div>
                <div className="text-right">
                    <p className={`font-black text-sm ${tx.receiverId === user?.id ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                        {tx.receiverId === user?.id ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
                    <p className="text-[8px] font-black text-gray-300 uppercase">{tx.type}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-[var(--bg-card)] rounded-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-black uppercase tracking-widest text-[var(--text-primary)]">Top Up Wallet</h2>
                      <button onClick={() => setShowTopUp(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-300">₹</span>
                          <input 
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-[2rem] py-8 pl-14 pr-8 text-4xl font-black outline-none dark:text-white"
                          />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                          {[10, 50, 100].map(val => (
                              <button 
                                key={val}
                                onClick={() => setAmount(val.toString())}
                                className="py-3 bg-slate-100 dark:bg-gray-800 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all"
                              >
                                  +₹{val}
                              </button>
                          ))}
                      </div>

                      <button 
                          disabled={!amount || isProcessing}
                          onClick={handleTopUp}
                          className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                      >
                          {isProcessing ? 'Processing...' : 'Confirm Top Up'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Send Money Modal */}
      {showSend && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Send Money</h2>
                      <button onClick={() => setShowSend(false)} className="p-2 bg-slate-100 dark:bg-gray-800 rounded-full"><X size={20}/></button>
                  </div>

                  <div className="space-y-4">
                      <input 
                          type="text"
                          value={recipientId}
                          onChange={(e) => setRecipientId(e.target.value)}
                          placeholder="Recipient User ID"
                          className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold outline-none dark:text-white"
                      />
                      <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                           placeholder="Amount (₹)"
                          className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold outline-none dark:text-white"
                      />
                      <input 
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What's this for? (Optional)"
                          className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold outline-none dark:text-white"
                      />

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-start gap-3 mt-2">
                          <AlertCircle className="text-blue-600 shrink-0" size={18} />
                          <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase leading-relaxed">Ensure the User ID is correct. Transactions are instant and irreversible.</p>
                      </div>

                      <button 
                          disabled={!amount || !recipientId || isProcessing}
                          onClick={handleSend}
                          className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 mt-4"
                      >
                          {isProcessing ? 'Processing...' : 'Send Money Now'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
