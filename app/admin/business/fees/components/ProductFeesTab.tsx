"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

export interface CompanyFee {
  product_id: number
  product_name: string
  product_code: string
  transaction_type: "PUSH" | "PULL"
  status: "active" | "inactive"
  currency: "UGX" | "USD" | "EUR"
  fee_type: "FLAT" | "PERCENTAGE"
  fee_amount: number
  created_at: string
  custom_fee: Record<string, any>
}

interface ProductFeesTabProps {
  fees: CompanyFee[]
  isLoading: boolean
  onEditFee: (fee: CompanyFee) => void
  onDeleteFee: (productId: number) => void
}

export default function ProductFeesTab({
  fees,
  isLoading,
  onEditFee,
  onDeleteFee
}: ProductFeesTabProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Product Name</TableHead>
            <TableHead>Product Code</TableHead>
            <TableHead>Transaction Type</TableHead>
            <TableHead>Fee Type</TableHead>
            <TableHead>Fee Amount</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                {isLoading ? (
                  <p className="text-muted-foreground">Loading fees...</p>
                ) : (
                  <p className="text-muted-foreground">No transaction fees found</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            fees.map((fee) => (
              <TableRow key={fee.product_id}>
                <TableCell className="font-medium">{fee.product_name}</TableCell>
                <TableCell>{fee.product_code}</TableCell>
                <TableCell className="capitalize">{fee.transaction_type}</TableCell>
                <TableCell className="capitalize">{fee.fee_type}</TableCell>
                <TableCell>
                  {fee.fee_type === "PERCENTAGE"
                    ? `${fee.fee_amount}%`
                    : `${fee.currency} ${formatCurrency(fee.fee_amount)}`}
                </TableCell>
                <TableCell>{fee.currency}</TableCell>
                <TableCell>
                  <Badge
                    variant={fee.status === "active" ? "default" : "secondary"}
                    className={
                      fee.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {fee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(fee.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditFee(fee)}
                      disabled={isLoading}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDeleteFee(fee.product_id)}
                      disabled={isLoading}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
