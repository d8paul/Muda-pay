"use client"

import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, X, Eye, ChevronUp, ChevronDown, Copy } from "lucide-react"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import AddRoleModal from "./components/add-role-modal"
import EditRoleModal from "./components/edit-role-modal"
import DeleteRoleModal from "./components/delete-role-modal"
import ViewRoleModal from "./components/view-role-modal"
import DuplicateRoleModal from "./components/duplicate-role-modal"

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

type SortField = "name" | "status" | "created_at"
type SortOrder = "asc" | "desc"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rightsFilter, setRightsFilter] = useState<string>("all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await get("/admin/roles", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sort_by: sortField,
          sort_order: sortOrder,
          name: nameFilter || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          access_right: rightsFilter !== "all" ? rightsFilter : undefined,
        },
      })
      if (response && Array.isArray(response.data)) {
        setRoles(response.data)
        setFilteredRoles(response.data)
        setTotalItems(response.total || response.data.length)
      } else {
        console.error("Invalid response format:", response)
        toast.error("Invalid response format from server")
        setRoles([])
        setFilteredRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast.error("Failed to fetch roles")
      setRoles([])
      setFilteredRoles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [currentPage, itemsPerPage, sortField, sortOrder])

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1)
    fetchRoles()
  }, [nameFilter, statusFilter, rightsFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleView = (role: Role) => {
    setSelectedRole(role)
    setShowViewModal(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setShowEditModal(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const handleDuplicate = (role: Role) => {
    setSelectedRole(role)
    setShowDuplicateModal(true)
  }

  const clearFilters = () => {
    setNameFilter("")
    setStatusFilter("all")
    setRightsFilter("all")
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Access Roles</h1>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={rightsFilter} onValueChange={setRightsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by access rights" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rights</SelectItem>
                    <SelectItem value="1">Admin Access</SelectItem>
                    <SelectItem value="2">User Management</SelectItem>
                    <SelectItem value="3">Role Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(nameFilter || statusFilter !== "all" || rightsFilter !== "all") && (
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
                    <TableHead>
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        <SortIcon field="status" />
                      </button>
                    </TableHead>
                    <TableHead>Access Rights</TableHead>
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
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.details}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {role.status}
                        </span>
                      </TableCell>
                      <TableCell>{role.access_rights?.length || 0} rights</TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(role)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(role)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRoles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No roles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20 ml-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AddRoleModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          fetchRoles()
        }}
      />

      {selectedRole && (
        <>
          <ViewRoleModal
            open={showViewModal}
            onClose={() => {
              setShowViewModal(false)
              setSelectedRole(null)
            }}
            roleId={selectedRole.id}
          />

          <DuplicateRoleModal
            open={showDuplicateModal}
            onClose={() => {
              setShowDuplicateModal(false)
              setSelectedRole(null)
            }}
            role={selectedRole}
            onSuccess={() => {
              setShowDuplicateModal(false)
              setSelectedRole(null)
              fetchRoles()
            }}
          />

          <EditRoleModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedRole(null)
            }}
            role={selectedRole}
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedRole(null)
              fetchRoles()
            }}
          />

          <DeleteRoleModal
            open={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedRole(null)
            }}
            role={selectedRole}
            onSuccess={() => {
              setShowDeleteModal(false)
              setSelectedRole(null)
              fetchRoles()
            }}
          />
        </>
      )}
    </>
  )
} 