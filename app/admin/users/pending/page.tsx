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

interface PendingUser {
  id: string
  maker_id: string
  checker_id: string | null
  entry_type: string
  status: string
  reason: string | null
  data_content: {
    id: string
    email: string
    password: string
    role: string
    status: string
    first_name: string
    last_name: string
  }
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type SortField = "name" | "created_at"
type SortOrder = "asc" | "desc"

const rejectFormSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters")
})

type RejectFormValues = z.infer<typeof rejectFormSchema>

export default function PendingUsers() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [show2FA, setShow2FA] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  const [confirmUser, setConfirmUser] = useState<PendingUser | null>(null)

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
  const fetchPendingUsers = React.useCallback(async () => {
    if (!hasPermission("users.approve")) return

    try {
      setIsLoading(true)
      const response = await get("/admin/users/pending")
      if (response.status === 200) {
        setPendingUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching pending users:", error)
      toast.error("Failed to fetch pending users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if user has permission to view pending users
    if (!hasPermission('users.approve')) {
      router.push('/admin/dashboard')
      return
    }
  }, [hasPermission, router])

  // Initial fetch and permission check
  useEffect(() => {
    fetchPendingUsers()
  }, [fetchPendingUsers])

  // Handle user actions
  const handleAction = React.useCallback((user: PendingUser, action: "approve" | "reject") => {
    setConfirmUser(user)
    setConfirmAction(action)
    setShowConfirmDialog(true)
  }, [])

  const handleConfirmAction = React.useCallback(() => {
    if (!confirmUser || !confirmAction) return

    if (confirmAction === "reject") {
      setShowRejectDialog(true)
    } else {
      setSelectedUser(confirmUser)
      setAction(confirmAction)
      setShow2FA(true)
    }
    setShowConfirmDialog(false)
  }, [confirmUser, confirmAction])

  const handleRejectSubmit = async (data: RejectFormValues) => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const payload = {
        status: "rejected",
        reason: data.reason,
        token: "", // This will be set by 2FA
      }

      const response = await put(`/admin/users/${selectedUser.id}/add/reject`, payload)

      if (response.status === 201 || response.status === 200) {
        toast.success(response.message || "User rejected successfully")
        fetchPendingUsers()
        setShowRejectDialog(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to reject user")
      }
    } catch (error: any) {
      console.error("Error rejecting user:", error)
      toast.error(error.message || "Failed to reject user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASuccess = React.useCallback(async (token: string) => {
    if (!selectedUser || !action) return

    setIsLoading(true)
    try {
      const payload = {
        status: action === "approve" ? "approved" : "rejected",
        reason: action === "reject" ? rejectionReason : "",
        token,
      }

      const response = await put(`/admin/users/${selectedUser.id}/add/${action}`, payload)

      if (response.status === 201 || response.status === 200) {
        toast.success(response.message || "User added successfully")
        fetchPendingUsers()
      } else {
        throw new Error(response.message || `Failed to ${action} user`)
      }
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(error.message || `Failed to ${action} user`)
    } finally {
      setIsLoading(false)
      setShow2FA(false)
      setSelectedUser(null)
      setAction(null)
      setRejectionReason("")
    }
  }, [selectedUser, action, rejectionReason, fetchPendingUsers])

  const toggleRow = (userId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId)
    } else {
      newExpandedRows.add(userId)
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

  const filteredUsers = pendingUsers.filter(user => {
    const fullName = `${user.data_content.first_name} ${user.data_content.last_name}`.toLowerCase()
    const matchesName = fullName.includes(nameFilter.toLowerCase())
    const matchesMaker = makerFilter === "" || user.maker_id === makerFilter
    return matchesName && matchesMaker
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = sortField === "name" 
      ? `${a.data_content.first_name} ${a.data_content.last_name}`
      : a.created_at
    const bValue = sortField === "name"
      ? `${b.data_content.first_name} ${b.data_content.last_name}`
      : b.created_at
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

  if (!hasPermission("users.approve")) {
    return null
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Users</h1>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
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
                {sortedUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleRow(user.id)}
                    >
                      <TableCell>
                        {expandedRows.has(user.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.data_content.first_name} {user.data_content.last_name}
                      </TableCell>
                      <TableCell>{user.data_content.email}</TableCell>
                      <TableCell>{user.data_content.role}</TableCell>
                      <TableCell>
                        {user.maker_id}
                        <br />
                        <span className="text-sm text-gray-500">Created by ID: {user.maker_id}</span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(user, "approve")
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
                              handleAction(user, "reject")
                            }}
                            disabled={isLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(user.id) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="max-h-[400px] overflow-y-auto">
                            <div className="p-4 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">User Information</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">First Name:</span> {user.data_content.first_name}</p>
                                      <p><span className="font-medium">Last Name:</span> {user.data_content.last_name}</p>
                                      <p><span className="font-medium">Email:</span> {user.data_content.email}</p>
                                      <p><span className="font-medium">Role:</span> {user.data_content.role}</p>
                                      <p><span className="font-medium">Status:</span> {user.data_content.status}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Details</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">Entry Type:</span> {user.entry_type}</p>
                                      <p><span className="font-medium">Status:</span> {user.status}</p>
                                      {user.reason && (
                                        <p><span className="font-medium">Reason:</span> {user.reason}</p>
                                      )}
                                      <p><span className="font-medium">Created At:</span> {format(new Date(user.created_at), "MMM d, yyyy HH:mm")}</p>
                                      <p><span className="font-medium">Maker ID:</span> {user.maker_id}</p>
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
                {sortedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No pending users found
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
              {confirmAction === "approve" ? "Approve User" : "Reject User"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to {confirmAction} this user?
              {confirmAction === "reject" && " You will need to provide a reason."}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
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
            <DialogTitle>Reject User</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleRejectSubmit)}>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for Rejection</Label>
                  <Textarea
                    id="reason"
                    {...form.register("reason")}
                    placeholder="Enter reason for rejection..."
                    className="mt-1"
                  />
                  {form.formState.errors.reason && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.reason.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <TwoFactorAuthDialog
        open={show2FA}
        onOpenChange={setShow2FA}
        onSubmit={handle2FASuccess}
        isLoading={isLoading}
      />
    </div>
  )
} 