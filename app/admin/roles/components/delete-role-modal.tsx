"use client"

import { useState } from "react"
import { del } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

interface Role {
  id: string
  name: string
  details: string
  status: "active" | "inactive"
  access_rights: {
    role_access_rights_id: string
    role_id: string
    name: string
    access_rights_status: string
  }[]
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

interface DeleteRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role: Role
}

export default function DeleteRoleModal({ open, onClose, onSuccess, role }: DeleteRoleModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await del(`/admin/roles/${role.id}`)
      toast.success("Role deleted successfully")
      onSuccess()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Failed to delete role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 