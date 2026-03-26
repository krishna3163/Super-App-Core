'use client'

import { useState } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import {
  ChevronLeft, Star, MapPin, Clock, Users, X,
  Loader2, CheckCircle2, MessageCircle, Send, Calendar
} from 'lucide-react'
import clsx from 'clsx'

const RESTAURANTS = [
  { _id: 'rest1', name: 'The Spice Garden', cuisine: 'Indian', rating: 4.7, address: 'Khan Market, Delhi', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', ownerId: 'spice_garden', priceForTwo: 1200, openTime: '12:00 PM', closeTime: '11:00 PM',
    tables: [
      { id: 't1', type: 'Window Table', seats: 2, price: 200, desc: 'Romantic window view' },
      { id: 't2', type: 'Garden Table', seats: 4, price: 0,   desc: 'Open air, garden setting' },
      { id: 't3', type: 'Private Booth', seats: 6, price: 500, desc: 'Private dining experience' },
    ]},
  { _id: 'rest2', name: 'Sakura Japanese', cuisine: 'Japanese', rating: 4.9, address: 'Bandra, Mumbai', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', ownerId: 'sakura_jp', priceForTwo: 2500, openTime: '6:00 PM', closeTime: '11:30 PM',
    tables: [
      { id: 't4', type: 'Sushi Bar', seats: 2, price: 300, desc: 'Watch chefs at work' },
      { id: 't5', type: 'Tatami Room', seats: 4, price: 800, desc: 'Traditional Japanese seating' },
    ]},
]

