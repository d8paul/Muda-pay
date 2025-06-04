"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { get } from '@/utils/api'

export type Permission = 
  | 'Create New account'
  | 'Add Float'
  | 'Maker'
  | 'Checker'
  | 'Changing rates'
  | 'Add Business Account'
  | 'Add Admin Account'

export type RoleDetails = {
  id: number | null
  name: string | null
  details: string | null
  status: string | null
  access_rights: string[]
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
  setUser: (user: User | null) => void
  fetchUserProfile: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const fetchUserProfile = async () => {
    try {
      const response = await get('/admin/users/profile')
      console.log("User profile response:", response)
      if (response.status === 201) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, fetchUserProfile }}>
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