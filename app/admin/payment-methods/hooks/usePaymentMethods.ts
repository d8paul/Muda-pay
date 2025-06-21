"use client"

import { useState, useEffect } from "react"
import { get, post, put, del } from "@/utils/api"
import toast from "react-hot-toast"
import { Bank, BankFormData, initialFormData } from "../types"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"

export function usePaymentMethods() {
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  
  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      // This fires when 2FA is successful - refresh data and show success
      fetchBanks()
    },
    redirectOnMissing: false
  })

  const fetchBanks = async () => {
    setIsLoading(true)
    try {
      const response = await get("/admin/banks")
      console.log("Banks response:", response)
      
      if (response) {
        if (Array.isArray(response)) {
          setBanks(response)
        } else if (response.data && Array.isArray(response.data)) {
          setBanks(response.data)
        } else {
          setBanks([])
        }
      } else {
        setBanks([])
      }
    } catch (error) {
      console.error("Error fetching banks:", error)
      toast.error("Failed to fetch payment methods")
      setBanks([])
    } finally {
      setIsLoading(false)
    }
  }

  const createBank = async (formData: BankFormData) => {
    await requireTwoFactorAuth(formData, performCreateBank)
  }

  const performCreateBank = async (data: any, token?: string) => {
    try {
      const payload = token ? { ...data, token } : data
      
      await post("/admin/banks", payload)
      toast.success("Payment method created successfully")
    } catch (error) {
      console.error("Error creating bank:", error)
      toast.error("Failed to create payment method")
      throw error
    }
  }

  const updateBank = async (id: number, formData: BankFormData) => {
    const updateData = { id, ...formData }
    await requireTwoFactorAuth(updateData, performUpdateBank)
  }

  const performUpdateBank = async (data: any, token?: string) => {
    try {
      const { id, ...formData } = data
      const payload = token ? { ...formData, token } : formData
      
      await put(`/admin/banks/${id}`, payload)
      toast.success("Payment method updated successfully")
    } catch (error) {
      console.error("Error updating bank:", error)
      toast.error("Failed to update payment method")
      throw error
    }
  }

  const deleteBank = async (id: number) => {
    try {
      await del(`/admin/banks/${id}`)
      await fetchBanks() // Reload the data first
      toast.success("Payment method deleted successfully") // Then show notification
    } catch (error) {
      console.error("Error deleting bank:", error)
      toast.error("Failed to delete payment method")
      throw error
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  return {
    isLoading: isLoading || twoFALoading,
    banks,
    fetchBanks,
    createBank,
    updateBank,
    deleteBank,
    show2FAModal,
    setShow2FAModal,
    handle2FASubmit,
    twoFALoading
  }
}
