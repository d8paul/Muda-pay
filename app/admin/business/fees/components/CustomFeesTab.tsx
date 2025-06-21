"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { del, get, put, post } from "@/utils/api"

// Updated interface to match the actual API response
export interface CustomFee {
  product_id: number
  product_name: string
  product_code: string
  transaction_type: "PUSH" | "PULL"
  status: "active" | "inactive"
  currency: string
  provider_fee: string
  fee_type: "FLAT" | "PERCENTAGE"
  fee_amount: number
  requires_extra_data: 0 | 1
  created_at: string
  custom_fee: object
}

export interface Product {
  product_id: number
  product_name: string
  product_code: string
  transaction_type: string
  status: string
  currency: string
  fee_type: string
  fee_amount: number
  created_at: string
}

interface CustomFeesTabProps {
  clientId: string
  customFees: CustomFee[]
  products: Product[]
  isLoading: boolean
  onEditCustomFee: (fee: any) => void
  onDeleteCustomFee: (feeId: number) => void
  onRefreshFees: () => void
  onSwitchToAddTab: () => void
}

export default function CustomFeesTab({
  clientId,
  customFees,
  products,
  isLoading,
  onEditCustomFee,
  onDeleteCustomFee,
  onRefreshFees,
  onSwitchToAddTab
}: CustomFeesTabProps) {
  const [selectedFee, setSelectedFee] = useState<CustomFee | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFeeAmount = (fee: CustomFee) => {
    if (fee.fee_type === "PERCENTAGE") {
      return `${fee.fee_amount}%`
    } else {
      return `${fee.fee_amount} ${fee.currency}`
    }
  }

  const handleViewDetails = (fee: CustomFee) => {
    setSelectedFee(fee)
    setDetailsDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Business Custom Fees</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage custom fees for this business
          </p>
        </div>
        <Button onClick={onSwitchToAddTab}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Custom Fee
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-muted-foreground">Loading fees...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : customFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <p className="text-muted-foreground">No fees found</p>
                </TableCell>
              </TableRow>
            ) : (
              customFees.map((fee) => (
                <TableRow key={`${fee.product_id}-${fee.transaction_type}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{fee.product_name}</span>
                      <span className="text-xs text-gray-500">
                        Code: {fee.product_code} | ID: {fee.product_id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {fee.transaction_type.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{fee.currency}</TableCell>
                  <TableCell>{formatFeeAmount(fee)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={fee.status === "active" ? "default" : "secondary"}
                      className={
                        fee.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(fee.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(fee)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Fee Details</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-base">{selectedFee.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Code</label>
                  <p className="text-base">{selectedFee.product_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product ID</label>
                  <p className="text-base">{selectedFee.product_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="text-base">
                    <Badge variant="outline" className="capitalize">
                      {selectedFee.transaction_type.toLowerCase()}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-base">{selectedFee.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-base">
                    <Badge
                      variant={selectedFee.status === "active" ? "default" : "secondary"}
                      className={
                        selectedFee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedFee.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee Type</label>
                  <p className="text-base">{selectedFee.fee_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee Amount</label>
                  <p className="text-base">{formatFeeAmount(selectedFee)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider Fee</label>
                  <p className="text-base">{selectedFee.provider_fee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requires Extra Data</label>
                  <p className="text-base">
                    <Badge variant={selectedFee.requires_extra_data ? "destructive" : "secondary"}>
                      {selectedFee.requires_extra_data ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-base">{formatDate(selectedFee.created_at)}</p>
                </div>
              </div>
              
              {selectedFee.custom_fee && Object.keys(selectedFee.custom_fee).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Custom Fee Configuration</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <pre className="text-sm text-gray-700">
                      {JSON.stringify(selectedFee.custom_fee, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
