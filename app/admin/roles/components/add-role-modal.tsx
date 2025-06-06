"use client"

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
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

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

interface AddRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddRoleModal({ open, onClose, onSuccess }: AddRoleModalProps) {
  const [name, setName] = useState("")
  const [details, setDetails] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [accessRights, setAccessRights] = useState<AccessRight[]>([])
  const [selectedRights, setSelectedRights] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShow2FA(true)
  }

  const handle2FASuccess = async (token: string) => {
    setIsLoading(true)

    try {
      const response = await post("/admin/roles", {
        name,
        details,
        status,
        token,
        access_right: selectedRights,
      })

      if (response.status === 201) {
        toast.success("Role created successfully")
        onSuccess()
      } else {
        throw new Error(response.message || "Failed to create role")
      }
    } catch (error: any) {
      console.error("Error creating role:", error)
      toast.error(error.message || "Failed to create role")
    } finally {
      setIsLoading(false)
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
            <DialogTitle>Add New Role</DialogTitle>
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
                {isLoading ? "Creating..." : "Create Role"}
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