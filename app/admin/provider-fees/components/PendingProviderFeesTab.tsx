"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  EyeIcon, 
  ClockIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import { post } from "@/utils/api"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

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

interface PendingProviderFee {
  id: string
  provider_id: string
  entry_type: "CREATE" | "UPDATE" | "DELETE"
  status: "pending" | "approved" | "rejected"
  reason?: string
  original_fee_id?: string
  data_content: ProviderFee
  maker_id: string
  checker_id?: string
  created_at: string
  approved_at?: string
}

interface PendingProviderFeesTabProps {
  providerId: string
  pendingFees: PendingProviderFee[]
  isLoading: boolean
  onRefreshFees: () => void
  onFeeApproved?: () => void
}

export default function PendingProviderFeesTab({
  providerId,
  pendingFees,
  isLoading,
  onRefreshFees,
  onFeeApproved
}: PendingProviderFeesTabProps) {
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [entryTypeFilter, setEntryTypeFilter] = useState("all")
  const [selectedPendingFee, setSelectedPendingFee] = useState<PendingProviderFee | null>(null)
  const [approvalReason, setApprovalReason] = useState("")
  const [processingApproval, setProcessingApproval] = useState(false)

  // Initialize 2FA hook
  const { 
    show2FAModal, 
    setShow2FAModal, 
    isLoading: is2FALoading, 
    requireTwoFactorAuth, 
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      // Success is handled in performApprovalAction
    },
    onError: (error) => {
      // Error is handled in performApprovalAction
    }
  })

  const filteredPendingFees = pendingFees.filter(fee => {
    const matchesSearch = fee.data_content.currency.toLowerCase().includes(filter.toLowerCase()) ||
                         fee.data_content.transaction_type.toLowerCase().includes(filter.toLowerCase()) ||
                         fee.entry_type.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter
    const matchesEntryType = entryTypeFilter === "all" || fee.entry_type === entryTypeFilter

    return matchesSearch && matchesStatus && matchesEntryType
  })

  // Handle approval/rejection of pending fees
  const handleApprovalAction = async (feeId: string, status: "approved" | "rejected", reason?: string) => {
    const payload = { 
      feeId,
      status,
      reason: reason || undefined
    }

    // Use 2FA flow for fee approval/rejection
    try {
      await requireTwoFactorAuth(payload, performApprovalAction)
    } catch (error) {
      console.error("Error in 2FA flow:", error)
    }
  }

  // Perform the actual approval/rejection
  const performApprovalAction = async (payload: any, token?: string) => {
    setProcessingApproval(true)
    try {
      const response = await post(`/admin/providers/${providerId}/fees/approve`, payload)
      
      if (response.status === 200) {
        toast.success(`Provider fee ${payload.status} successfully`)
        onRefreshFees()
        setSelectedPendingFee(null)
        setApprovalReason("")
        
        // Call approval callback if fee was approved
        if (payload.status === 'approved' && onFeeApproved) {
          onFeeApproved()
        }
      } else {
        throw new Error(response.message || `Failed to ${payload.status} fee`)
      }
    } catch (error) {
      console.error(`Error ${payload.status === 'approved' ? 'approving' : 'rejecting'} fee:`, error)
      toast.error(`Failed to ${payload.status === 'approved' ? 'approve' : 'reject'} fee`)
      throw error // Important to throw the error so the hook can handle it
    } finally {
      setProcessingApproval(false)
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
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEntryTypeBadgeColor = (entryType: string) => {
    switch (entryType) {
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
        return "bg-purple-100 text-purple-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Pending Provider Fee Changes
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Review and approve/reject pending fee changes
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onRefreshFees}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search pending fees..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pending Fees Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Fee Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPendingFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-muted-foreground">Loading pending fees...</span>
                        </div>
                      ) : filter || statusFilter !== "all" || entryTypeFilter !== "all" ? (
                        <p className="text-muted-foreground">No pending fees found matching your filters.</p>
                      ) : (
                        <p className="text-muted-foreground">No pending fee changes for this provider.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPendingFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <Badge className={getEntryTypeBadgeColor(fee.entry_type)}>
                          {fee.entry_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{fee.data_content.currency}</Badge>
                      </TableCell>
                      <TableCell>{fee.data_content.transaction_type}</TableCell>
                      <TableCell className="capitalize">{fee.data_content.fee_type.toLowerCase()}</TableCell>
                      <TableCell>
                        {fee.data_content.fee_type === "PERCENTAGE"
                          ? `${fee.data_content.fee_value}%`
                          : `${fee.data_content.currency} ${formatCurrency(fee.data_content.fee_value)}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(fee.status)}>
                          {fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(fee.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPendingFee(fee)
                              setApprovalReason("")
                            }}
                            disabled={processingApproval || is2FALoading}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          {fee.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleApprovalAction(fee.id, "approved")}
                                disabled={processingApproval || is2FALoading}
                              >
                                {(processingApproval || is2FALoading) ? "Processing..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline" 
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleApprovalAction(fee.id, "rejected")}
                                disabled={processingApproval || is2FALoading}
                              >
                                {(processingApproval || is2FALoading) ? "Processing..." : "Reject"}
                              </Button>
                            </>
                          )}
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

      {/* Fee Preview & Approval Card */}
      {selectedPendingFee && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Fee Preview & Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Action Type</Label>
                <p className="text-sm font-medium">
                  <Badge className={getEntryTypeBadgeColor(selectedPendingFee.entry_type)}>
                    {selectedPendingFee.entry_type}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Currency</Label>
                <p className="text-sm font-medium">{selectedPendingFee.data_content.currency}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Transaction Type</Label>
                <p className="text-sm">{selectedPendingFee.data_content.transaction_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Fee Type</Label>
                <p className="text-sm capitalize">{selectedPendingFee.data_content.fee_type.toLowerCase()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Fee Value</Label>
                <p className="text-sm">
                  {selectedPendingFee.data_content.fee_type === "PERCENTAGE" 
                    ? `${selectedPendingFee.data_content.fee_value}%` 
                    : `${selectedPendingFee.data_content.currency} ${formatCurrency(selectedPendingFee.data_content.fee_value)}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Minimum Amount</Label>
                <p className="text-sm">
                  {selectedPendingFee.data_content.minimum_amount 
                    ? `${selectedPendingFee.data_content.currency} ${formatCurrency(selectedPendingFee.data_content.minimum_amount)}`
                    : "No minimum"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Maximum Amount</Label>
                <p className="text-sm">
                  {selectedPendingFee.data_content.maximum_amount 
                    ? `${selectedPendingFee.data_content.currency} ${formatCurrency(selectedPendingFee.data_content.maximum_amount)}`
                    : "No maximum"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge className={getStatusBadgeColor(selectedPendingFee.status)}>
                  {selectedPendingFee.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Created At</Label>
                <p className="text-sm">{formatDate(selectedPendingFee.created_at)}</p>
              </div>
            </div>

            {selectedPendingFee.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approval_reason">Reason (optional)</Label>
                  <Input
                    id="approval_reason"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder="Enter reason for approval/rejection (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPendingFee(null)
                      setApprovalReason("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleApprovalAction(selectedPendingFee.id, "approved", approvalReason || undefined)}
                    disabled={processingApproval || is2FALoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {(processingApproval || is2FALoading) ? "Processing..." : "Approve Fee"}
                  </Button>
                  <Button
                    onClick={() => handleApprovalAction(selectedPendingFee.id, "rejected", approvalReason || undefined)}
                    variant="destructive"
                    disabled={processingApproval || is2FALoading}
                  >
                    {(processingApproval || is2FALoading) ? "Processing..." : "Reject Fee"}
                  </Button>
                </div>
              </div>
            )}

            {selectedPendingFee.status !== "pending" && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPendingFee(null)
                    setApprovalReason("")
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2FA Dialog */}
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={is2FALoading}
      />
    </>
  )
}
