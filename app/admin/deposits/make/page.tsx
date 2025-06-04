"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { get, post } from "@/utils/api"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

interface Client {
  client_id: string
  business_name: string
}

export default function MakeDepositPage() {
  const [localLoading, setLocalLoading] = useState(false)
  const [formData, setFormData] = useState({
    walletId: "",
    amount: "",
    narration: "",
    depositReference: "",
  })
  const [clients, setClients] = useState<Client[]>([])
  const [twoFactorStatus, setTwoFactorStatus] = useState<string | null>(null)
  
  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("Deposit request submitted successfully")
      setFormData({
        walletId: "",
        amount: "",
        narration: "",
        depositReference: "",
      })
    },
    redirectOnMissing: true
  })
  
  const isLoading = localLoading || twoFALoading

  useEffect(() => {
    // Check 2FA status on page load
    const checkTwoFactorStatus = async () => {
      try {
        const response = await get("/admin/users/2fa/status")
        setTwoFactorStatus(response.data.status)
        
        if (response.data.status !== "active") {
          toast.error("Please enable Two-Factor Authentication before proceeding")
          window.location.href = "/admin/settings"
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error)
      }
    }
    
    checkTwoFactorStatus()
  }, [])

  useEffect(() => {
    const fetchClients = async () => {
      setLocalLoading(true)
      try {
        const response = await get("/admin/clients")
        if (response.status === 200) {
          setClients(response.data)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast.error("Failed to load clients")
      } finally {
        setLocalLoading(false)
      }
    }

    fetchClients()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleWalletIdChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      walletId: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const depositData = {
      client_id: formData.walletId,
      amount: parseFloat(formData.amount),
      currency: "UGX",
      product_id: "10000",
      account_number: formData.depositReference,
      reference_id: formData.depositReference,
      public_key: "GBPREREREREOOPOPOOREOPREOREOPROPROEROP",
      narration: formData.narration
    }
    
    await requireTwoFactorAuth(depositData, makeDeposit)
  }
  
  const makeDeposit = async (data: any, token?: string) => {
    setLocalLoading(true)
    try {
      // Add token to payload if provided
      const payload = token ? { ...data, token } : data
      
      const response = await post("/admin/depositRequest", payload)
      if (response.status !== 200) {
        throw new Error("Failed to submit deposit request")
      }
    } catch (error) {
      console.error("Error submitting deposit request:", error)
      toast.error("Failed to submit deposit request")
      throw error
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={twoFALoading} />
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Make Deposit</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div>
                <Label htmlFor="walletId">Wallet ID</Label>
                <div className="mt-1">
                  <Select
                    value={formData.walletId}
                    onValueChange={handleWalletIdChange}
                    disabled={localLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.client_id} value={client.client_id}>
                          {client.client_id} - {client.business_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount (UGX)</Label>
                <div className="mt-1">
                  <Input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="narration">Narration</Label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="narration"
                    id="narration"
                    value={formData.narration}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="depositReference">Deposit Reference</Label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="depositReference"
                    id="depositReference"
                    value={formData.depositReference}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  disabled={localLoading || twoFALoading}
                >
                  {(localLoading || twoFALoading) ? "Processing..." : "Make Deposit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}