"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
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
      setSearchTerm("")
      setShowDropdown(false)
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
      if (searchTerm.trim() === "") {
        setFilteredClients([])
        setShowDropdown(false)
        return
      }

      setLocalLoading(true)
      try {
        const response = await get(`/admin/clients/${searchTerm}`)
        if (response.status === 200) {
          setClients([response.data])
          setFilteredClients([response.data])
          setShowDropdown(true)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
        setShowDropdown(false)
      } finally {
        setLocalLoading(false)
      }
    }

    // Debounce search to avoid unnecessary API calls
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchClients();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const depositData = {
      clientId: formData.walletId,
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
                <div className="mt-1 relative">
                  <div className="relative">
                    <Input
                      type="text"
                      name="walletId"
                      id="walletId"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for wallet ID or client name"
                      className={`w-full ${localLoading ? 'pr-10' : ''}`}
                      disabled={localLoading}
                    />
                    {localLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className="h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {showDropdown && filteredClients.length > 0 && (
                    <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto absolute z-10 bg-white w-full">
                      {filteredClients.map((client) => (
                        <li
                          key={client.client_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormData((prevData) => ({ ...prevData, walletId: client.client_id }))
                            setSearchTerm(`${client.client_id} - ${client.business_name}`)
                            setShowDropdown(false)
                          }}
                        >
                          {client.client_id} - {client.business_name}
                        </li>
                      ))}
                    </ul>
                  )}
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