"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { get } from '@/utils/api'

export type AccessRight = {
  id: string
  name: string
  description: string
  module: string
  status: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export type RoleDetails = {
  id: string
  name: string
  details: string
  status: string
  access_rights: AccessRight[]
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  role_details: RoleDetails
  status: string
  updated_at: string
  created_at: string
}

type UserContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  fetchUserProfile: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await get('/admin/users/profile')
      console.log("User profile response:", response)
      
      // Handle different response formats from enhanced API utility
      if (Array.isArray(response)) {
        // Direct array response
        setUser(response[0] || null)
      } else if (response && typeof response === 'object') {
        if (response.status === 200 || response.status === 201) {
          // Wrapped response with status
          setUser(response.data)
        } else if (response.id) {
          // Direct user object response
          setUser(response)
        } else {
          console.log("Unexpected response format:", response)
          setUser(null)
        }
      } else {
        console.log("Unexpected response type:", typeof response)
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, setUser, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 