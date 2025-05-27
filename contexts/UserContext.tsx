"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { get } from "@/utils/api"

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  status: string
  deleted_at: string | null
  updated_at: string
  created_at: string
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  fetchUserProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get("/admin/users/profile")
      if (response.status === 201) {
        setUser(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch user profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 