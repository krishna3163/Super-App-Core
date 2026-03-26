'use client'

import { useState } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import {
  MapPin, Navigation, Car, Bike, Star, Phone,
  MessageCircle, Loader2, ChevronRight, Clock, CreditCard,
  Banknote, Smartphone, CheckCircle2, Users
} from 'lucide-react'
import clsx from 'clsx'

// ─── Vehicle data ─────────────────────────────────────────────────────────────
const VEHICLES = [
  {
    type: 'car', label: 'Car', icon: Car,
    variants: [
      { id: 'mini',    name: 'Mini',       desc: 'Hatchback · 4 seats',  price: 80,  eta: '3 min',  img: '🚗' },
      { id: 'sedan',   name: 'Sedan',      desc: 'Sedan · 4 seats',      price: 120, eta: '5 min',  img: '🚙' },
      { id: 'suv',     name: 'SUV',        desc: 'SUV · 6 seats',        price: 180, eta: '7 min',  img: '🚐' },
      { id: 'premium', name: 'Premium',    desc: 'Luxury · 4 seats',     price: 280, eta: '8 min',  img: '🏎️' },
    ]
  },
  {
    type: 'auto', label: 'Auto', icon: Users,
    variants: [
      { id: 'auto',      name: 'Auto',       desc: '3-wheeler · 3 seats',  price: 50,  eta: '2 min',  img: '🛺' },
      { id: 'e-auto',    name: 'E-Auto',     desc: 'Electric · 3 seats',   price: 40,  eta: '4 min',  img: '⚡' },
    ]
  },
  {
    type: 'taxi', label: 'Taxi', icon: Car,
    variants: [
      { id: 'taxi',      name: 'Taxi',       desc: 'Yellow cab · 4 seats', price: 100, eta: '4 min',  img: '🚕' },
      { id: 'ac-taxi',   name: 'AC Taxi',    desc: 'AC cab · 4 seats',     price: 140, eta: '6 min',  img: '🚖' },
    ]
  },
  {
    type: 'bike', label: 'Bike', icon: Bike,
    variants: [
      { id: 'bike',      name: 'Bike',       desc: 'Motorcycle · 1 seat',  price: 30,  eta: '1 min',  img: '🏍️' },
      { id: 'e-bike',    name: 'E-Bike',     desc: 'Electric · 1 seat',    price: 25,  eta: '2 min',  img: '⚡🏍️' },
      { id: 'scooter',   name: 'Scooter',    desc: 'Scooter · 1 seat',     price: 28,  eta: '2 min',  img: '🛵' },
    ]
  },
]

const PAYMENT = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi',  label: 'UPI',  icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
]

type Step = 'input' | 'select' | 'matching' | 'found'

