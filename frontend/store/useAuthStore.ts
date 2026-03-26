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

interface AuthState {
  user: User | null
  token: string | null
  appMode: AppMode
  activities: Activity[]
  setAuth: (user: User, token: string) => void
  setAppMode: (mode: AppMode) => void
  addActivity: (activity: Activity) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      appMode: 'user',
      activities: [],
      setAuth: (user, token) => set({ user, token }),
      setAppMode: (appMode) => set({ appMode }),
      addActivity: (activity) => set((state) => ({ 
          activities: [activity, ...state.activities].slice(0, 10) 
      })),
      logout: () => set({ user: null, token: null, appMode: 'user', activities: [] }),
    }),
    {
      name: 'super-app-auth',
    }
  )
)

export default useAuthStore
