'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, MapPin, IndianRupee, Tag, CheckCircle2, X, Sparkles, Image as ImageIcon } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/services/apiServices'
import clsx from 'clsx'

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
          <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--syn-string)]/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="w-28 h-28 bg-gradient-to-br from-[var(--syn-string)] to-emerald-400 text-white rounded-full flex items-center justify-center mb-8 animate-scale-in shadow-2xl shadow-emerald-500/30">
                  <CheckCircle2 size={56} className="animate-float" />
              </div>
              <h1 className="text-4xl font-black text-[var(--text-primary)] mb-3 tracking-tight animate-slide-up">Item Listed!</h1>
              <p className="text-[var(--syn-comment)] font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>Redirecting to marketplace...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24 relative selection:bg-[var(--syn-function)]/30">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[var(--syn-function)]/5 to-transparent pointer-events-none" />

      <header className="glass border-b border-[var(--bg-elevated)] p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--syn-function)]/10 text-[var(--syn-comment)] hover:text-[var(--syn-function)] active:scale-90 rounded-2xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Sell an Item</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
            
            {/* Image Upload Area */}
            <div className="space-y-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative bg-[var(--bg-card)] border-2 border-dashed border-[var(--syn-function)]/20 hover:border-[var(--syn-function)] rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer group shadow-sm overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--syn-function)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                    />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-[var(--syn-function)] to-blue-400 text-white rounded-3xl flex items-center justify-center group-hover:scale-110 shadow-lg shadow-blue-500/25 transition-all duration-300">
                        <ImageIcon size={32} />
                        <div className="absolute -top-2 -right-2 bg-white text-[var(--syn-function)] rounded-full p-1 shadow-md">
                            <Sparkles size={14} />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-black text-xl text-[var(--text-primary)]">Upload Showcase Photos</p>
                        <p className="text-[10px] text-[var(--syn-comment)] font-black uppercase tracking-[0.2em]">Add up to 10 photos • Max 5MB</p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 animate-scale-in">
                        {images.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-[var(--bg-elevated)] shadow-md group">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl scale-0 group-hover:scale-100 hover:bg-red-600 shadow-lg transition-all duration-200"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5 border border-gray-200/20 dark:border-gray-800/50 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--syn-keyword)]/5 rounded-full blur-[80px]" />
                
                {/* Title */}
                <div className="relative group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--syn-keyword)] uppercase tracking-[0.2em] mb-3 ml-2">
                        <Sparkles size={12} /> Product Title
                    </label>
                    <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. MacBook Pro M3 Max"
                        className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-keyword)] rounded-3xl p-5 outline-none text-[var(--text-primary)] font-black text-xl placeholder:text-[var(--text-muted)] transition-all shadow-inner focus:shadow-md focus:shadow-[var(--syn-keyword)]/10"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Price */}
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-[var(--syn-variable)] uppercase tracking-[0.2em] mb-3 ml-2">Asking Price</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--syn-variable)]/10 text-[var(--syn-variable)] rounded-xl flex items-center justify-center">
                                <IndianRupee size={16} strokeWidth={3} />
                            </div>
                            <input 
                                required
                                type="number" 
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                placeholder="0.00"
                                className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-variable)] rounded-3xl py-5 pl-16 pr-5 outline-none text-[var(--text-primary)] font-black text-xl placeholder:text-[var(--text-muted)] transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Condition */}
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-[var(--syn-type)] uppercase tracking-[0.2em] mb-3 ml-2">Item Condition</label>
                        <select 
                            value={formData.condition}
                            onChange={e => setFormData({...formData, condition: e.target.value})}
                            className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-type)] rounded-3xl p-5 outline-none text-[var(--text-primary)] font-black text-[15px] transition-all appearance-none cursor-pointer shadow-inner"
                        >
                            <option>Brand New • Sealed</option>
                            <option>Like New • Open Box</option>
                            <option>Good • Minor Wear</option>
                            <option>Fair • Visible Wear</option>
                        </select>
                        <div className="absolute right-5 bottom-[1.1rem] pointer-events-none text-[var(--syn-comment)] font-black">
                            <Tag size={20} />
                        </div>
                    </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-[var(--syn-function)] uppercase tracking-[0.2em] mb-3 ml-2">Market Category</label>
                        <select 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-function)] rounded-3xl p-5 outline-none text-[var(--text-primary)] font-black transition-all appearance-none cursor-pointer shadow-inner"
                        >
                            <option>Electronics</option>
                            <option>Vehicles</option>
                            <option>Furniture</option>
                            <option>Fashion & Clothing</option>
                            <option>Real Estate</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <label className="block text-[10px] font-black text-[var(--syn-string)] uppercase tracking-[0.2em] mb-3 ml-2">Pickup Location</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--syn-string)]/10 text-[var(--syn-string)] rounded-xl flex items-center justify-center">
                                <MapPin size={16} strokeWidth={3} />
                            </div>
                            <input 
                                required
                                type="text" 
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                placeholder="City or Neighborhood"
                                className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-string)] rounded-3xl py-5 pl-16 pr-5 outline-none text-[var(--text-primary)] font-bold placeholder:text-[var(--text-muted)] transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="relative group">
                    <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-2">Detailed Description</label>
                    <textarea 
                        required
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Share the story behind this item, its features, and any flaws..."
                        className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-elevated)] focus:border-[var(--syn-decorator)] rounded-3xl p-5 outline-none text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] transition-all resize-none shadow-inner"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-white font-black text-lg py-5 rounded-[2.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-[var(--syn-keyword)]/30 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3 uppercase tracking-widest group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                        <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Publishing Listing...</span>
                        </>
                    ) : '🚀 Publish to Marketplace'}
                </span>
            </button>
        </form>
      </main>
    </div>
  )
}
