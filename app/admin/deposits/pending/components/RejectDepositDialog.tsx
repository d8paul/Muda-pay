"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface RejectDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  transactionId: string | null;
  isLoading: boolean;
}

export default function RejectDepositDialog({
  open,
  onOpenChange,
  onConfirm,
  transactionId,
  isLoading
}: RejectDepositDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Reject Deposit</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to reject this deposit transaction?</p>
          <p className="text-sm text-gray-500 mt-2">Transaction ID: {transactionId}</p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Rejecting..." : "Reject Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
