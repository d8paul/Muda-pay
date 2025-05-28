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
  two_factor_enabled: boolean
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  fetchUserProfile: () => Promise<void>
  checkTwoFactorStatus: () => Promise<boolean>
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

  const checkTwoFactorStatus = async (): Promise<boolean> => {
    try {
      const response = await get("/admin/users/2fa/status")
      console.log("2FA status response:", response)
      if (response.status === 201) {
        return response.data.status === "active"
      }
      return false
    } catch (err) {
      console.error("Error checking 2FA status:", err)
      return false
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
    <UserContext.Provider value={{ user, loading, error, fetchUserProfile, checkTwoFactorStatus }}>
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