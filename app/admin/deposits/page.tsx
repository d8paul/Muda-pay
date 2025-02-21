"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

// Hardcoded wallet data
const wallets = [
  { id: "W001", clientName: "John Doe" },
  { id: "W002", clientName: "Jane Smith" },
  { id: "W003", clientName: "Bob Johnson" },
]

// Hardcoded pending deposits data
const pendingDeposits = [
  { id: 1, walletId: "W001", amount: 500000, narration: "Monthly deposit", depositReference: "DEP001" },
  { id: 2, walletId: "W002", amount: 750000, narration: "Quarterly deposit", depositReference: "DEP002" },
  { id: 3, walletId: "W003", amount: 1000000, narration: "Annual deposit", depositReference: "DEP003" },
]

export default function DepositsPage() {
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

  const handleApprove = (id: number) => {
    // Simulate API call for approval
    setIsLoading(true)
    setTimeout(() => {
      console.log("Approving deposit:", id)
      toast.success("Deposit approved successfully")
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
          <h1 className="text-2xl font-semibold text-gray-900">Deposits</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Tabs defaultValue="make-deposit" className="w-full">
              <TabsList>
                <TabsTrigger value="make-deposit">Make Deposit</TabsTrigger>
                <TabsTrigger value="pending-deposits">Pending Deposits</TabsTrigger>
              </TabsList>
              <TabsContent value="make-deposit">
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
              </TabsContent>
              <TabsContent value="pending-deposits">
                <div className="bg-white shadow sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet ID</TableHead>
                        <TableHead>Amount (UGX)</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead>Deposit Reference</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>{deposit.walletId}</TableCell>
                          <TableCell>{deposit.amount.toLocaleString()}</TableCell>
                          <TableCell>{deposit.narration}</TableCell>
                          <TableCell>{deposit.depositReference}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleApprove(deposit.id)}>Approve</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

