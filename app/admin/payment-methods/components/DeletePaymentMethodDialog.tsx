"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Bank } from "../types"

interface DeletePaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deletingBank: Bank | null
  onConfirm: () => void
  isSubmitting: boolean
}

export default function DeletePaymentMethodDialog({
  open,
  onOpenChange,
  deletingBank,
  onConfirm,
  isSubmitting
}: DeletePaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Payment Method</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this payment method?</p>
          {deletingBank && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{deletingBank.bank_name}</p>
              <p className="text-sm text-gray-600">{deletingBank.account_name}</p>
              <p className="text-sm text-gray-600">{deletingBank.account_number}</p>
            </div>
          )}
          <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
