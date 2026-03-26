'use client'

import { useState, useMemo, useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import api from '@/services/api'
import Link from 'next/link'
import {
  MapPin, Navigation, Car, Bike, Star, Phone, Search,
  MessageCircle, ChevronRight, Clock, CreditCard, X,
  Banknote, Smartphone, CheckCircle2, Users, Map as MapIcon, RotateCcw,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { bmsspCalculateDistance, CITY_NODES, MOCK_GRAPH } from '@/utils/bmssp'

const BaseMap = dynamic(() => import('@/components/Map'), { ssr: false })

// ─── Vehicle data ─────────────────────────────────────────────────────────────
const VEHICLES = [
  {
    type: 'car', label: 'Car', icon: Car,
    variants: [
      { id: 'mini',    name: 'Mini',       desc: 'Hatchback · 4 seats',  priceMultiplier: 1.0, eta: '3 min',  img: '🚗' },
      { id: 'sedan',   name: 'Sedan',      desc: 'Sedan · 4 seats',      priceMultiplier: 1.5, eta: '5 min',  img: '🚙' },
      { id: 'suv',     name: 'SUV',        desc: 'SUV · 6 seats',        priceMultiplier: 2.5, eta: '7 min',  img: '🚐' },
      { id: 'premium', name: 'Premium',    desc: 'Luxury · 4 seats',     priceMultiplier: 4.0, eta: '8 min',  img: '🏎️' },
    ]
  },
  {
    type: 'auto', label: 'Auto', icon: Users,
    variants: [
      { id: 'auto',      name: 'Auto',       desc: '3-wheeler · 3 seats',  priceMultiplier: 0.7, eta: '2 min',  img: '🛺' },
      { id: 'e-auto',    name: 'E-Auto',     desc: 'Electric · 3 seats',   priceMultiplier: 0.6, eta: '4 min',  img: '⚡' },
    ]
  },
  {
    type: 'bike', label: 'Bike', icon: Bike,
    variants: [
      { id: 'bike',      name: 'Bike',       desc: 'Motorcycle · 1 seat',  priceMultiplier: 0.4, eta: '1 min',  img: '🏍️' },
      { id: 'e-bike',    name: 'E-Bike',     desc: 'Electric · 1 seat',    priceMultiplier: 0.3, eta: '2 min',  img: '⚡🏍️' },
    ]
  },
]

const PAYMENT = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi',  label: 'UPI',  icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
]

type Step = 'input' | 'search' | 'select' | 'matching' | 'found'

export default function RidesPage() {
  const { user, appMode, businessType, addActivity } = useAuthStore()
  const [step, setStep] = useState<Step>('input')
  const [activeSearch, setActiveSearch] = useState<'pickup' | 'drop' | null>(null)
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [vehicleType, setVehicleType] = useState('car')
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [payMethod, setPayMethod] = useState('cash')
  const [booking, setBooking] = useState(false)
  const [rideData, setRideData] = useState<any>(null)
  const [matchingStatus, setMatchingStatus] = useState('Searching for drivers...')
  const [progress, setProgress] = useState(0)

  // Simulation of nearby riders
  const nearbyDrivers = useMemo(() => {
    return [
      { id: 1, name: 'Suresh Kumar', rating: 4.8, distance: '0.8 km', vehicle: 'White Swift' },
      { id: 2, name: 'Amit Singh', rating: 4.9, distance: '1.2 km', vehicle: 'Silver WagonR' },
      { id: 3, name: 'Rahul Dev', rating: 4.7, distance: '1.5 km', vehicle: 'Red i10' },
    ]
  }, []);

  // BMSSP distance
  const routeCalculation = useMemo(() => {
    if (!pickup || !drop || pickup === drop) return null;
    const res = bmsspCalculateDistance(MOCK_GRAPH, pickup, drop);
    return res;
  }, [pickup, drop]);

  const currentVehicle = VEHICLES.find(v => v.type === vehicleType)!

  useEffect(() => {
    if (step === 'matching') {
        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return p + 2;
            });
        }, 50);
        
        const statusTimer = setTimeout(() => setMatchingStatus('3 drivers notified...'), 800);
        const acceptTimer = setTimeout(() => setMatchingStatus('Driver Raj Singh accepted your request!'), 2000);

        return () => {
            clearInterval(timer);
            clearTimeout(statusTimer);
            clearTimeout(acceptTimer);
        };
    } else {
        setProgress(0);
        setMatchingStatus('Searching for drivers...');
    }
  }, [step]);

  const handleSearchTrigger = (type: 'pickup' | 'drop') => {
    setActiveSearch(type)
    setStep('search')
  }

  const handleSelectLocation = (loc: string) => {
    if (activeSearch === 'pickup') setPickup(loc)
    else setDrop(loc)
    setStep('input')
    setActiveSearch(null)
  }

  const handleConfirmRoute = () => {
    if (!pickup || !drop || pickup === drop) {
        alert("Please select distinct pickup and drop locations.");
        return;
    }
    setSelectedVariant(currentVehicle.variants[0])
    setStep('select')
  }

  const handleBook = async () => {
    if (!selectedVariant || !routeCalculation) return
    setBooking(true)
    setStep('matching')
    
    try {
      const { data } = await api.post('/rides/book', {
        userId: user?.id,
        pickup, drop,
        vehicleType: selectedVariant.id,
        fare: Math.floor(routeCalculation.distance * 10 * selectedVariant.priceMultiplier),
        paymentMethod: payMethod
      });
      setRideData(data)
      addActivity({ id: Date.now().toString(), type: 'ride', title: `Ride to ${drop}`, status: 'Finding Driver', time: 'Just now' })
    } catch {
      setRideData({ _id: `demo_${Date.now()}`, driverName: 'Raj Singh', driverRating: 4.9, vehicle: 'White Swift', plate: 'DL 1C 8943', eta: selectedVariant.eta })
    }

    setTimeout(() => { 
        setStep('found'); 
        setBooking(false) 
    }, 3500)
  }

  const pickupCoords = CITY_NODES[pickup]
  const dropCoords = CITY_NODES[drop]
  const routeLine = routeCalculation?.path.map(n => CITY_NODES[n])

  // View: Business Mode
  if (appMode === 'business' && businessType === 'rider') {
      return (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20">
              <header className="bg-emerald-600 text-white p-6 pb-8 rounded-b-[2rem] shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black">Driver Dashboard</h1>
                        <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mt-1">Accept & Manage Rides</p>
                    </div>
                    <div className="bg-emerald-500 p-3 rounded-2xl shadow-inner">
                        <Car size={24} />
                    </div>
                  </div>
              </header>

              <div className="p-6 -mt-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-emerald-600/10 border-2 border-emerald-500/20 space-y-4">
                      <div className="flex items-center justify-between">
                          <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-widest">Incoming Requests</h2>
                          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 transition-all hover:border-emerald-500 cursor-pointer group">
                          <div className="flex justify-between items-start mb-3">
                              <div>
                                  <p className="font-black text-lg text-slate-800 dark:text-white">₹320.00</p>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auto (Cash)</p>
                              </div>
                              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                  2.4 km away
                              </div>
                          </div>
                          <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-3 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Connaught Place (CP)</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Saket Mall</span>
                              </div>
                          </div>
                          <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest transition-transform group-active:scale-95 flex items-center justify-center gap-2">
                              Accept Ride <CheckCircle2 size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Map Section */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 min-h-[200px]">
        {pickupCoords || dropCoords ? (
            <BaseMap pickup={pickupCoords} dropoff={dropCoords} route={routeLine} />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 text-blue-600/50">
                <MapIcon size={64} className="animate-pulse" />
            </div>
        )}

        {/* Floating Controls */}
        {step === 'input' && (
          <div className="absolute top-4 left-4 right-4 space-y-2 z-[400]">
            <button onClick={() => handleSearchTrigger('pickup')} 
                className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border dark:border-gray-700 text-left">
              <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"/>
              <span className={clsx("flex-1 text-sm font-bold", pickup ? "text-slate-800 dark:text-white" : "text-slate-400")}>
                {pickup ? pickup.toUpperCase() : "Where from?"}
              </span>
              <Search size={16} className="text-slate-400" />
            </button>
            <button onClick={() => handleSearchTrigger('drop')} 
                className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border dark:border-gray-700 text-left">
              <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0"/>
              <span className={clsx("flex-1 text-sm font-bold", drop ? "text-slate-800 dark:text-white" : "text-slate-400")}>
                {drop ? drop.toUpperCase() : "Where to?"}
              </span>
              <Navigation size={16} className="text-slate-400" />
            </button>
          </div>
        )}

        {(step === 'found') && rideData && (
          <div className="absolute top-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-2xl shadow-lg z-[400] animate-slide-up border dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 font-black text-sm">
              <CheckCircle2 size={16}/> Driver on the way · {selectedVariant?.eta}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-bold uppercase tracking-widest italic">
              <MapPin size={12}/> {pickup} → {drop}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interface */}
      <div className={clsx(
        "bg-white dark:bg-gray-900 rounded-t-[2.5rem] shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.15)] p-5 border-t dark:border-gray-800 relative z-[401]",
        step === 'search' ? "flex-1 mt-0 rounded-none" : "-mt-6"
      )}>
        {step !== 'search' && <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6"/>}

        {/* STEP: Search Locations */}
        {step === 'search' && (
          <div className="flex flex-col h-full space-y-4">
             <div className="flex items-center gap-4">
                <button onClick={() => setStep('input')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X size={20} className="dark:text-white" />
                </button>
                <h2 className="text-xl font-black dark:text-white">Choose {activeSearch}</h2>
             </div>
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-3 border dark:border-gray-700">
                <Search size={20} className="text-slate-400" />
                <input autoFocus placeholder="Search for area or landmark..." className="bg-transparent outline-none flex-1 text-sm font-bold dark:text-white" />
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Nearby Locations</p>
                {Object.keys(CITY_NODES).map(key => (
                    <button key={key} onClick={() => handleSelectLocation(key)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="font-black text-sm dark:text-white">{key.toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Simulated District, IN</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-slate-300" />
                    </button>
                ))}
             </div>
          </div>
        )}

        {/* STEP: Ride Options */}
        {step === 'input' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black dark:text-white tracking-tight">Book a Ride</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">BMSSP Routing Engine</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-full">
                    <Zap size={12} fill="currentColor"/>
                    <span className="text-[10px] font-black tracking-widest uppercase">Safe Rides</span>
                </div>
            </div>
            
            {/* Vehicle Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {VEHICLES.map(v => (
                <button key={v.type} onClick={() => setVehicleType(v.type)}
                  className={clsx('flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2',
                    vehicleType === v.type ? 'bg-[var(--syn-function)] text-white border-[var(--syn-function)] shadow-md shadow-blue-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200')}>
                  <v.icon size={16}/>{v.label}
                </button>
              ))}
            </div>

            <button onClick={handleConfirmRoute} disabled={!pickup || !drop || pickup === drop}
              className="w-full bg-[var(--syn-function)] text-white py-4.5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] disabled:opacity-40 active:scale-95 transition-all shadow-xl shadow-blue-500/20 interactive">
              Find Options
            </button>
          </div>
        )}

        {/* STEP: Select variant */}
        {step === 'select' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tight">Drivers Nearby</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-5 h-5 rounded-full border border-white dark:border-gray-900" />)}
                    </div>
                    <p className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">3 active now</p>
                </div>
              </div>
              <button onClick={() => setStep('input')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">Edit Route</button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar py-1">
              {currentVehicle.variants.map(v => {
                const calculatedPrice = routeCalculation ? Math.floor(routeCalculation.distance * 10 * v.priceMultiplier) : 50;
                return (
                <button key={v.id} onClick={() => setSelectedVariant(v)}
                  className={clsx('w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all text-left shadow-sm',
                    selectedVariant?.id === v.id ? 'border-[var(--syn-function)] bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200')}>
                  <span className="text-3xl filter drop-shadow-sm">{v.img}</span>
                  <div className="flex-1">
                    <p className="font-black text-sm dark:text-white tracking-tight">{v.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{v.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-base dark:text-white text-lg">₹{calculatedPrice}</p>
                    <p className="text-[10px] text-[var(--syn-function)] flex items-center gap-1 justify-end font-bold uppercase tracking-widest mt-0.5"><Clock size={10}/>{v.eta}</p>
                  </div>
                </button>
              )})}
            </div>

            <div className="flex gap-2">
              {PAYMENT.map(p => (
                <button key={p.id} onClick={() => setPayMethod(p.id)}
                  className={clsx('flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all',
                    payMethod === p.id ? 'border-[var(--syn-variable)] bg-orange-50 dark:bg-orange-900/10 text-[var(--syn-variable)]' : 'border-gray-100 dark:border-gray-800 text-gray-400')}>
                  <p.icon size={14}/>{p.label}
                </button>
              ))}
            </div>

            <button onClick={handleBook} disabled={!selectedVariant}
              className="w-full bg-[var(--syn-function)] text-white py-4 mt-2 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
              Request Ride <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP: Matching Simulation */}
        {step === 'matching' && (
          <div className="py-8 text-center space-y-8 animate-in zoom-in-95">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"/>
              <div className="absolute inset-0 border-4 border-[var(--syn-function)] border-t-transparent rounded-full animate-spin transition-all" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <Navigation className="text-[var(--syn-function)] animate-pulse" size={40}/>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-2xl font-black dark:text-white tracking-tight">{matchingStatus}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 bg-[var(--syn-function)] rounded-full animate-bounce [animation-delay:-0.3s]"/>
                <div className="w-1.5 h-1.5 bg-[var(--syn-function)] rounded-full animate-bounce [animation-delay:-0.15s]"/>
                <div className="w-1.5 h-1.5 bg-[var(--syn-function)] rounded-full animate-bounce"/>
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-[var(--syn-string)] font-black text-[10px] uppercase tracking-[0.3em]">
                <ShieldCheck size={14} /> Secured by SuperApp Pay
              </div>
            </div>

            <button onClick={() => setStep('input')} className="text-[var(--syn-constant)] text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/10 px-6 py-3 rounded-full hover:bg-red-100 transition-colors">Cancel Request</button>
          </div>
        )}

        {/* STEP: Found & Chat Access */}
        {step === 'found' && rideData && (
          <div className="space-y-4 animate-in slide-in-from-bottom-8">
            <div className="text-center mb-6">
              <p className="text-[var(--syn-string)] font-black text-xl tracking-tight">Match Found! 🎉</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Driver is {selectedVariant?.eta} away</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
              <div className="relative">
                <img src={`https://i.pravatar.cc/100?u=driver_${rideData._id}`} className="w-16 h-16 rounded-[1.2rem] object-cover" alt=""/>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div className="flex-1">
                <p className="font-black dark:text-white text-lg">{rideData.driverName || 'Raj Singh'}</p>
                <div className="flex items-center gap-1.5 text-yellow-500 text-xs font-black mt-0.5">
                  <Star size={12} fill="currentColor"/>{rideData.driverRating || '4.9'}
                  <span className="text-gray-400 font-bold uppercase tracking-widest ml-1 bg-gray-200/50 dark:bg-gray-700 px-2 py-0.5 rounded-md text-[9px]">{rideData.vehicle || selectedVariant?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg mb-1 inline-block">
                    <p className="font-black text-sm dark:text-white tracking-widest">{rideData.plate || 'DL1C 8943'}</p>
                </div>
                <p className="text-[9px] text-[var(--syn-function)] font-black uppercase tracking-widest">OTP: 4921</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl font-black text-sm dark:text-white active:scale-95 transition-all border border-transparent hover:border-gray-200">
                <Phone size={18}/> Call
              </button>
              <Link href={`/chat/${rideData.driverId || 'driver_1'}`}
                className="flex items-center justify-center gap-2 bg-[var(--syn-function)] text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                <MessageCircle size={18}/> Chat Now
              </Link>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase tracking-tight leading-relaxed">Safety Tip: Verify the car number and driver before starting the trip.</p>
            </div>

            <button onClick={() => { setStep('input'); setPickup(''); setDrop(''); setRideData(null) }}
              className="w-full text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] py-3 hover:text-gray-600 transition-colors flex items-center justify-center gap-1">
              <RotateCcw size={12} /> Book Another Ride
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
