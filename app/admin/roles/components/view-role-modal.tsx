import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { CheckCircle } from "lucide-react"

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

interface ViewRoleModalProps {
  open: boolean
  onClose: () => void
  roleId: string
}

export default function ViewRoleModal({ open, onClose, roleId }: ViewRoleModalProps) {
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && roleId) {
      fetchRoleDetails()
    }
  }, [open, roleId])

  const fetchRoleDetails = async () => {
    setIsLoading(true)
    try {
      const response = await get(`/admin/roles/${roleId}`)
      setRole(response.data)
    } catch (error) {
      console.error("Error fetching role details:", error)
      toast.error("Failed to fetch role details")
    } finally {
      setIsLoading(false)
    }
  }

  if (!role) return null

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{role.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {role.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{role.details}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Access Rights</h3>
              <div className="space-y-2">
                {role.access_rights.map((right) => (
                  <div key={right.role_access_rights_id} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{right.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="mt-1">{new Date(role.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{new Date(role.updated_at || "").toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 