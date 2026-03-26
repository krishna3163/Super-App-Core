import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email?: string
  name?: string
  avatar?: string
}

type AppMode = 'user' | 'business'

interface Activity {
    id: string
    type: 'ride' | 'food' | 'purchase'
    title: string
    status: string
    time: string
    image?: string
}

type BusinessType = 'rider' | 'hotel_manager' | 'freelancer' | 'restaurant_manager' | 'product_seller' | 'other'

interface AuthState {
  user: User | null
  token: string | null
  appMode: AppMode
  businessType: BusinessType
  activities: Activity[]
  setAuth: (user: User, token: string) => void
  setAppMode: (mode: AppMode) => void
  setBusinessType: (type: BusinessType) => void
  addActivity: (activity: Activity) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      appMode: 'user',
      businessType: 'product_seller',
      activities: [],
      setAuth: (user, token) => set({ user, token }),
      setAppMode: (appMode) => set({ appMode }),
      setBusinessType: (businessType) => set({ businessType }),
      addActivity: (activity) => set((state) => ({ 
          activities: [activity, ...state.activities].slice(0, 10) 
      })),
      logout: () => set({ user: null, token: null, appMode: 'user', businessType: 'product_seller', activities: [] }),
    }),
    {
      name: 'super-app-auth',
    }
  )
)

export default useAuthStore
