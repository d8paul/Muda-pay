"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlusIcon, 
  PencilIcon, 
  MagnifyingGlassIcon,
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { del } from "@/utils/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProviderFee {
  id: string
  provider_id: string
  currency: string
  transaction_type: "PUSH" | "PULL" | "BOTH"
  fee_type: "FLAT" | "PERCENTAGE"
  fee_value: number
  minimum_amount?: number
  maximum_amount?: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

interface ProviderFeesTabProps {
  providerId: string
  providerName: string
  fees: ProviderFee[]
  supportedCurrencies: string[]
  isLoading: boolean
  onCreateFee: () => void
  onEditFee: (fee: ProviderFee) => void
  onRefreshFees: () => void
}

export default function ProviderFeesTab({
  providerId,
  providerName,
  fees,
  supportedCurrencies,
  isLoading,
  onCreateFee,
  onEditFee,
  onRefreshFees
}: ProviderFeesTabProps) {
  const [filter, setFilter] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<ProviderFee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.currency.toLowerCase().includes(filter.toLowerCase()) ||
                         fee.transaction_type.toLowerCase().includes(filter.toLowerCase())
    const matchesCurrency = currencyFilter === "all" || fee.currency === currencyFilter
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter
    const matchesType = typeFilter === "all" || fee.transaction_type === typeFilter

    return matchesSearch && matchesCurrency && matchesStatus && matchesType
  })

  const handleDeleteClick = (fee: ProviderFee) => {
    setFeeToDelete(fee)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!feeToDelete) return

    setIsDeleting(true)
    try {
      const response = await del(`/admin/providers/${providerId}/fees/${feeToDelete.id}`)
      
      if (response.status === 200) {
        toast.success("Provider fee deleted successfully")
        onRefreshFees()
      } else {
        toast.error("Failed to delete provider fee")
      }
    } catch (error) {
      console.error("Error deleting provider fee:", error)
      toast.error("Failed to delete provider fee")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setFeeToDelete(null)
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const uniqueCurrencies = [...new Set(fees.map(fee => fee.currency))]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                {providerName}'s Fee Structure
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Active fee configurations for this provider
              </p>
            </div>
            {/* Commented out - Create fees functionality disabled for now */}
            {/* <Button onClick={onCreateFee}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search fees..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {uniqueCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PUSH">PUSH</SelectItem>
                <SelectItem value="PULL">PULL</SelectItem>
                <SelectItem value="BOTH">BOTH</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fees Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Fee Value</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-muted-foreground">Loading fees...</span>
                        </div>
                      ) : filter || currencyFilter !== "all" || statusFilter !== "all" || typeFilter !== "all" ? (
                        <p className="text-muted-foreground">No fees found matching your filters.</p>
                      ) : (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2">No fees configured for this provider</p>
                          {/* Commented out - Create fees functionality disabled for now */}
                          {/* <Button variant="outline" onClick={onCreateFee}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create First Fee
                          </Button> */}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{fee.currency}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{fee.transaction_type}</TableCell>
                      <TableCell className="capitalize">{fee.fee_type.toLowerCase()}</TableCell>
                      <TableCell>
                        {fee.fee_type === "PERCENTAGE"
                          ? `${fee.fee_value}%`
                          : `${fee.currency} ${formatCurrency(fee.fee_value)}`}
                      </TableCell>
                      <TableCell>
                        {fee.minimum_amount 
                          ? `${fee.currency} ${formatCurrency(fee.minimum_amount)}`
                          : "No minimum"}
                      </TableCell>
                      <TableCell>
                        {fee.maximum_amount 
                          ? `${fee.currency} ${formatCurrency(fee.maximum_amount)}`
                          : "No maximum"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(fee.status)}>
                          {fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(fee.updated_at)}</TableCell>
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
                            onClick={() => handleDeleteClick(fee)}
                            disabled={isLoading || isDeleting}
                          >
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this provider fee? This action cannot be undone.
              {feeToDelete && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <strong>Fee Details:</strong>
                  <br />
                  Currency: {feeToDelete.currency}
                  <br />
                  Type: {feeToDelete.transaction_type}
                  <br />
                  Value: {feeToDelete.fee_type === "PERCENTAGE" 
                    ? `${feeToDelete.fee_value}%` 
                    : `${feeToDelete.currency} ${formatCurrency(feeToDelete.fee_value)}`}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
