"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { del, get, put, post } from "@/utils/api"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

export interface PendingFee {
  id: string
  maker_id: string
  checker_id: string | null
  entry_type: string
  status: "pending" | "approved" | "rejected"
  reason: string | null
  data_content: {
    id: string
    client_id: string
    fee_name: string
    product_id: string
    fee_type: "percentage" | "flat"
    percentage_value: number
    minimum_amount: string
    maximum_amount: string
    active_status: boolean
  }
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
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

interface PendingFeesTabProps {
  businessId: string
  products: Product[]
}

export default function PendingFeesTab({ businessId, products }: PendingFeesTabProps) {
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([])
  const [loadingPendingFees, setLoadingPendingFees] = useState(false)
  const [selectedPendingFee, setSelectedPendingFee] = useState<PendingFee | null>(null)
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

  // Fetch pending fees for the selected business
  const fetchPendingFees = async () => {
    try {
      setLoadingPendingFees(true)
      const response = await get(`/admin/business/fees/pending`)
      
      if (response && response.status === 200 && response.data) {
        setPendingFees(response.data)
      } else {
        setPendingFees([])
      }
    } catch (error) {
      console.error('Error fetching pending fees:', error)
      setPendingFees([])
    } finally {
      setLoadingPendingFees(false)
    }
  }

  // Handle approval/rejection of pending fees
  const handleApprovalAction = async (feeId: string, status: "approved" | "rejected", reason?: string) => {
    // Prepare the payload for the API
    const payload: any = { 
      feeId,
      status,
      reason: reason || undefined
    }

    // Use 2FA flow for fee approval/rejection
    await requireTwoFactorAuth(payload, performApprovalAction)
  }

  // Function that performs the actual approval action (called after 2FA verification)
  const performApprovalAction = async (data: any, token?: string) => {
    const { feeId, status, reason } = data
    
    setProcessingApproval(true)
    try {
      const payload: any = { status }
      if (reason) {
        payload.reason = reason
      }
      // Include 2FA token in payload if provided
      if (token) {
        payload.token = token
      }

      await put(`/admin/business/fees/${feeId}/add/approve`, payload)
      
      toast.success(`Fee ${status} successfully`)
      
      // Refresh pending fees
      await fetchPendingFees()
      
      // Close any open dialogs
      setSelectedPendingFee(null)
      setApprovalReason("")
    } catch (error) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} fee:`, error)
      toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} fee`)
      throw error // Important to throw the error so the hook can handle it
    } finally {
      setProcessingApproval(false)
    }
  }

  // Load pending fees when component mounts
  useEffect(() => {
    fetchPendingFees()
  }, [])

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
        <div>
          <h3 className="text-lg font-medium">Pending Business Fees</h3>
          <p className="text-sm text-gray-500">Review and approve/reject pending fee requests</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchPendingFees}
          disabled={loadingPendingFees}
        >
          {loadingPendingFees ? "Refreshing..." : "Refresh"}
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
            {loadingPendingFees ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-muted-foreground">Loading pending fees...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : pendingFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <p className="text-muted-foreground">No pending fees found</p>
                </TableCell>
              </TableRow>
            ) : (
              pendingFees.map((fee) => {
                // Find the product details for this fee
                const product = products.find(p => p.product_id.toString() === fee.data_content.product_id)
                
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.data_content.fee_name}</TableCell>
                    <TableCell>
                      {product ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{product.product_name}</span>
                          <span className="text-xs text-gray-500">
                            ID: {fee.data_content.product_id} | Code: {product.product_code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">ID: {fee.data_content.product_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{fee.data_content.fee_type}</TableCell>
                    <TableCell>
                      {fee.data_content.fee_type === "percentage" 
                        ? `${fee.data_content.percentage_value}%` 
                        : `${fee.data_content.percentage_value}`}
                    </TableCell>
                    <TableCell>{fee.data_content.minimum_amount}</TableCell>
                    <TableCell>{fee.data_content.maximum_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.status === "pending" ? "secondary" : fee.status === "approved" ? "default" : "destructive"}
                        className={
                          fee.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : fee.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
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
                          onClick={() => {
                            setSelectedPendingFee(fee)
                            setApprovalReason("")
                          }}
                          disabled={processingApproval || is2FALoading}
                        >
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedPendingFee && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Preview & Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fee Name</Label>
                  <p className="text-sm font-medium">{selectedPendingFee.data_content.fee_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Product ID</Label>
                  <p className="text-sm">{selectedPendingFee.data_content.product_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fee Type</Label>
                  <p className="text-sm capitalize">{selectedPendingFee.data_content.fee_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Value</Label>
                  <p className="text-sm">
                    {selectedPendingFee.data_content.fee_type === "percentage" 
                      ? `${selectedPendingFee.data_content.percentage_value}%` 
                      : selectedPendingFee.data_content.percentage_value}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Minimum Amount</Label>
                  <p className="text-sm">{selectedPendingFee.data_content.minimum_amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Maximum Amount</Label>
                  <p className="text-sm">{selectedPendingFee.data_content.maximum_amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge
                    variant={selectedPendingFee.status === "pending" ? "secondary" : selectedPendingFee.status === "approved" ? "default" : "destructive"}
                    className={
                      selectedPendingFee.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedPendingFee.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
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
        </div>
      )}

      {/* 2FA Dialog */}
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={is2FALoading}
      />
    </div>
  )
}
