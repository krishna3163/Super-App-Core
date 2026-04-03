'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/services/api'
import { CheckCircle2, MapPin, Clock, MessageSquareText, Phone, Store, ShoppingBag } from 'lucide-react'

export default function BusinessProfilePage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const res = await api.get(`/super-comm/business/${id}`)
      return res.data
    }
  })

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading business profile...</div>
  if (!data?.business) return <div className="p-8 text-center text-red-500">Business not found</div>

  const { business, catalog } = data

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Business Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-700"></div>
        <div className="px-6 pb-6 relative">
          <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-2xl p-1 absolute -top-12 shadow-lg flex items-center justify-center text-emerald-600 text-3xl font-bold">
            {business.logo ? <img src={business.logo} className="w-full h-full rounded-xl object-cover" /> : <Store size={40} />}
          </div>
          
          <div className="mt-14 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                {business.businessName}
                {business.isVerified && <CheckCircle2 className="text-emerald-500" size={20} />}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{business.category} Business</p>
            </div>
            
            <div className="flex gap-2">
              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                <Phone size={20} />
              </button>
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">
                <MessageSquareText size={18} /> Chat
              </button>
            </div>
          </div>

          <p className="mt-6 text-gray-700 dark:text-gray-300">{business.description || 'Welcome to our official business page!'}</p>

          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            {business.address && (
              <div className="flex items-center gap-2"><MapPin size={16} /> {business.address}</div>
            )}
            {business.workingHours?.monday && (
              <div className="flex items-center gap-2"><Clock size={16} /> Mon: {business.workingHours.monday}</div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
          <ShoppingBag size={24} className="text-emerald-600" /> Catalog
        </h2>
        
        {catalog?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalog.map((item: any) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center font-bold text-red-600">OUT OF STOCK</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold dark:text-white text-sm truncate">{item.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-8 text-center text-gray-500">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p>This business hasn't added any products to their catalog yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
