"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

// Hardcoded pending deposits data
const pendingDeposits = [
  { id: 1, walletId: "W001", amount: 500000, narration: "Monthly deposit", depositReference: "DEP001" },
  { id: 2, walletId: "W002", amount: 750000, narration: "Quarterly deposit", depositReference: "DEP002" },
  { id: 3, walletId: "W003", amount: 1000000, narration: "Annual deposit", depositReference: "DEP003" },
]

export default function PendingDepositsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = (id: number) => {
    // Simulate API call for approval
    setIsLoading(true)
    setTimeout(() => {
      console.log("Approving deposit:", id)
      toast.success("Deposit approved successfully")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Deposits</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
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
          </div>
        </div>
      </div>
    </>
  )
}

