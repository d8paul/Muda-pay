"use client"

import type React from "react"

import { useState } from "react"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"

export default function AdminDepositPage() {
  const [clientId, setClientId] = useState("")
  const [amount, setAmount] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  
  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("Deposit successful")
      setClientId("")
      setAmount("")
    }
  })

  const isLoading = localLoading || twoFALoading

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientId || !amount) {
      toast.error("Client ID and amount are required")
      return
    }
    
    const depositData = {
      clientId,
      amount: Number.parseFloat(amount)
    }
    
    await requireTwoFactorAuth(depositData, submitDeposit)
  }

  const submitDeposit = async (data: { clientId: string, amount: number }, token?: string) => {
    setLocalLoading(true)
    try {
      // If token is provided, include it in the request
      const payload = token ? { ...data, token } : data
      await post("/admin/deposit", payload)
    } catch (error) {
      console.error("Deposit failed:", error)
      toast.error("Deposit failed")
      throw error
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Deposit</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <form onSubmit={handleDeposit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                  Client ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="clientId"
                    id="clientId"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (UGX)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      
    </>
  )
}

