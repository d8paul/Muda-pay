"use client"

import { useState, useEffect } from "react"
import { get, post, put, del } from "@/utils/api"
import toast from "react-hot-toast"
import { Bank, BankFormData, initialFormData } from "../types"

export function usePaymentMethods() {
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])

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
    await post("/admin/banks", formData)
    toast.success("Payment method created successfully")
    await fetchBanks()
  }

  const updateBank = async (id: number, formData: BankFormData) => {
    await put(`/admin/banks/${id}`, formData)
    toast.success("Payment method updated successfully")
    await fetchBanks()
  }

  const deleteBank = async (id: number) => {
    await del(`/admin/banks/${id}`)
    toast.success("Payment method deleted successfully")
    await fetchBanks()
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  return {
    isLoading,
    banks,
    fetchBanks,
    createBank,
    updateBank,
    deleteBank
  }
}