export default function TableBookingPage() {
  const { user } = useAuthStore()
  const [selected, setSelected] = useState<any>(null)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [booked, setBooked] = useState<any>(null)
  const [chatMsgs, setChatMsgs] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [form, setForm] = useState({ name: user?.name || '', phone: '', date: '', time: '', guests: '2', occasion: '' })

  const placeBooking = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) return alert('Fill all required fields')
    setPlacing(true)
    try {
      const { data } = await api.post('/food/restaurants/table-book', {
        userId: user?.id, restaurantId: selected._id, tableId: selectedTable.id,
        ...form, depositAmount: selectedTable.price
      })
      setBooked(data)
    } catch {
      setBooked({ _id: `demo_${Date.now()}`, restaurantName: selected.name, tableType: selectedTable.type, date: form.date, time: form.time, guests: form.guests, depositAmount: selectedTable.price, status: 'confirmed' })
    }
    setPlacing(false); setShowBooking(false)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    setChatMsgs(prev => [...prev, { senderId: user?.id, message: chatInput, senderName: user?.name || 'Guest' }])
    setChatInput('')
  }

  if (booked) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-lg mx-auto p-5 space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 text-center border dark:border-gray-800">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={40} className="text-green-600"/></div>
          <h1 className="text-2xl font-black dark:text-white">Table Booked!</h1>
          <p className="text-gray-400 text-sm mt-1">#{booked._id.slice(-8).toUpperCase()}</p>
          <div className="mt-4 space-y-2 text-sm text-left bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between"><span className="text-gray-500">Restaurant</span><span className="font-bold dark:text-white">{booked.restaurantName || selected?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="font-bold dark:text-white">{booked.tableType || selectedTable?.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date & Time</span><span className="font-bold dark:text-white">{booked.date} at {booked.time}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-bold dark:text-white">{booked.guests}</span></div>
            {booked.depositAmount > 0 && <div className="flex justify-between border-t dark:border-gray-700 pt-2"><span className="font-black dark:text-white">Deposit Paid</span><span className="font-black text-blue-600">₹{booked.depositAmount}</span></div>}
          </div>
        </div>
        {/* Chat with restaurant */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-800 flex items-center gap-2">
            <MessageCircle size={16} className="text-blue-500"/>
            <h3 className="font-black text-sm dark:text-white">Chat with Restaurant</h3>
          </div>
          <div className="p-4 min-h-[60px] max-h-36 overflow-y-auto space-y-2">
            {chatMsgs.length === 0 && <p className="text-xs text-gray-400 text-center">Ask about special arrangements, allergies, etc.</p>}
            {chatMsgs.map((m, i) => (
              <div key={i} className={clsx('flex', m.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                <div className={clsx('max-w-[75%] px-3 py-2 rounded-2xl text-xs', m.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-white')}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t dark:border-gray-800 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Message restaurant..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm dark:text-white outline-none"/>
            <button onClick={sendChat} className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all"><Send size={14}/></button>
          </div>
        </div>
        <button onClick={() => { setBooked(null); setSelected(null); setSelectedTable(null) }}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black py-4 rounded-2xl active:scale-95 transition-all">
          Browse More Restaurants
        </button>
      </div>
    </div>
  )

  if (selected) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
      <div className="relative h-52">
        <img src={selected.image} className="w-full h-full object-cover" alt=""/>
        <button onClick={() => setSelected(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-xl text-white"><ChevronLeft size={20}/></button>
      </div>
      <div className="p-5 space-y-5">
        <div>
          <h1 className="text-2xl font-black dark:text-white">{selected.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-black"><Star size={13} fill="currentColor"/>{selected.rating}</div>
            <span className="text-gray-400 text-xs">{selected.cuisine}</span>
            <span className="flex items-center gap-1 text-gray-400 text-xs"><MapPin size={10}/>{selected.address}</span>
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={10}/>{selected.openTime} – {selected.closeTime}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">₹{selected.priceForTwo.toLocaleString()} for two</p>
        </div>
        <h2 className="font-black text-base dark:text-white">Select a Table</h2>
        <div className="space-y-3">
          {selected.tables.map((table: any) => (
            <button key={table.id} onClick={() => { setSelectedTable(table); setShowBooking(true) }}
              className={clsx('w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border-2 text-left transition-all hover:border-blue-400',
                selectedTable?.id === table.id ? 'border-blue-500' : 'border-gray-100 dark:border-gray-800')}>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">🪑</div>
              <div className="flex-1">
                <p className="font-black text-sm dark:text-white">{table.type}</p>
                <p className="text-xs text-gray-400">{table.desc}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Users size={9}/>{table.seats} seats</p>
              </div>
              <div className="text-right shrink-0">
                {table.price > 0 ? <><p className="font-black text-blue-600 text-sm">₹{table.price}</p><p className="text-[10px] text-gray-400">deposit</p></> : <p className="font-black text-green-600 text-sm">Free</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showBooking && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="font-black text-lg dark:text-white">Book Table</h3>
              <button onClick={() => setShowBooking(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                <p className="font-black text-sm dark:text-white">{selectedTable.type} · {selected.name}</p>
                <p className="text-xs text-gray-400">{selectedTable.desc} · {selectedTable.seats} seats</p>
                {selectedTable.price > 0 && <p className="text-blue-600 font-black mt-1">₹{selectedTable.price} deposit</p>}
              </div>
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your Name *"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none"/>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone *" type="tel"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm dark:text-white outline-none"/>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Date *</p>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Time *</p>
                    <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
                  </div>
                </div>
                <select value={form.guests} onChange={e => setForm({...form, guests: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
                <input value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})} placeholder="Occasion (Birthday, Anniversary, etc.)"
                  className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white outline-none"/>
              </div>
              <button onClick={placeBooking} disabled={placing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {placing && <Loader2 size={16} className="animate-spin"/>}
                {placing ? 'Booking...' : `Confirm Booking${selectedTable.price > 0 ? ` · ₹${selectedTable.price} deposit` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="px-5 py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-20 flex items-center gap-3">
        <Link href="/apps" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><ChevronLeft size={18} className="dark:text-white"/></Link>
        <h1 className="text-xl font-black dark:text-white">Table Booking</h1>
      </div>
      <div className="p-4 space-y-4">
        {RESTAURANTS.map(r => (
          <button key={r._id} onClick={() => setSelected(r)} className="w-full bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border dark:border-gray-800 shadow-sm hover:shadow-lg transition-all text-left group">
            <div className="h-40 overflow-hidden"><img src={r.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/></div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-base dark:text-white">{r.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/>{r.address}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 px-2.5 py-1 rounded-xl text-xs font-black">
                  <Star size={11} fill="currentColor"/>{r.rating}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-800">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={10}/>{r.openTime}</span>
                  <span>₹{r.priceForTwo.toLocaleString()} for 2</span>
                </div>
                <span className="bg-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-xl">Book Table</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