export default function RidesPage() {
  const { user, addActivity } = useAuthStore()
  const [step, setStep] = useState<Step>('input')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [vehicleType, setVehicleType] = useState('car')
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [payMethod, setPayMethod] = useState('cash')
  const [booking, setBooking] = useState(false)
  const [rideData, setRideData] = useState<any>(null)

  const currentVehicle = VEHICLES.find(v => v.type === vehicleType)!

  const handleSearch = () => {
    if (!pickup.trim() || !drop.trim()) return
    setSelectedVariant(currentVehicle.variants[0])
    setStep('select')
  }

  const handleBook = async () => {
    if (!selectedVariant) return
    setBooking(true)
    setStep('matching')
    try {
      const { data } = await api.post('/rides/book', {
        userId: user?.id,
        pickup, drop,
        vehicleType: selectedVariant.id,
        fare: selectedVariant.price,
        paymentMethod: payMethod
      })
      setRideData(data)
      addActivity({ id: Date.now().toString(), type: 'ride', title: `Ride to ${drop}`, status: 'Finding Driver', time: 'Just now' })
    } catch {
      // Demo fallback
      setRideData({ _id: `demo_${Date.now()}`, driverName: 'Raj Singh', driverRating: 4.9, vehicle: 'White Swift', plate: 'DL 1C 8943', eta: selectedVariant.eta })
    }
    setTimeout(() => { setStep('found'); setBooking(false) }, 2500)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Map placeholder */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 min-h-[200px]">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <MapPin size={80} className="text-blue-600"/>
        </div>
        {/* Location inputs overlay */}
        {step === 'input' && (
          <div className="absolute top-4 left-4 right-4 space-y-2 z-10">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"/>
              <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup location"
                className="flex-1 outline-none text-sm dark:bg-transparent dark:text-white font-bold placeholder:text-gray-400"/>
            </div>
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0"/>
              <input value={drop} onChange={e => setDrop(e.target.value)} placeholder="Where to?"
                className="flex-1 outline-none text-sm dark:bg-transparent dark:text-white font-bold placeholder:text-gray-400"/>
            </div>
          </div>
        )}
        {(step === 'found') && rideData && (
          <div className="absolute top-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-2xl shadow-lg z-10">
            <div className="flex items-center gap-2 text-green-600 font-black text-sm">
              <CheckCircle2 size={16}/> Driver on the way · {selectedVariant?.eta}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <MapPin size={12}/> {pickup} → {drop}
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.15)] p-5 border-t dark:border-gray-800 relative z-20 -mt-8">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5"/>

        {/* STEP: Input */}
        {step === 'input' && (
          <div className="space-y-5">
            <h2 className="text-xl font-black dark:text-white">Book a Ride</h2>
            {/* Vehicle type tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {VEHICLES.map(v => (
                <button key={v.type} onClick={() => setVehicleType(v.type)}
                  className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2',
                    vehicleType === v.type ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700')}>
                  <v.icon size={14}/>{v.label}
                </button>
              ))}
            </div>
            <button onClick={handleSearch} disabled={!pickup.trim() || !drop.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
              Search Rides
            </button>
          </div>
        )}

        {/* STEP: Select variant */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black dark:text-white">Choose {currentVehicle.label}</h2>
              <button onClick={() => setStep('input')} className="text-blue-600 text-xs font-black">Change Route</button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {currentVehicle.variants.map(v => (
                <button key={v.id} onClick={() => setSelectedVariant(v)}
                  className={clsx('w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left',
                    selectedVariant?.id === v.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-blue-300')}>
                  <span className="text-2xl">{v.img}</span>
                  <div className="flex-1">
                    <p className="font-black text-sm dark:text-white">{v.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{v.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm dark:text-white">₹{v.price}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end"><Clock size={9}/>{v.eta}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* Payment */}
            <div className="flex gap-2">
              {PAYMENT.map(p => (
                <button key={p.id} onClick={() => setPayMethod(p.id)}
                  className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-black transition-all',
                    payMethod === p.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-100 dark:border-gray-800 text-gray-500')}>
                  <p.icon size={14}/>{p.label}
                </button>
              ))}
            </div>
            <button onClick={handleBook} disabled={!selectedVariant}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
              Book {selectedVariant?.name || 'Ride'} · ₹{selectedVariant?.price || '—'}
            </button>
          </div>
        )}

        {/* STEP: Matching */}
        {step === 'matching' && (
          <div className="py-8 text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"/>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
              <Navigation className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={28}/>
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white">Finding your driver...</h2>
              <p className="text-gray-400 text-sm mt-1">Matching with nearby {selectedVariant?.name}</p>
            </div>
            <button onClick={() => setStep('input')} className="text-red-400 text-sm font-bold hover:underline">Cancel</button>
          </div>
        )}

        {/* STEP: Found */}
        {step === 'found' && rideData && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <p className="text-green-600 font-black text-lg">Driver Found! 🎉</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Arriving in {selectedVariant?.eta}</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700">
              <img src={`https://i.pravatar.cc/100?u=driver_${rideData._id}`} className="w-14 h-14 rounded-2xl object-cover" alt=""/>
              <div className="flex-1">
                <p className="font-black dark:text-white">{rideData.driverName || 'Raj Singh'}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-black">
                  <Star size={11} fill="currentColor"/>{rideData.driverRating || '4.9'}
                  <span className="text-gray-400 font-normal ml-1">{rideData.vehicle || selectedVariant?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sm dark:text-white">{rideData.plate || 'DL 1C 8943'}</p>
                <p className="text-[10px] text-gray-400">₹{selectedVariant?.price} · {payMethod}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 py-3.5 rounded-2xl font-black text-sm dark:text-white active:scale-95 transition-all">
                <Phone size={16}/> Call
              </button>
              <Link href={`/chat/${rideData.driverId || 'driver_1'}`}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
                <MessageCircle size={16}/> Message
              </Link>
            </div>
            <button onClick={() => { setStep('input'); setPickup(''); setDrop(''); setRideData(null) }}
              className="w-full text-center text-gray-400 text-xs font-bold py-2">
              Book Another Ride
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
