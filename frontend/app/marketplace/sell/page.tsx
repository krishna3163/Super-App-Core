'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, MapPin, IndianRupee, Tag, CheckCircle2, X } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/services/apiServices'

export default function SellItemPage() {
  const router = useRouter()
  const { user, addActivity } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Electronics',
    condition: 'New',
    description: '',
    location: ''
  })

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      
      const fileList = Array.from(files);
      const base64Promises = fileList.map(file => fileToBase64(file));
      
      try {
        const newImages = await Promise.all(base64Promises);
        setImages(prev => [...prev, ...newImages].slice(0, 10));
      } catch (err) {
        console.error("Error converting images to base64", err);
      }
  }

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index))
  }

  const { mutate: publishProduct } = useMutation({
    mutationFn: async (data: any) => {
      return await createProduct(data)
    },
    onSuccess: (data) => {
        setIsSubmitting(false)
        setIsSuccess(true)
        addActivity({
            id: Date.now().toString(),
            type: 'purchase',
            title: `Listed: ${formData.title}`,
            status: 'Active Listing',
            time: 'Just now'
        })
        setTimeout(() => {
            router.push('/marketplace')
        }, 2000)
    },
    onError: () => {
        setIsSubmitting(false)
        alert('Failed to list item. Please try again.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !user?.id) return
    
    setIsSubmitting(true)

    publishProduct({
      ...formData,
      sellerId: user.id,
      images, // base64 or urls
      location: { address: formData.location },
      price: Number(formData.price)
    })
  }

  if (isSuccess) {
      return (
          <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in shadow-lg shadow-green-200">
                  <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black dark:text-white mb-2 tracking-tight">Item Listed!</h1>
              <p className="text-gray-500 font-medium">Redirecting to marketplace...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-700 p-4 sticky top-0 z-20 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-black dark:text-white tracking-tight">Sell an Item</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Area */}
            <div className="space-y-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-all cursor-pointer group"
                >
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                    />
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                    </div>
                    <div className="text-center">
                        <p className="font-black dark:text-white text-lg">Upload Photos</p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Add up to 10 photos</p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {images.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-lg hover:bg-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border dark:border-gray-800 space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Item Title</label>
                    <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="What are you selling?"
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none dark:text-white font-bold text-lg transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Price</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                            <input 
                                required
                                type="number" 
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                placeholder="₹0.00"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-white font-black text-xl transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Condition</label>
                        <select 
                            value={formData.condition}
                            onChange={e => setFormData({...formData, condition: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none dark:text-white font-bold transition-all appearance-none cursor-pointer"
                        >
                            <option>New</option>
                            <option>Like New</option>
                            <option>Good</option>
                            <option>Fair</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Category</label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-white font-bold transition-all appearance-none cursor-pointer"
                        >
                            <option>Electronics</option>
                            <option>Vehicles</option>
                            <option>Furniture</option>
                            <option>Clothing</option>
                            <option>Properties</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            required
                            type="text" 
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="City, Neighborhood, or Zip"
                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-white font-bold transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Description</label>
                    <textarea 
                        required
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the item, its condition, features..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none dark:text-white font-medium transition-all resize-none"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-[2rem] shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Listing Item...</span>
                    </>
                ) : 'Publish Listing'}
            </button>
        </form>
      </main>
    </div>
  )
}
