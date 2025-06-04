"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteRateModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteRateModal({ open, onClose, onConfirm }: DeleteRateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Rate</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this rate? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 