"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { del, get, put, post } from "@/utils/api"

export interface CustomFee {
  id: number
  fee_name: string
  product_id: string
  fee_type: "percentage" | "flat"
  percentage_value: number
  minimum_amount: string
  maximum_amount: string
  active_status: boolean
  created_at: string
  updated_at: string
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
  onEditCustomFee: (fee: CustomFee) => void
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Custom Business Fees</h3>
        <Button onClick={onSwitchToAddTab}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Custom Fee
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Amount</TableHead>
              <TableHead>Max Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-muted-foreground">Loading custom fees...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : customFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <p className="text-muted-foreground">No custom fees found</p>
                </TableCell>
              </TableRow>
            ) : (
              customFees.map((fee) => {
                // Find the product details for this fee
                const product = products.find(p => p.product_id.toString() === fee.product_id)
                
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.fee_name}</TableCell>
                    <TableCell>
                      {product ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{product.product_name}</span>
                          <span className="text-xs text-gray-500">
                            ID: {fee.product_id} | Code: {product.product_code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">ID: {fee.product_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{fee.fee_type}</TableCell>
                    <TableCell>
                      {fee.fee_type === "percentage" 
                        ? `${fee.percentage_value}%` 
                        : `${fee.percentage_value}`}
                    </TableCell>
                    <TableCell>{fee.minimum_amount}</TableCell>
                    <TableCell>{fee.maximum_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.active_status ? "default" : "secondary"}
                        className={
                          fee.active_status
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {fee.active_status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(fee.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditCustomFee(fee)}
                          disabled={isLoading}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => onDeleteCustomFee(fee.id)}
                          disabled={isLoading}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
