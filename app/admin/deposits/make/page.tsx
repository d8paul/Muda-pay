"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

// Hardcoded wallet data
const wallets = [
  { id: "W001", clientName: "John Doe" },
  { id: "W002", clientName: "Jane Smith" },
  { id: "W003", clientName: "Bob Johnson" },
]

export default function MakeDepositPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    walletId: "",
    amount: "",
    narration: "",
    depositReference: "",
  })
  const [searchTerm, setSearchTerm] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Making deposit:", formData)
      toast.success("Deposit request submitted successfully")
      setFormData({
        walletId: "",
        amount: "",
        narration: "",
        depositReference: "",
      })
      setIsLoading(false)
    }, 1000)
  }

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <ProgressBar isLoading={isLoading} />
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
                  <Input
                    type="text"
                    name="walletId"
                    id="walletId"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for wallet ID or client name"
                    className="w-full"
                  />
                  {searchTerm && (
                    <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-auto">
                      {filteredWallets.map((wallet) => (
                        <li
                          key={wallet.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormData((prevData) => ({ ...prevData, walletId: wallet.id }))
                            setSearchTerm(`${wallet.id} - ${wallet.clientName}`)
                          }}
                        >
                          {wallet.id} - {wallet.clientName}
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Make Deposit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

