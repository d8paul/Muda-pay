"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { Bank } from "../types"

interface PaymentMethodsTableProps {
  banks: Bank[]
  isLoading: boolean
  isSubmitting: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onCreateFirst: () => void
}

export default function PaymentMethodsTable({
  banks,
  isLoading,
  isSubmitting,
  onEdit,
  onDelete,
  onCreateFirst
}: PaymentMethodsTableProps) {
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading payment methods...</span>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (banks.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <div className="text-gray-500">
              <p>No payment methods found</p>
              <Button 
                onClick={onCreateFirst} 
                variant="outline" 
                className="mt-4"
              >
                Add your first payment method
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    return banks.map((bank) => (
      <TableRow key={bank.id}>
        <TableCell className="font-medium">{bank.bank_name}</TableCell>
        <TableCell>{bank.account_name}</TableCell>
        <TableCell className="font-mono">{bank.account_number}</TableCell>
        <TableCell className="font-mono">{bank.swift_code}</TableCell>
        <TableCell>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {bank.country}
          </span>
        </TableCell>
        <TableCell>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            {bank.currency}
          </span>
        </TableCell>
        <TableCell className="font-mono text-sm">{bank.reference_code}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bank)}
              disabled={isSubmitting}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {/* <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(bank)}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4" />
            </Button> */}
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bank Name</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>SWIFT Code</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Reference Code</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>
    </div>
  )
}
