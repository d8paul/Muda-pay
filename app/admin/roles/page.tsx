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
import { Plus, Pencil, Trash2, Search, X } from "lucide-react"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import AddRoleModal from "./components/add-role-modal"
import EditRoleModal from "./components/edit-role-modal"
import DeleteRoleModal from "./components/delete-role-modal"

interface Role {
  id: number
  name: string
  details: string
  status: "active" | "inactive"
  access_right: string[]
  created_at: string
  updated_at: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rightsFilter, setRightsFilter] = useState<string>("all")

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await get("/admin/roles")
      if (response && Array.isArray(response.data)) {
        setRoles(response.data)
        setFilteredRoles(response.data)
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
  }, [])

  useEffect(() => {
    let filtered = [...roles]

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter((role) =>
        role.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((role) => role.status === statusFilter)
    }

    // Apply rights filter
    if (rightsFilter !== "all") {
      filtered = filtered.filter((role) => role.access_right.includes(rightsFilter))
    }

    setFilteredRoles(filtered)
  }, [roles, nameFilter, statusFilter, rightsFilter])

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setShowEditModal(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const clearFilters = () => {
    setNameFilter("")
    setStatusFilter("all")
    setRightsFilter("all")
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
                    {/* Add more access rights as needed */}
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
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Access Rights</TableHead>
                    <TableHead>Created At</TableHead>
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
                      <TableCell>{role.access_right?.length || 0} rights</TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
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