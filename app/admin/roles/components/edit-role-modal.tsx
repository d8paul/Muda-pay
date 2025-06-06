"use client"

import { useState, useEffect } from "react"
import { get, put } from "@/utils/api"
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
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface AccessRight {
  id: string
  name: string
  description: string
}

type GroupedAccessRights = {
  [key: string]: {
    title: string
    permissions: AccessRight[]
  }
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

interface EditRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role: Role
}

// Form schema
const editRoleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must not exceed 50 characters"),
  details: z.string().max(500, "Details must not exceed 500 characters").optional(),
  status: z.enum(["active", "inactive"])
})

type EditRoleFormValues = z.infer<typeof editRoleSchema>

export default function EditRoleModal({ open, onClose, onSuccess, role }: EditRoleModalProps) {
  const [accessRights, setAccessRights] = useState<AccessRight[]>([])
  const [selectedRights, setSelectedRights] = useState<string[]>(role.access_rights.map(ar => ar.role_access_rights_id) || [])
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)

  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role.name,
      details: role.details,
      status: role.status
    }
  })

  useEffect(() => {
    if (open) {
      fetchAccessRights()
    }
  }, [open])

  const groupAccessRights = (rights: AccessRight[]): GroupedAccessRights => {
    const groups: GroupedAccessRights = {
      dashboard: {
        title: "Dashboard",
        permissions: []
      },
      users: {
        title: "Users Management",
        permissions: []
      },
      roles: {
        title: "Roles & Permissions",
        permissions: []
      },
      transactions: {
        title: "Transactions",
        permissions: []
      },
      deposits: {
        title: "Deposits",
        permissions: []
      },
      fees: {
        title: "Fees",
        permissions: []
      },
      rates: {
        title: "Rates",
        permissions: []
      },
      business: {
        title: "Business",
        permissions: []
      },
      wallet: {
        title: "Wallet",
        permissions: []
      },
      reports: {
        title: "Reports",
        permissions: []
      },
      settings: {
        title: "Settings",
        permissions: []
      },
      clients: {
        title: "Clients",
        permissions: []
      }
    }

    rights.forEach(right => {
      const [category] = right.name.split('.')
      if (groups[category]) {
        groups[category].permissions.push(right)
      }
    })

    return groups
  }

  const fetchAccessRights = async () => {
    try {
      const response = await get("/admin/roles/access/rights")
      setAccessRights(response.data)
    } catch (error) {
      console.error("Error fetching access rights:", error)
      toast.error("Failed to fetch access rights")
    }
  }

  const handleSubmit = async (data: EditRoleFormValues) => {
    setShow2FA(true)
  }

  const handle2FASuccess = async (token: string) => {
    setIsLoading(true)

    try {
      const formData = form.getValues()
      const payload = {
        name: formData.name,
        details: formData.details || "",
        status: formData.status,
        access_right: selectedRights,
        token
      }

      const response = await put(`/admin/roles/${role.id}`, payload)

      if (response.status === 200) {
        toast.success("Role updated successfully")
        onSuccess()
      } else {
        throw new Error(response.message || "Failed to update role")
      }
    } catch (error: any) {
      console.error("Error updating role:", error)
      toast.error(error.message || "Failed to update role")
    } finally {
      setIsLoading(false)
      setShow2FA(false)
    }
  }

  const handleRightToggle = (rightId: string) => {
    setSelectedRights((prev) =>
      prev.includes(rightId)
        ? prev.filter((id) => id !== rightId)
        : [...prev, rightId]
    )
  }

  const handleGroupToggle = (groupPermissions: AccessRight[]) => {
    const groupIds = groupPermissions.map(right => right.id)
    const allSelected = groupIds.every(id => selectedRights.includes(id))
    
    if (allSelected) {
      // If all are selected, deselect all
      setSelectedRights(prev => prev.filter(id => !groupIds.includes(id)))
    } else {
      // If not all are selected, select all
      setSelectedRights(prev => [...new Set([...prev, ...groupIds])])
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter role name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                {...form.register("details")}
                placeholder="Enter role details"
                rows={3}
              />
              {form.formState.errors.details && (
                <p className="text-sm text-red-500">{form.formState.errors.details.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Access Rights</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedRights.length === accessRights.length) {
                      setSelectedRights([])
                    } else {
                      setSelectedRights(accessRights.map(right => right.id))
                    }
                  }}
                  className="text-xs"
                >
                  {selectedRights.length === accessRights.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="space-y-4 overflow-y-auto p-2 border rounded-md">
                {Object.entries(groupAccessRights(accessRights)).map(([key, group]) => (
                  group.permissions.length > 0 && (
                    <div key={key} className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{group.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {group.permissions.length} permission{group.permissions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleGroupToggle(group.permissions)}
                          className="text-xs"
                        >
                          {group.permissions.every(right => selectedRights.includes(right.id))
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.permissions.map((right) => (
                            <div 
                              key={right.id} 
                              className="flex items-start space-x-3 p-2 rounded-md hover:bg-white transition-colors"
                            >
                              <Checkbox
                                id={right.id}
                                checked={selectedRights.includes(right.id)}
                                onCheckedChange={() => handleRightToggle(right.id)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label
                                  htmlFor={right.id}
                                  className="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                  {right.name.split('.').slice(1).join('.')}
                                </label>
                                {right.description && (
                                  <p className="text-xs text-gray-500">
                                    {right.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TwoFactorAuthDialog
        open={show2FA}
        onOpenChange={setShow2FA}
        onSubmit={handle2FASuccess}
        isLoading={isLoading}
      />
    </>
  )
} 