"use client"

import { useState } from "react"
import { get } from "@/utils/api"
import toast from "react-hot-toast"

interface Use2FAOptions {
  onSuccess?: () => void
  onError?: (error: any) => void
  redirectOnMissing?: boolean
}

export function useTwoFactorAuth(options: Use2FAOptions = {}) {
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    callback: (token: string) => Promise<void>
    data: any
  } | null>(null)

  const requireTwoFactorAuth = async <T,>(data: T, callback: (data: T, token?: string) => Promise<void>) => {
    setIsLoading(true)
    try {
      // Check if 2FA is enabled for this user
      const response = await get("/admin/users/2fa/status")
      
      if (response.data.status === "active") {
        // Store the callback and data then show 2FA modal
        setPendingAction({
          callback: async (token) => {
            await callback(data, token)
          },
          data
        })
        setShow2FAModal(true)
      } else if (options.redirectOnMissing) {
        // 2FA is not enabled but required, redirect to settings
        toast.error("Please enable Two-Factor Authentication before proceeding")
        if (typeof window !== 'undefined') {
          window.location.href = "/admin/settings"
        }
        return false
      } else {
        // No 2FA required or enabled, proceed with action
        await callback(data)
        options.onSuccess?.()
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error)
      toast.error("Failed to authenticate")
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (token: string) => {
    if (!pendingAction) return
    
    setIsLoading(true)
    try {
      await pendingAction.callback(token)
      setShow2FAModal(false)
      setPendingAction(null)
      options.onSuccess?.()
    } catch (error: any) {
      console.error("2FA verification failed:", error)
      toast.error(error.message || "2FA verification failed")
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    show2FAModal,
    setShow2FAModal,
    isLoading,
    requireTwoFactorAuth,
    handle2FASubmit
  }
}
