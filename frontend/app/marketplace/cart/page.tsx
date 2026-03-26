'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, removeFromCart, placeOrder } from '@/services/apiServices'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Trash2, ChevronLeft, ShoppingBag, CreditCard, Truck } from 'lucide-react'
import { useState } from 'react'

export default function CartPage() {
  const { user, isReady } = useAuth()
  const queryClient = useQueryClient()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => getCart(user?.id || ''),
    enabled: !!user?.id
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  })

  const checkoutMutation = useMutation({
    mutationFn: (orderData: any) => placeOrder(orderData),
    onSuccess: () => {
      alert('Order placed successfully!')
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      window.location.href = '/marketplace/orders'
    }
  })

  const subtotal = cartItems?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0
  const shipping = subtotal > 0 ? 10 : 0
  const total = subtotal + shipping

  if (!isReady || isLoading) return <div className="p-8 text-center dark:text-white">Loading your cart...</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-6 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/marketplace" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Your Cart</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
            {!cartItems || cartItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[2rem] text-center space-y-4 border-2 border-dashed dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <ShoppingBag size={40} />
                    </div>
                    <h2 className="text-xl font-black dark:text-white">Your cart is empty</h2>
                    <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
                    <Link href="/marketplace" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest">Start Shopping</Link>
                </div>
            ) : (
                cartItems.map((item: any) => (
                    <div key={item._id} className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] flex gap-4 shadow-sm border dark:border-gray-800 items-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&q=80`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm dark:text-white truncate">Product ID: {item.productId}</h3>
                            <p className="text-blue-600 font-black text-lg">${item.price}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                        </div>
                        <button 
                            onClick={() => removeMutation.mutate(item._id)}
                            className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))
            )}
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border dark:border-gray-800 space-y-4">
                <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Order Summary</h2>
                <div className="space-y-2 border-b dark:border-gray-800 pb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold dark:text-white">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-bold dark:text-white">${shipping}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="font-black dark:text-white">Total</span>
                    <span className="text-2xl font-black text-blue-600">${total}</span>
                </div>
                <button 
                    disabled={!cartItems || cartItems.length === 0}
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                    Checkout
                </button>
            </div>

            {isCheckingOut && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl border-2 border-blue-500 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Payment Method</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex flex-col items-center gap-2 p-4 border-2 border-blue-500 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                            <CreditCard className="text-blue-600" />
                            <span className="text-[10px] font-black uppercase text-blue-600">Wallet</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl opacity-50 grayscale cursor-not-allowed">
                            <Truck />
                            <span className="text-[10px] font-black uppercase">COD</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => checkoutMutation.mutate({
                            userId: user?.id,
                            items: cartItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
                            totalAmount: total,
                            paymentMethod: 'wallet',
                            shippingAddress: { name: 'Krishna', addressLine1: '123 Main St' }
                        })}
                        className="w-full bg-black dark:bg-white dark:text-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Confirm Order
                    </button>
                </div>
            )}
        </div>
      </main>
    </div>
  )
}
