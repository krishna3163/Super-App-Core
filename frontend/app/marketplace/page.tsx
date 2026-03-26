'use client'

import { useQuery } from '@tanstack/react-query'
import { getMarketplaceProducts } from '@/services/apiServices'
import Link from 'next/link'
import { Search, Filter, MapPin, Plus, ShoppingCart, Package } from 'lucide-react'

// Dummy Data Fallback
export default function MarketplacePage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['marketplace-products'],
    queryFn: async () => {
        const data = await getMarketplaceProducts()
        return data || []
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-6 z-20">
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black dark:text-white tracking-tight">Marketplace</h1>
                <div className="flex items-center gap-4">
                    <Link href="/marketplace/orders" className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 hover:scale-110 transition-transform relative">
                        <Package size={22} />
                    </Link>
                    <Link href="/marketplace/cart" className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 hover:scale-110 transition-transform relative">
                        <ShoppingCart size={22} />
                    </Link>
                    <Link href="/marketplace/sell" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95">
                        <Plus size={18} />
                        Sell Item
                    </Link>
                </div>
            </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search for items, categories..." 
                className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] py-3 pl-12 pr-4 outline-none dark:text-white transition-all"
              />
            </div>
            <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 hover:scale-105 transition-transform">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {['All', 'Electronics', 'Vehicles', 'Furniture', 'Clothing', 'Properties'].map(cat => (
                <button key={cat} className="px-6 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest text-gray-500 hover:border-blue-500/30 transition-colors">
                    {cat}
                </button>
            ))}
        </div>

        <h2 className="text-xl font-black dark:text-white">Recommended for you</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-white dark:bg-gray-800 animate-pulse rounded-[2rem] border dark:border-gray-800"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link 
                href={`/marketplace/${product._id}`} 
                key={product._id}
                className="bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-transparent hover:border-blue-500/30 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md dark:text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-5 space-y-1">
                  <h3 className="font-black text-sm dark:text-white truncate group-hover:text-blue-600 transition-colors">{product.title}</h3>
                  <p className="text-blue-600 font-black text-lg">${product.price}</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-2">
                    <MapPin size={12} />
                    <span className="truncate">{product.location?.address || 'Local Pick-up'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
            <div className="p-20 text-center space-y-4">
                <ShoppingCart size={64} className="mx-auto text-gray-300" />
                <p className="text-gray-500 font-bold">No products found in the marketplace.</p>
                <Link href="/marketplace/sell" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-black">Sell Something</Link>
            </div>
        )}
      </main>
    </div>
  )
}
