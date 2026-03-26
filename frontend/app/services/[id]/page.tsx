'use client'

import { useParams } from 'next/navigation'
import { Star, MapPin, Briefcase, Clock, MessageSquare, CalendarCheck } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'

export default function ServiceProviderPage() {
  const { id } = useParams()
  const { user } = useAuthStore()

  // Mocking the data that would normally come from React Query and the Economy Service
  const provider = {
    _id: id,
    title: 'Master Electrician',
    category: 'electrician',
    rating: 4.8,
    reviewCount: 120,
    pricing: { rate: 50, type: 'hourly' },
    location: { address: 'New York City, NY' },
    skills: ['Wiring', 'Lighting Installation', 'Circuit Breakers', 'Smart Home Setup'],
    experienceYears: 8,
    bio: 'I am a licensed master electrician with over 8 years of experience serving residential and commercial clients. I specialize in smart home integrations and complex wiring issues. Safety and quality are my top priorities.'
  }

  const handleBook = () => {
    // In a real app: api.post('/economy/services/bookings', { ... })
    alert('Booking request sent! A negotiation chat has been opened.')
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
          
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner">
            <Briefcase size={48} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                  Verified Professional
                </div>
                <h1 className="text-3xl font-extrabold dark:text-white">{provider.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1 font-bold text-yellow-500"><Star fill="currentColor" size={16} /> {provider.rating} ({provider.reviewCount} reviews)</span>
                  <span className="flex items-center gap-1"><MapPin size={16} /> {provider.location.address}</span>
                  <span className="flex items-center gap-1"><Clock size={16} /> {provider.experienceYears} Years Exp.</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">${provider.pricing.rate}</p>
                <p className="text-gray-500 text-sm">per {provider.pricing.type === 'hourly' ? 'hour' : 'job'}</p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{provider.bio}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {provider.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t dark:border-gray-700 flex gap-4">
          <button onClick={handleBook} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
            <CalendarCheck size={24} /> Book Service
          </button>
          <button className="px-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <MessageSquare size={20} /> Chat First
          </button>
        </div>
      </div>

    </div>
  )
}
