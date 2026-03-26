'use client'

import { Briefcase, Search, Star, MapPin, Filter, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const freelancers = [
  { id: 1, name: 'Amit Kumar', role: 'Plumber', rating: 4.8, reviews: 156, price: '₹200/hr', image: 'https://i.pravatar.cc/150?u=amit' },
  { id: 2, name: 'Sarah Wilson', role: 'Graphic Designer', rating: 4.9, reviews: 89, price: '₹450/hr', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 3, name: 'David Chen', role: 'Electrician', rating: 4.7, reviews: 210, price: '₹300/hr', image: 'https://i.pravatar.cc/150?u=david' },
  { id: 4, name: 'Lisa Ray', role: 'Tutor (Maths)', rating: 5.0, reviews: 45, price: '₹250/hr', image: 'https://i.pravatar.cc/150?u=lisa' },
]

export default function ServicesHubPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
      <header className="p-6 border-b dark:border-gray-800">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Local Services</h1>
        <div className="flex gap-2">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search for services (Plumber, Designer...)"
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                />
            </div>
            <button className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-gray-600 dark:text-gray-400"><Filter size={20} /></button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white">Featured Professionals</h2>
            <button className="text-blue-600 text-xs font-bold">Near You</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freelancers.map(pro => (
                <div key={pro.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 shadow-sm flex gap-4">
                    <img src={pro.image} className="w-20 h-20 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold dark:text-white">{pro.name}</h3>
                                <p className="text-xs text-blue-600 font-medium">{pro.role}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold dark:text-white text-sm">{pro.price}</p>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <MapPin size={10} />
                                    <span>2.5 km</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                                <Star size={14} fill="currentColor" />
                                <span>{pro.rating}</span>
                                <span className="text-gray-400 font-normal">({pro.reviews})</span>
                            </div>
                            <Link href={`/chat/freelancer_${pro.id}`} className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                <MessageCircle size={14} />
                                Hire
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
                <Briefcase className="text-blue-600" size={24} />
                <h3 className="font-bold dark:text-white text-lg">Become a Freelancer</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Earn money by offering your services to millions of users on SuperApp.</p>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-transform hover:scale-105">List Your Service</button>
        </div>
      </div>
    </div>
  )
}
