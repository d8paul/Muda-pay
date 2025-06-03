import { useState, useEffect } from "react"
import { post, get } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

interface AccessRight {
  id: string
  name: string
  description: string
}

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

interface DuplicateRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role: Role
}

export default function DuplicateRoleModal({ open, onClose, onSuccess, role }: DuplicateRoleModalProps) {
  const [name, setName] = useState(`${role.name} (Copy)`)
  const [details, setDetails] = useState(role.details)
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [isLoading, setIsLoading] = useState(false)
  const [accessRights, setAccessRights] = useState<AccessRight[]>([])
  const [selectedRights, setSelectedRights] = useState<string[]>(role.access_rights.map(ar => ar.role_access_rights_id) || [])

  useEffect(() => {
    if (open) {
      fetchAccessRights()
    }
  }, [open])

  const fetchAccessRights = async () => {
    try {
      const response = await get("/admin/roles/access/rights")
      setAccessRights(response.data)
    } catch (error) {
      console.error("Error fetching access rights:", error)
      toast.error("Failed to fetch access rights")
    }
  }

  const handleRightToggle = (rightId: string) => {
    setSelectedRights((prev) =>
      prev.includes(rightId)
        ? prev.filter((id) => id !== rightId)
        : [...prev, rightId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await post("/admin/roles", {
        name,
        details,
        status,
        access_rights: selectedRights.map(id => ({ role_access_rights_id: id })),
      })

      toast.success("Role duplicated successfully")
      onSuccess()
    } catch (error) {
      console.error("Error duplicating role:", error)
      toast.error("Failed to duplicate role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Duplicate Role</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter role details"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "active" | "inactive") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Access Rights</Label>
              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                {accessRights.map((right) => (
                  <div key={right.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={right.id}
                      checked={selectedRights.includes(right.id)}
                      onCheckedChange={() => handleRightToggle(right.id)}
                    />
                    <label
                      htmlFor={right.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {right.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Duplicating..." : "Duplicate Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 