"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { put } from "@/utils/api"
import toast from "react-hot-toast"

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
  const [localLoading, setLocalLoading] = useState(false)
  const [reason, setReason] = useState("")
  
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
    redirectOnMissing: false
  })

  const isLoading = localLoading || twoFALoading

  const handleClose = (open: boolean) => {
    if (!open) {
      setReason("") // Clear reason when dialog is closed
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    const rejectData = {
      status: "rejected"
    }
    
    await requireTwoFactorAuth(rejectData, rejectDeposit)
  }
  
  const rejectDeposit = async (data: any, token?: string) => {
    if (!depositId) return
    
    setLocalLoading(true)
    try {
      const payload = token ? { ...data, token } : data
      
      await put(`/admin/deposits/${depositId}/approve`, payload)
      // Success is handled by the 2FA hook onSuccess callback
    } catch (error) {
      console.error("Error rejecting deposit:", error)
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
            <p>Are you sure you want to reject this deposit?</p>
            <p className="text-sm text-gray-500">Deposit Reference: {depositId}</p>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejecting this deposit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
              onClick={handleSubmit}
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
