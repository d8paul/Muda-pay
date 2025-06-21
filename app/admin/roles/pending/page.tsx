"use client"

import { useState, useEffect } from "react"
import { get, put } from "@/utils/api"
import { useRouter } from "next/navigation"
import { usePermissions } from '@/app/hooks/usePermissions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Search, X, ChevronUp, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface PendingRole {
  id: string
  maker_id: string
  checker_id: string | null
  entry_type: string
  status: string
  reason: string | null
  data_content: {
    id: string
    name: string
    details: string
    status: string
    created_at: string
    access_rights: string[]
  }
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SortField = "name" | "created_at"
type SortOrder = "asc" | "desc"

// Add form schema
const rejectFormSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must not exceed 500 characters")
})

type RejectFormValues = z.infer<typeof rejectFormSchema>

export default function PendingRoles() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [pendingRoles, setPendingRoles] = useState<PendingRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [show2FA, setShow2FA] = useState(false)
  const [selectedRole, setSelectedRole] = useState<PendingRole | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  const [confirmRole, setConfirmRole] = useState<PendingRole | null>(null)

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: ""
    }
  })

  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [makerFilter, setMakerFilter] = useState("")

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Memoize the fetch function
  const fetchPendingRoles = React.useCallback(async () => {
    // if (!hasPermission("roles.approve")) return

    try {
      setIsLoading(true)
      const response = await get("/admin/roles/pending")
      
      if (response && response.data) {
        setPendingRoles(response.data)
      } else if (response && Array.isArray(response)) {
        setPendingRoles(response)
      } else {
        setPendingRoles([])
      }
    } catch (error) {
      console.error("Error fetching pending roles:", error)
      toast.error("Failed to fetch pending roles")
      setPendingRoles([])
    } finally {
      setIsLoading(false)
    }
  }, []) // Remove hasPermission from dependencies
  // useEffect(() => {
  //   // Check if user has permission to view pending roles
  //   if (!hasPermission('roles.approve')) {
  //     router.push('/admin/dashboard')
  //     return
  //   }
  // }, [hasPermission, router])

  // Initial fetch and permission check
  useEffect(() => {
    fetchPendingRoles()
  }, [fetchPendingRoles])

  // Handle role actions
  const handleAction = React.useCallback((role: PendingRole, action: "approve" | "reject") => {
    setConfirmRole(role)
    setConfirmAction(action)
    setShowConfirmDialog(true)
  }, [])

  const handleConfirmAction = React.useCallback(() => {
    if (!confirmRole || !confirmAction) return

    if (confirmAction === "reject") {
      setSelectedRole(confirmRole)
      setAction(confirmAction)
      setShowRejectDialog(true)
    } else {
      setSelectedRole(confirmRole)
      setAction(confirmAction)
      setShow2FA(true)
    }
    setShowConfirmDialog(false)
  }, [confirmRole, confirmAction])

  const handleRejectSubmit = async (data: RejectFormValues) => {
    if (!selectedRole) return

    setRejectionReason(data.reason)
    setShowRejectDialog(false)
    setShow2FA(true)
  }

  const handle2FASuccess = React.useCallback(async (token: string) => {
    if (!selectedRole || !action) return

    setIsLoading(true)
    try {
      const payload = {
        status: action === "approve" ? "approved" : "rejected",
        reason: action === "reject" ? rejectionReason : "",
        token
      }

      const response = await put(`/admin/roles/${selectedRole.id}/edit/approve`, payload)

      if (response.status === 200) {
        toast.success(response.message || `Role ${action}d successfully`)
        fetchPendingRoles()
      } else {
        throw new Error(response.message || `Failed to ${action} role`)
      }
    } catch (error: any) {
      console.error(`Error ${action}ing role:`, error)
      toast.error(error.message || `Failed to ${action} role`)
    } finally {
      setIsLoading(false)
      setShow2FA(false)
      setSelectedRole(null)
      setAction(null)
      setRejectionReason("")
      form.reset()
    }
  }, [selectedRole, action, rejectionReason, fetchPendingRoles, form])

  const toggleRow = (roleId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(roleId)) {
      newExpandedRows.delete(roleId)
    } else {
      newExpandedRows.add(roleId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const clearFilters = () => {
    setNameFilter("")
    setMakerFilter("")
  }

  const filteredRoles = pendingRoles.filter(role => {
    const matchesName = role.data_content.name.toLowerCase().includes(nameFilter.toLowerCase())
    const matchesMaker = makerFilter === "" || role.maker_id === makerFilter
    return matchesName && matchesMaker
  })

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    const aValue = sortField === "name" ? a.data_content.name : a.created_at
    const bValue = sortField === "name" ? b.data_content.name : b.created_at
    return sortOrder === "asc" 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Roles</h1>
        </div>
      </div>

      <ProgressBar isLoading={isLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by maker ID..."
                  value={makerFilter}
                  onChange={(e) => setMakerFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {(nameFilter || makerFilter) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <SortIcon field="name" />
                    </button>
                  </TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("created_at")}
                    >
                      Created At
                      <SortIcon field="created_at" />
                    </button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRoles.map((role) => (
                  <React.Fragment key={role.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleRow(role.id)}
                    >
                      <TableCell>
                        {expandedRows.has(role.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{role.data_content.name}</TableCell>
                      <TableCell>{role.data_content.details || "-"}</TableCell>
                      <TableCell>
                        {role.maker_id}
                        <br />
                        <span className="text-sm text-gray-500">Created by ID: {role.maker_id}</span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(role.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(role, "approve")
                            }}
                            disabled={isLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(role, "reject")
                            }}
                            disabled={isLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(role.id) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="max-h-[400px] overflow-y-auto">
                            <div className="p-4 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Access Rights</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {role.data_content.access_rights.map((right) => (
                                        <Badge key={right} variant="secondary" className="text-xs">
                                          {right}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Details</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">Entry Type:</span> {role.entry_type}</p>
                                      <p><span className="font-medium">Status:</span> {role.status}</p>
                                      {role.reason && (
                                        <p><span className="font-medium">Reason:</span> {role.reason}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Role Information</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">Name:</span> {role.data_content.name}</p>
                                      <p><span className="font-medium">Details:</span> {role.data_content.details || "-"}</p>
                                      <p><span className="font-medium">Created At:</span> {format(new Date(role.created_at), "MMM d, yyyy HH:mm")}</p>
                                      <p><span className="font-medium">Maker ID:</span> {role.maker_id}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
                {sortedRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No pending roles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve Role" : "Reject Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {confirmAction} this role? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={isSubmitting}
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleRejectSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                {...form.register("reason")}
                className="min-h-[100px]"
              />
              {form.formState.errors.reason && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Rejecting..." : "Reject Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TwoFactorAuthDialog
        open={show2FA}
        onOpenChange={setShow2FA}
        onSubmit={handle2FASuccess}
        isLoading={isLoading}
      />
    </div>
  )
} 