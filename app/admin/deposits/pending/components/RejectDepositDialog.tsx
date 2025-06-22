"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import { put } from "@/utils/api"
import toast from "react-hot-toast"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

interface RejectDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  depositId: string | null;
}

export default function RejectDepositDialog({
  open,
  onOpenChange,
  onSuccess,
  depositId
}: RejectDepositDialogProps) {
  console.log("🚀 RejectDepositDialog render - depositId:", depositId) // Debug
  
  const [reason, setReason] = useState("")
  const [localLoading, setLocalLoading] = useState(false)

  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("Deposit rejected successfully")
      setReason("") // Clear reason on success
      onSuccess()
      onOpenChange(false)
    },
    onError: (error) => {
      console.log("🔸 2FA onError called with:", error) // Debug
      
      // The axios interceptor should already show the toast, but let's ensure it
      if (error?.message) {
        toast.error(error.message)
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to reject deposit")
      }
      
      // Close the modal and reset state
      setReason("")
      onOpenChange(false)
    },
    redirectOnMissing: false
  })

  const isLoading = localLoading || twoFALoading

  console.log("🚀 Computed values:", { isLoading, show2FAModal, twoFALoading }) // Debug

  const handleClose = (open: boolean) => {
    console.log("🔧 handleClose called with:", open) // Debug
    if (!open) {
      setReason("") // Clear reason when dialog is closed
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    console.log("🔸 handleSubmit called") // Debug
    console.log("🔸 reason:", reason) // Debug
    console.log("🔸 depositId:", depositId) // Debug
    console.log("🔸 isLoading:", isLoading) // Debug
    
    if (!reason.trim()) {
      console.log("🔸 No reason provided") // Debug
      toast.error("Please provide a reason for rejection")
      return
    }

    if (!depositId) {
      console.log("🔸 No depositId provided") // Debug
      toast.error("Invalid transaction ID")
      return
    }

    const rejectData = {
      status: "rejected"
      // Note: reason is not included in payload as requested
    }
    
    console.log("🔸 Calling requireTwoFactorAuth with:", rejectData) // Debug
    try {
      await requireTwoFactorAuth(rejectData, rejectDeposit)
      console.log("🔸 requireTwoFactorAuth completed") // Debug
    } catch (error) {
      console.error("🔸 Error in requireTwoFactorAuth:", error) // Debug
    }
  }
  
  const rejectDeposit = async (data: any, token?: string) => {
    console.log("🔹 rejectDeposit called with:", { data, token: token ? "***" : "none" }) // Debug
    if (!depositId) {
      console.log("🔹 No depositId in rejectDeposit") // Debug
      return
    }
    
    setLocalLoading(true)
    try {
      const payload = token ? { ...data, token } : data
      console.log("🔹 Making API call to:", `/admin/deposits/${depositId}/approve`) // Debug
      console.log("🔹 Payload:", payload) // Debug
      
      await put(`/admin/deposits/${depositId}/approve`, payload)
      console.log("🔹 API call successful") // Debug
      // Success is handled by the 2FA hook onSuccess callback
    } catch (error) {
      console.error("🔹 Error rejecting deposit:", error)
      throw error // Re-throw to let 2FA hook handle it
    } finally {
      setLocalLoading(false)
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>Are you sure you want to reject this deposit transaction?</p>
            <p className="text-sm text-gray-500">
              Transaction ID: {depositId || "Not provided"}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection *</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejecting this deposit..."
                value={reason}
                onChange={(e) => {
                  console.log("🔧 Reason input changed:", e.target.value) // Debug
                  setReason(e.target.value)
                }}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => {
                console.log("🔥 Button clicked! Event:", e) // Debug
                console.log("🔥 Button disabled?", isLoading) // Debug
                e.preventDefault()
                handleSubmit()
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue with 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />
    </>
  );
}
